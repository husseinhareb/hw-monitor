use crate::cpu_utils::{PerCoreCpuState, PerfCpuState};
use crate::sensors;
use serde::{Deserialize, Serialize};
use std::collections::BTreeSet;
use std::fs;
use std::sync::Mutex;
use std::time::{Duration, Instant};

#[derive(Serialize, Deserialize)]
pub struct CpuInformations {
    name: Option<String>,
    socket: Option<String>,
    cores: Option<String>,
    threads: Option<String>,
    live_threads: Option<String>,
    usage: Option<i64>,
    core_usages: Option<Vec<i64>>,
    current_speed: Option<String>,
    base_speed: Option<String>,
    max_speed: Option<String>,
    virtualization: Option<String>,
    virtual_machine: Option<String>,
    uptime: Option<String>,
    temperature: Option<String>,
    cache_l1: Option<String>,
    cache_l2: Option<String>,
    cache_l3: Option<String>,
}

/// Static CPU info that never changes at runtime, cached after first read.
#[derive(Clone)]
struct StaticCpuInfo {
    name: String,
    cores: String,
    threads: String,
    virtualization: String,
    virtual_machine: String,
    num_sockets: usize,
    base_speed: Option<String>,
    max_speed: Option<String>,
    cache_l1: Option<String>,
    cache_l2: Option<String>,
    cache_l3: Option<String>,
}

/// Global one-shot cache for static CPU fields.
static STATIC_CPU: std::sync::OnceLock<Option<StaticCpuInfo>> = std::sync::OnceLock::new();
static LIVE_THREAD_CACHE: std::sync::OnceLock<Mutex<Option<(Instant, String)>>> =
    std::sync::OnceLock::new();
static CPU_TEMPERATURE_CACHE: std::sync::OnceLock<Mutex<Option<(Instant, String)>>> =
    std::sync::OnceLock::new();

const LIVE_THREAD_TTL: Duration = Duration::from_secs(2);
const CPU_TEMPERATURE_TTL: Duration = Duration::from_secs(2);

fn get_static_cpu_info() -> Option<&'static StaticCpuInfo> {
    STATIC_CPU
        .get_or_init(|| {
            let cpu_info = fs::read_to_string("/proc/cpuinfo").ok()?;
            let (name, cores, threads, virtualization, virtual_machine, num_sockets) =
                parse_static_fields(&cpu_info)?;
            let base_speed = read_sysfs_freq("/sys/devices/system/cpu/cpu0/cpufreq/base_frequency")
                .or_else(|| {
                    read_sysfs_freq("/sys/devices/system/cpu/cpu0/cpufreq/cpuinfo_min_freq")
                });
            let max_speed =
                read_sysfs_freq("/sys/devices/system/cpu/cpu0/cpufreq/cpuinfo_max_freq");
            let (cache_l1, cache_l2, cache_l3) = read_cache_sizes();
            Some(StaticCpuInfo {
                name,
                cores,
                threads,
                virtualization,
                virtual_machine,
                num_sockets,
                base_speed,
                max_speed,
                cache_l1,
                cache_l2,
                cache_l3,
            })
        })
        .as_ref()
}

/// Read L1/L2/L3 cache sizes from sysfs.
///
/// Iterates the cache topology of every online CPU. Per-core caches (L1 data,
/// L2) are multiplied by the number of logical CPUs that have a private
/// instance of that cache. Shared caches (L3 on most x86 processors) are
/// counted once by deduplicating identical `shared_cpu_map` bitmasks.
fn read_cache_sizes() -> (Option<String>, Option<String>, Option<String>) {
    use std::collections::HashSet;

    let mut l1_kb: u64 = 0;
    let mut l2_kb: u64 = 0;
    let mut l3_kb: u64 = 0;

    // Deduplicate shared caches by the set of CPUs that share them.
    let mut seen_l2 = HashSet::new();
    let mut seen_l3 = HashSet::new();

    // Walk every online CPU, not just cpu0, so that per-core totals are correct.
    for cpu_entry in fs::read_dir("/sys/devices/system/cpu/").into_iter().flatten().flatten() {
        let cpu_name = cpu_entry.file_name();
        let cpu_name = cpu_name.to_string_lossy();
        if !cpu_name.starts_with("cpu") || !cpu_name[3..].chars().all(|c| c.is_ascii_digit()) {
            continue;
        }

        let cache_dir = cpu_entry.path().join("cache");
        let Ok(entries) = fs::read_dir(&cache_dir) else { continue };

        for entry in entries.flatten() {
            let p = entry.path();
            let level = fs::read_to_string(p.join("level"))
                .ok()
                .and_then(|s| s.trim().parse::<u8>().ok());
            let size_kb = fs::read_to_string(p.join("size")).ok().and_then(|s| {
                s.trim()
                    .strip_suffix('K')
                    .and_then(|n| n.parse::<u64>().ok())
            });
            let cache_type = fs::read_to_string(p.join("type"))
                .map(|s| s.trim().to_lowercase())
                .unwrap_or_default();

            // Read the CPU-sharing map to tell per-core from shared caches.
            let shared_map = fs::read_to_string(p.join("shared_cpu_map"))
                .ok()
                .map(|s| s.trim().to_string())
                .unwrap_or_default();

            match (level, size_kb) {
                (Some(1), Some(kb)) if cache_type != "instruction" => {
                    // L1 data cache is always per-core — never deduplicated.
                    // L1 instruction cache ("instruction" type) is excluded
                    // intentionally: the UI labels this as "L1" but only the
                    // data cache is meaningful for most monitoring use cases,
                    // and summing L1i + L1d would mislead users into thinking
                    // the total L1 is larger than it practically is.
                    l1_kb += kb;
                }
                (Some(2), Some(kb)) => {
                    if seen_l2.insert(shared_map) {
                        l2_kb += kb;
                    }
                }
                (Some(3), Some(kb)) => {
                    if seen_l3.insert(shared_map) {
                        l3_kb += kb;
                    }
                }
                _ => {}
            }
        }
    }

    let fmt = |kb: u64| -> String {
        if kb >= 1024 {
            format!("{:.2} MiB", kb as f64 / 1024.0)
        } else {
            format!("{} KiB", kb)
        }
    };
    (
        if l1_kb > 0 { Some(fmt(l1_kb)) } else { None },
        if l2_kb > 0 { Some(fmt(l2_kb)) } else { None },
        if l3_kb > 0 { Some(fmt(l3_kb)) } else { None },
    )
}

