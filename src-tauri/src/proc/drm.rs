//! Per-process GPU usage from the kernel's DRM client stats in
//! `/proc/<pid>/fdinfo/<fd>` (https://docs.kernel.org/gpu/drm-usage-stats.html).
//! Works for amdgpu, i915, xe, nouveau and other drivers that implement it;
//! the proprietary NVIDIA driver does not.

use std::collections::HashMap;
use std::fs;

#[derive(Debug, Default, Clone, PartialEq)]
pub struct DrmEngine {
    /// Busy time in ns, or busy cycles when `total_cycles` is set.
    pub busy: u64,
    /// Total cycles (xe reports utilisation as busy/total cycles, not ns).
    pub total_cycles: Option<u64>,
    /// Number of engines of this class (`drm-engine-capacity-*`), default 1.
    pub capacity: u64,
}

#[derive(Debug, Default, Clone, PartialEq)]
pub struct DrmClient {
    pub engines: HashMap<String, DrmEngine>,
    /// Memory resident in VRAM, or in every non-CPU region for GPUs without VRAM.
    pub memory_bytes: u64,
}

/// Every DRM client a process holds, keyed by "<pdev>/<client-id>". Several fds
/// can refer to the same client, so keying dedupes them.
pub type DrmClients = HashMap<String, DrmClient>;

fn parse_size(value: &str) -> Option<u64> {
    let mut parts = value.split_whitespace();
    let n: u64 = parts.next()?.parse().ok()?;
    let mult = match parts.next() {
        None => 1,
        Some("KiB") => 1024,
        Some("MiB") => 1024 * 1024,
        Some("GiB") => 1024 * 1024 * 1024,
        Some(_) => return None,
    };
    Some(n * mult)
}

/// Parse one fdinfo file. Returns the client key and its stats, or None when
/// the fd is not a DRM client.
pub fn parse_drm_fdinfo(content: &str) -> Option<(String, DrmClient)> {
    let mut client_id = None;
    let mut pdev = "";
    let mut client = DrmClient::default();
    let mut vram_resident = None;
    let mut vram_legacy = None;
    let mut other_resident = 0u64;

    for line in content.lines() {
        let Some((key, value)) = line.split_once(':') else { continue };
        let value = value.trim();
        if key == "drm-client-id" {
            client_id = Some(value);
        } else if key == "drm-pdev" {
            pdev = value;
        } else if let Some(name) = key.strip_prefix("drm-engine-capacity-") {
            client.engines.entry(name.to_string()).or_default().capacity =
                value.parse().unwrap_or(1);
        } else if let Some(name) = key.strip_prefix("drm-engine-") {
            if let Some(ns) = value.strip_suffix("ns").and_then(|v| v.trim().parse().ok()) {
                client.engines.entry(name.to_string()).or_default().busy = ns;
            }
        } else if let Some(name) = key.strip_prefix("drm-total-cycles-") {
            client.engines.entry(name.to_string()).or_default().total_cycles = value.parse().ok();
        } else if let Some(name) = key.strip_prefix("drm-cycles-") {
            if let Ok(cycles) = value.parse() {
                client.engines.entry(name.to_string()).or_default().busy = cycles;
            }
        } else if key == "drm-resident-vram" {
            vram_resident = parse_size(value);
        } else if key == "drm-memory-vram" {
            vram_legacy = parse_size(value);
        } else if let Some(region) = key.strip_prefix("drm-resident-") {
            if region != "cpu" {
                other_resident += parse_size(value).unwrap_or(0);
            }
        }
    }

    for engine in client.engines.values_mut() {
        engine.capacity = engine.capacity.max(1);
    }
    client.memory_bytes = vram_resident.or(vram_legacy).unwrap_or(other_resident);
    Some((format!("{pdev}/{}", client_id?), client))
}

/// Read every DRM client held by `pid`. Empty for processes that never opened
/// a GPU, and for other users' processes when unprivileged.
pub fn read_drm_clients(pid: i32) -> DrmClients {
    let mut clients = DrmClients::new();
    let Ok(fds) = fs::read_dir(format!("/proc/{pid}/fd")) else {
        return clients;
    };
    for fd in fds.flatten() {
        let is_drm = fs::read_link(fd.path())
            .map(|target| target.starts_with("/dev/dri/"))
            .unwrap_or(false);
        if !is_drm {
            continue;
        }
        let fdinfo = format!("/proc/{pid}/fdinfo/{}", fd.file_name().to_string_lossy());
        if let Some((key, client)) = fs::read_to_string(fdinfo).ok().as_deref().and_then(parse_drm_fdinfo) {
            clients.entry(key).or_insert(client);
        }
    }
    clients
}

/// GPU utilisation in percent between two samples of the same process: the
/// busiest engine of any client, like Task Manager's per-process GPU column.
pub fn gpu_usage_percent(prev: &DrmClients, cur: &DrmClients, elapsed_ns: f64) -> f64 {
    let mut max = 0.0f64;
    for (key, client) in cur {
        let Some(prev_client) = prev.get(key) else { continue };
        for (name, engine) in &client.engines {
            let Some(prev_engine) = prev_client.engines.get(name) else { continue };
            let busy = engine.busy.saturating_sub(prev_engine.busy) as f64;
            let usage = match (engine.total_cycles, prev_engine.total_cycles) {
                (Some(total), Some(prev_total)) if total > prev_total => {
                    busy / (total - prev_total) as f64
                }
                (None, None) if elapsed_ns > 0.0 => busy / elapsed_ns / engine.capacity as f64,
                _ => continue,
            };
            max = max.max(usage * 100.0);
        }
    }
    max.min(100.0)
}

pub fn gpu_memory_bytes(clients: &DrmClients) -> u64 {
    clients.values().map(|c| c.memory_bytes).sum()
}