/// Count live threads by summing task entries across /proc/*/task/.
fn get_live_thread_count() -> Option<String> {
    let mut count: usize = 0;
    for entry in fs::read_dir("/proc").ok()?.flatten() {
        let name = entry.file_name();
        let name_str = name.to_string_lossy();
        if name_str.chars().all(char::is_numeric) {
            let task_path = entry.path().join("task");
            if let Ok(tasks) = fs::read_dir(&task_path) {
                count += tasks.count();
            }
        }
    }
    Some(count.to_string())
}

fn cached_value<F>(
    cache: &'static std::sync::OnceLock<Mutex<Option<(Instant, String)>>>,
    ttl: Duration,
    loader: F,
) -> Option<String>
where
    F: FnOnce() -> Option<String>,
{
    let cache = cache.get_or_init(|| Mutex::new(None));

    if let Ok(guard) = cache.lock() {
        if let Some((timestamp, value)) = guard.as_ref() {
            if timestamp.elapsed() < ttl {
                return Some(value.clone());
            }
        }
    }

    let value = loader()?;

    if let Ok(mut guard) = cache.lock() {
        *guard = Some((Instant::now(), value.clone()));
    }

    Some(value)
}

fn get_cached_live_thread_count() -> Option<String> {
    cached_value(&LIVE_THREAD_CACHE, LIVE_THREAD_TTL, get_live_thread_count)
}

/// Read a frequency value from sysfs (KHz string).
fn read_sysfs_freq(path: &str) -> Option<String> {
    fs::read_to_string(path)
        .ok()
        .map(|s| s.trim().to_string())
        .filter(|s| !s.is_empty())
}

/// Extract static fields from /proc/cpuinfo (name, cores, threads, virt, vm, sockets).
pub fn parse_static_fields(
    cpu_info: &str,
) -> Option<(String, String, String, String, String, usize)> {
    let mut cpu_name = None;
    let mut cores = None;
    let mut threads = None;
    let mut virtualization = None;
    let mut is_vm = false;
    let mut counted_sockets = BTreeSet::new();

    for line in cpu_info.lines() {
        if line.starts_with("model name") {
            if cpu_name.is_none() {
                cpu_name = line.split(':').nth(1).map(|s| s.trim().to_string());
            }
        } else if line.starts_with("cpu cores") {
            if cores.is_none() {
                cores = line.split(':').nth(1).map(|s| s.trim().to_string());
            }
        } else if line.starts_with("siblings") {
            if threads.is_none() {
                threads = line.split(':').nth(1).map(|s| s.trim().to_string());
            }
        } else if line.starts_with("flags") {
            if virtualization.is_none() {
                let flags: Vec<&str> = line.split_whitespace().skip(1).collect();
                let has_virt = flags.contains(&"vmx") || flags.contains(&"svm");
                virtualization = Some(
                    if has_virt { "Enabled" } else { "Disabled" }.to_string(),
                );
            }
            let flags: Vec<&str> = line.split_whitespace().skip(1).collect();
            if flags.contains(&"hypervisor") {
                is_vm = true;
            }
        } else if line.starts_with("physical id") {
            if let Some(id) = line.split(':').nth(1).map(|s| s.trim().to_string()) {
                counted_sockets.insert(id);
            }
        }
    }

    let num_sockets = counted_sockets.len().max(1);
    let total_cores = cores?.parse::<usize>().ok()?.saturating_mul(num_sockets);
    let total_threads = threads?.parse::<usize>().ok()?.saturating_mul(num_sockets);

    // Also check /sys/class/dmi/id/sys_vendor as a fallback
    let vm_str = if is_vm {
        "Yes".to_string()
    } else {
        let vendor = fs::read_to_string("/sys/class/dmi/id/sys_vendor")
            .map(|s| s.trim().to_lowercase())
            .unwrap_or_default();
        let vm_vendors = [
            "qemu",
            "kvm",
            "vmware",
            "virtualbox",
            "xen",
            "bochs",
            "hyper-v",
            "microsoft corporation",
        ];
        if vm_vendors.iter().any(|v| vendor.contains(v)) {
            "Yes".to_string()
        } else {
            "No".to_string()
        }
    };

    Some((
        cpu_name?,
        total_cores.to_string(),
        total_threads.to_string(),
        virtualization.unwrap_or_default(),
        vm_str,
        num_sockets,
    ))
}

/// Read per-core MHz from /proc/cpuinfo and return average in GHz.
fn get_current_speed() -> Option<String> {
    let cpu_info = fs::read_to_string("/proc/cpuinfo").ok()?;
    let mut speeds = Vec::new();
    for line in cpu_info.lines() {
        if line.contains("cpu MHz") {
            if let Some(val) = line
                .split(':')
                .nth(1)
                .and_then(|s| s.trim().parse::<f64>().ok())
            {
                speeds.push(val);
            }
        }
    }
    if speeds.is_empty() {
        return None;
    }
    let avg_ghz = speeds.iter().sum::<f64>() / speeds.len() as f64 / 1000.0;
    Some(format!("{:.2}", avg_ghz))
}

pub fn uptime_to_hms(uptime_seconds: f64) -> String {
    let hours = (uptime_seconds / 3600.0) as u64;
    let minutes = ((uptime_seconds % 3600.0) / 60.0) as u64;
    let seconds = (uptime_seconds % 60.0) as u64;
    format!("{:02}:{:02}:{:02}", hours, minutes, seconds)
}

fn get_cpu_usage_percentage(state: &PerfCpuState) -> Option<i64> {
    crate::cpu_utils::calc_cpu_usage(&state.0).map(|u| u as i64)
}

fn get_cpu_temperature() -> Option<String> {
    let hwmon_data = sensors::get_hwmon_data();
    for hwmon in hwmon_data {
        for sensor in hwmon.sensors {
            if sensor.name.contains("core") || sensor.name.contains("Package") {
                return Some(format!("{:.1} °C", sensor.value));
            }
        }
    }
    None
}

fn get_cached_cpu_temperature() -> Option<String> {
    cached_value(
        &CPU_TEMPERATURE_CACHE,
        CPU_TEMPERATURE_TTL,
        get_cpu_temperature,
    )
}

fn get_cpu_info(prev_cpu: &PerfCpuState, per_core: &PerCoreCpuState) -> Option<CpuInformations> {
    let static_info = get_static_cpu_info()?;

    let uptime_seconds = fs::read_to_string("/proc/uptime")
        .ok()?
        .split_whitespace()
        .next()?
        .parse::<f64>()
        .ok()?;

    let core_usages = crate::cpu_utils::calc_per_core_usage(per_core)
        .map(|v| v.into_iter().map(|u| u as i64).collect());

    Some(CpuInformations {
        name: Some(static_info.name.clone()),
        cores: Some(static_info.cores.clone()),
        threads: Some(static_info.threads.clone()),
        live_threads: get_cached_live_thread_count(),
        usage: get_cpu_usage_percentage(prev_cpu),
        core_usages,
        base_speed: static_info.base_speed.clone(),
        current_speed: get_current_speed(),
        max_speed: static_info.max_speed.clone(),
        virtualization: Some(static_info.virtualization.clone()),
        virtual_machine: Some(static_info.virtual_machine.clone()),
        socket: Some(static_info.num_sockets.to_string()),
        uptime: Some(uptime_to_hms(uptime_seconds)),
        temperature: get_cached_cpu_temperature(),
        cache_l1: static_info.cache_l1.clone(),
        cache_l2: static_info.cache_l2.clone(),
        cache_l3: static_info.cache_l3.clone(),
    })
}

#[tauri::command]
pub async fn get_cpu_informations(
    prev_cpu: tauri::State<'_, PerfCpuState>,
    per_core: tauri::State<'_, PerCoreCpuState>,
) -> Result<Option<CpuInformations>, String> {
    Ok(get_cpu_info(&prev_cpu, &per_core))
}
