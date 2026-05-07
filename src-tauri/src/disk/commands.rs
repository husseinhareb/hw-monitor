// src-tauri/src/disk.rs

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::ffi::CString;
use std::fs::{self, File};
use std::io::{BufRead, BufReader};
use std::path::Path;
use std::sync::Mutex;
use std::time::Instant;

struct DiskStat {
    name: String,
    reads_completed: u64,
    sectors_read: u64,
    writes_completed: u64,
    sectors_written: u64,
    io_in_progress: u64,
    io_time_ms: u64,
    weighted_io_time_ms: u64,
    discards_completed: u64,
    sectors_discarded: u64,
    flushes_completed: u64,
}

fn read_diskstats() -> Result<Vec<DiskStat>, String> {
    let content = fs::read_to_string("/proc/diskstats").map_err(|e| e.to_string())?;
    let mut stats = Vec::new();
    for line in content.lines() {
        let fields: Vec<&str> = line.split_whitespace().collect();
        if fields.len() >= 14 {
            let parse = |idx: usize| fields.get(idx).and_then(|s| s.parse().ok()).unwrap_or(0);
            let name = fields[2].to_string();
            stats.push(DiskStat {
                name,
                reads_completed: parse(3),
                sectors_read: parse(5),
                writes_completed: parse(7),
                sectors_written: parse(9),
                io_in_progress: parse(11),
                io_time_ms: parse(12),
                weighted_io_time_ms: parse(13),
                discards_completed: parse(14),
                sectors_discarded: parse(16),
                flushes_completed: parse(18),
            });
        }
    }
    Ok(stats)
}

// /proc/partitions reports size in 1024-byte blocks
const BLOCK_SIZE: u64 = 1024;

fn get_sector_size(disk_name: &str) -> u64 {
    let path = format!("/sys/block/{}/queue/hw_sector_size", disk_name);
    fs::read_to_string(&path)
        .ok()
        .and_then(|s| s.trim().parse().ok())
        .unwrap_or(512)
}

struct MountInfo {
    mount_point: String,
    file_system: String,
}

fn read_mount_info() -> HashMap<String, MountInfo> {
    let mut map = HashMap::new();
    let content = match fs::read_to_string("/proc/mounts") {
        Ok(c) => c,
        Err(_) => return map,
    };
    for line in content.lines() {
        let fields: Vec<&str> = line.split_whitespace().collect();
        if fields.len() >= 3 {
            let device = fields[0].to_string();
            map.insert(
                device,
                MountInfo {
                    mount_point: fields[1].to_string(),
                    file_system: fields[2].to_string(),
                },
            );
        }
    }
    map
}

fn get_space_info(mount_point: &str) -> Option<(u64, u64)> {
    let c_path = CString::new(mount_point).ok()?;
    let mut buf: libc::statvfs = unsafe { std::mem::zeroed() };
    let ret = unsafe { libc::statvfs(c_path.as_ptr(), &mut buf) };
    if ret == 0 {
        let total = buf.f_blocks * buf.f_frsize;
        let available = buf.f_bavail * buf.f_frsize;
        Some((total, available))
    } else {
        None
    }
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Partition {
    pub name: String,
    pub dev_path: String,
    pub major: u32,
    pub minor: u32,
    pub size: u64,
    pub partition_number: Option<u64>,
    pub partuuid: Option<String>,
    pub start_sector: Option<u64>,
    pub read_only: Option<bool>,
    pub alignment_offset: Option<u64>,
    pub discard_alignment: Option<u64>,
    pub holders: Vec<String>,
    pub available_space: Option<u64>,
    pub total_space: Option<u64>,
    pub used_space: Option<u64>,
    pub file_system: Option<String>,
    pub mount_point: Option<String>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Disk {
    pub name: String,
    pub dev_path: String,
    pub major: u32,
    pub minor: u32,
    pub sysfs_path: Option<String>,
    pub model: Option<String>,
    pub vendor: Option<String>,
    pub serial: Option<String>,
    pub firmware_rev: Option<String>,
    pub wwid: Option<String>,
    pub transport: Option<String>,
    pub device_state: Option<String>,
    pub size: u64,
    pub partitions: Vec<Partition>,
    pub rotational: bool,
    pub physical_block_size: u64,
    pub logical_block_size: u64,
    pub removable: bool,
    pub read_only: bool,
    pub trim_supported: bool,
    pub scheduler: Option<String>,
    pub active_scheduler: Option<String>,
    pub available_schedulers: Vec<String>,
    pub write_cache: Option<String>,
    pub queue_depth: Option<u64>,
    pub read_ahead_kb: Option<u64>,
    pub max_sectors_kb: Option<u64>,
    pub max_hw_sectors_kb: Option<u64>,
    pub minimum_io_size: Option<u64>,
    pub optimal_io_size: Option<u64>,
    pub discard_granularity: Option<u64>,
    pub discard_max_bytes: Option<u64>,
    pub discard_zeroes_data: Option<bool>,
    pub fua: Option<bool>,
    pub dax: Option<bool>,
    pub zoned: Option<String>,
    pub nr_zones: Option<u64>,
    pub numa_node: Option<i64>,
    pub queue_count: Option<u64>,
    pub controller_id: Option<String>,
    pub controller_address: Option<String>,
    pub subsystem_nqn: Option<String>,
    pub holders: Vec<String>,
    pub slaves: Vec<String>,

    pub read_speed: String,  // KB/s
    pub write_speed: String, // KB/s
    pub read_iops: String,
    pub write_iops: String,
    pub io_busy_percent: String,
    pub total_read: u64,  // bytes
    pub total_write: u64, // bytes
    pub total_discarded: u64,
    pub total_reads: u64,
    pub total_writes: u64,
    pub total_discards: u64,
    pub total_flushes: u64,
    pub io_in_progress: u64,
    pub io_time_ms: u64,
    pub weighted_io_time_ms: u64,
}

fn get_sysfs_value(disk_name: &str, sub_path: &str) -> Option<String> {
    let path = format!("/sys/block/{}/{}", disk_name, sub_path);
    fs::read_to_string(&path).ok().map(|s| s.trim().to_string())
}

fn read_trimmed<P: AsRef<Path>>(path: P) -> Option<String> {
    fs::read_to_string(path)
        .ok()
        .map(|s| s.trim().to_string())
        .filter(|s| !s.is_empty())
}

fn read_u64<P: AsRef<Path>>(path: P) -> Option<u64> {
    read_trimmed(path)?.parse().ok()
}

fn read_i64<P: AsRef<Path>>(path: P) -> Option<i64> {
    read_trimmed(path)?.parse().ok()
}

fn read_bool<P: AsRef<Path>>(path: P) -> Option<bool> {
    read_u64(path).map(|value| value != 0)
}

fn read_uevent<P: AsRef<Path>>(path: P) -> HashMap<String, String> {
    let mut values = HashMap::new();
    let Some(content) = read_trimmed(path) else {
        return values;
    };

    for line in content.lines() {
        if let Some((key, value)) = line.split_once('=') {
            values.insert(key.to_string(), value.to_string());
        }
    }

    values
}

fn read_dir_names<P: AsRef<Path>>(path: P) -> Vec<String> {
    let Ok(entries) = fs::read_dir(path) else {
        return Vec::new();
    };

    let mut names: Vec<String> = entries
        .flatten()
        .filter_map(|entry| entry.file_name().into_string().ok())
        .collect();
    names.sort();
    names
}

fn dev_path_for_sys_block_name(name: &str) -> Option<String> {
    let valid_name = !name.is_empty()
        && !name.contains('/')
        && !name.contains('\0')
        && name != "."
        && name != "..";

    valid_name.then(|| format!("/dev/{name}"))
}

pub(crate) fn is_allowed_smart_dev_path(dev_path: &str) -> bool {
    read_dir_names("/sys/block")
        .iter()
        .filter_map(|name| dev_path_for_sys_block_name(name))
        .any(|allowed_path| allowed_path == dev_path)
}

fn canonical_path<P: AsRef<Path>>(path: P) -> Option<String> {
    fs::canonicalize(path)
        .ok()
        .map(|p| p.to_string_lossy().to_string())
}

fn parse_scheduler(raw: Option<&String>) -> (Option<String>, Vec<String>) {
    let Some(raw) = raw else {
        return (None, Vec::new());
    };

    let mut active = None;
    let mut available = Vec::new();
    for token in raw.split_whitespace() {
        if token.starts_with('[') && token.ends_with(']') {
            let scheduler = token.trim_matches(&['[', ']'][..]).to_string();
            active = Some(scheduler.clone());
            available.push(scheduler);
        } else {
            available.push(token.to_string());
        }
    }

    (active, available)
}

fn infer_transport(
    disk_name: &str,
    sysfs_path: Option<&String>,
    transport: Option<String>,
) -> Option<String> {
    if transport.is_some() {
        return transport;
    }

    let path = sysfs_path.map(|s| s.as_str()).unwrap_or_default();
    if disk_name.starts_with("nvme") || path.contains("/nvme/") {
        Some("nvme".to_string())
    } else if disk_name.starts_with("vd") || path.contains("/virtio") {
        Some("virtio".to_string())
    } else if disk_name.starts_with("mmcblk") || path.contains("/mmc") {
        Some("mmc".to_string())
    } else if path.contains("/usb") {
        Some("usb".to_string())
    } else if path.contains("/ata") {
        Some("sata".to_string())
    } else if disk_name.starts_with("sd") {
        Some("scsi".to_string())
    } else if disk_name.starts_with("loop") {
        Some("loop".to_string())
    } else {
        None
    }
}

fn get_disk_partition_info() -> Vec<Disk> {
    let mut disks: Vec<Disk> = Vec::new();
    if let Ok(file) = File::open("/proc/partitions") {
        let reader = BufReader::new(file);

        for line in reader.lines().skip(2).flatten() {
            let parts: Vec<&str> = line.split_whitespace().collect();
            if parts.len() >= 4 {
                let major = parts[0].parse().unwrap_or(0);
                let minor = parts[1].parse().unwrap_or(0);
                let name = parts[3].to_string();
                let size: u64 = parts[2].parse().unwrap_or(0) * BLOCK_SIZE;

                let sys_block_path = format!("/sys/block/{}", name);
                let is_base_disk = std::path::Path::new(&sys_block_path).exists();

                if is_base_disk {
                    let model = get_sysfs_value(&name, "device/model");
                    let vendor = get_sysfs_value(&name, "device/vendor");
                    let serial = get_sysfs_value(&name, "device/serial");
                    let firmware_rev = get_sysfs_value(&name, "device/rev")
                        .or_else(|| get_sysfs_value(&name, "device/firmware_rev"));
                    let wwid = get_sysfs_value(&name, "wwid");
                    let sysfs_path = canonical_path(&sys_block_path);
                    let transport = infer_transport(
                        &name,
                        sysfs_path.as_ref(),
                        get_sysfs_value(&name, "device/transport"),
                    );

                    let rotational = get_sysfs_value(&name, "queue/rotational")
                        .map(|s| s == "1")
                        .unwrap_or(false);
                    let phys_block = get_sysfs_value(&name, "queue/physical_block_size")
                        .and_then(|s| s.parse().ok())
                        .unwrap_or(512);
                    let log_block = get_sysfs_value(&name, "queue/logical_block_size")
                        .and_then(|s| s.parse().ok())
                        .unwrap_or(512);

                    let removable = get_sysfs_value(&name, "removable")
                        .map(|s| s == "1")
                        .unwrap_or(false);
                    let read_only = get_sysfs_value(&name, "ro")
                        .map(|s| s == "1")
                        .unwrap_or(false);
                    let trim_supported = get_sysfs_value(&name, "queue/discard_granularity")
                        .and_then(|s| s.parse::<u64>().ok())
                        .map(|v| v > 0)
                        .unwrap_or(false);
                    let scheduler = get_sysfs_value(&name, "queue/scheduler");
                    let (active_scheduler, available_schedulers) =
                        parse_scheduler(scheduler.as_ref());

                    disks.push(Disk {
                        name: name.clone(),
                        dev_path: format!("/dev/{name}"),
                        major,
                        minor,
                        sysfs_path,
                        model,
                        vendor,
                        serial,
                        firmware_rev,
                        wwid,
                        transport,
                        device_state: get_sysfs_value(&name, "device/state"),
                        size,
                        partitions: Vec::new(),
                        rotational,
                        physical_block_size: phys_block,
                        logical_block_size: log_block,
                        removable,
                        read_only,
                        trim_supported,
                        scheduler,
                        active_scheduler,
                        available_schedulers,
                        write_cache: get_sysfs_value(&name, "queue/write_cache"),
                        queue_depth: read_u64(format!("/sys/block/{name}/queue/nr_requests")),
                        read_ahead_kb: read_u64(format!("/sys/block/{name}/queue/read_ahead_kb")),
                        max_sectors_kb: read_u64(format!("/sys/block/{name}/queue/max_sectors_kb")),
                        max_hw_sectors_kb: read_u64(format!(
                            "/sys/block/{name}/queue/max_hw_sectors_kb"
                        )),
                        minimum_io_size: read_u64(format!(
                            "/sys/block/{name}/queue/minimum_io_size"
                        )),
                        optimal_io_size: read_u64(format!(
                            "/sys/block/{name}/queue/optimal_io_size"
                        )),
                        discard_granularity: read_u64(format!(
                            "/sys/block/{name}/queue/discard_granularity"
                        )),
                        discard_max_bytes: read_u64(format!(
                            "/sys/block/{name}/queue/discard_max_bytes"
                        )),
                        discard_zeroes_data: read_bool(format!(
                            "/sys/block/{name}/queue/discard_zeroes_data"
                        )),
                        fua: read_bool(format!("/sys/block/{name}/queue/fua")),
                        dax: read_bool(format!("/sys/block/{name}/queue/dax")),
                        zoned: get_sysfs_value(&name, "queue/zoned"),
                        nr_zones: read_u64(format!("/sys/block/{name}/queue/nr_zones")),
                        numa_node: read_i64(format!("/sys/block/{name}/device/numa_node")),
                        queue_count: read_u64(format!("/sys/block/{name}/device/queue_count")),
                        controller_id: get_sysfs_value(&name, "device/cntlid"),
                        controller_address: get_sysfs_value(&name, "device/address"),
                        subsystem_nqn: get_sysfs_value(&name, "device/subsysnqn"),
                        holders: read_dir_names(format!("/sys/block/{name}/holders")),
                        slaves: read_dir_names(format!("/sys/block/{name}/slaves")),
                        read_speed: "0.0".into(),
                        write_speed: "0.0".into(),
                        read_iops: "0.0".into(),
                        write_iops: "0.0".into(),
                        io_busy_percent: "0.0".into(),
                        total_read: 0,
                        total_write: 0,
                        total_discarded: 0,
                        total_reads: 0,
                        total_writes: 0,
                        total_discards: 0,
                        total_flushes: 0,
                        io_in_progress: 0,
                        io_time_ms: 0,
                        weighted_io_time_ms: 0,
                    });
                } else if let Some(d) = disks.last_mut() {
                    if name != d.name {
                        let partition_path = format!("/sys/block/{}/{}", d.name, name);
                        let uevent = read_uevent(format!("{partition_path}/uevent"));
                        d.partitions.push(Partition {
                            name: name.clone(),
                            dev_path: format!("/dev/{name}"),
                            major,
                            minor,
                            size,
                            partition_number: read_u64(format!("{partition_path}/partition"))
                                .or_else(|| uevent.get("PARTN").and_then(|v| v.parse().ok())),
                            partuuid: uevent.get("PARTUUID").cloned(),
                            start_sector: read_u64(format!("{partition_path}/start")),
                            read_only: read_bool(format!("{partition_path}/ro")),
                            alignment_offset: read_u64(format!(
                                "{partition_path}/alignment_offset"
                            )),
                            discard_alignment: read_u64(format!(
                                "{partition_path}/discard_alignment"
                            )),
                            holders: read_dir_names(format!("{partition_path}/holders")),
                            available_space: None,
                            total_space: None,
                            used_space: None,
                            file_system: None,
                            mount_point: None,
                        });
                    }
                }
            }
        }
    } else {
        eprintln!("Failed to open /proc/partitions.");
    }
    disks
}

#[derive(Clone)]
struct DiskStatSnapshot {
    bytes_read: u64,
    bytes_written: u64,
    reads_completed: u64,
    writes_completed: u64,
    io_time_ms: u64,
}

pub struct DiskSnapshot {
    stats: HashMap<String, DiskStatSnapshot>,
    time: Instant,
}

#[tauri::command]
pub async fn get_disks(
    prev_disk: tauri::State<'_, Mutex<Option<DiskSnapshot>>>,
) -> Result<Vec<Disk>, String> {
    // 1) current snapshot from /proc/diskstats
    let stats2 = read_diskstats()?;
    let map2: HashMap<_, _> = stats2.into_iter().map(|st| (st.name.clone(), st)).collect();
    let now = Instant::now();

    // 2) build out partition list
    let mut disks = get_disk_partition_info();

    // 3) compute delta from cached previous snapshot
    let mut guard = prev_disk.lock().map_err(|e| e.to_string())?;

    for d in &mut disks {
        if let Some(s2) = map2.get(&d.name) {
            let sector_size = get_sector_size(&d.name);
            let bytes2_r = s2.sectors_read * sector_size;
            let bytes2_w = s2.sectors_written * sector_size;
            let bytes2_discarded = s2.sectors_discarded * sector_size;

            if let Some(ref snap) = *guard {
                let elapsed = now.duration_since(snap.time).as_secs_f64();
                if elapsed > 0.0 {
                    if let Some(prev) = snap.stats.get(&d.name) {
                        let delta_r = bytes2_r.saturating_sub(prev.bytes_read);
                        let delta_w = bytes2_w.saturating_sub(prev.bytes_written);
                        let delta_reads = s2.reads_completed.saturating_sub(prev.reads_completed);
                        let delta_writes =
                            s2.writes_completed.saturating_sub(prev.writes_completed);
                        let delta_io_time = s2.io_time_ms.saturating_sub(prev.io_time_ms);
                        let rk = (delta_r as f64 / elapsed / 1000.0 * 10.0).round() / 10.0;
                        let wk = (delta_w as f64 / elapsed / 1000.0 * 10.0).round() / 10.0;
                        let ri = (delta_reads as f64 / elapsed * 10.0).round() / 10.0;
                        let wi = (delta_writes as f64 / elapsed * 10.0).round() / 10.0;
                        let busy =
                            ((delta_io_time as f64 / (elapsed * 1000.0)) * 1000.0).round() / 10.0;
                        d.read_speed = format!("{:.1}", rk);
                        d.write_speed = format!("{:.1}", wk);
                        d.read_iops = format!("{:.1}", ri);
                        d.write_iops = format!("{:.1}", wi);
                        d.io_busy_percent = format!("{:.1}", busy.min(100.0));
                    }
                }
            }

            d.total_read = bytes2_r;
            d.total_write = bytes2_w;
            d.total_discarded = bytes2_discarded;
            d.total_reads = s2.reads_completed;
            d.total_writes = s2.writes_completed;
            d.total_discards = s2.discards_completed;
            d.total_flushes = s2.flushes_completed;
            d.io_in_progress = s2.io_in_progress;
            d.io_time_ms = s2.io_time_ms;
            d.weighted_io_time_ms = s2.weighted_io_time_ms;
        }
    }

    *guard = Some(DiskSnapshot {
        stats: map2
            .iter()
            .map(|(k, v)| {
                let sector_size = get_sector_size(k);
                (
                    k.clone(),
                    DiskStatSnapshot {
                        bytes_read: v.sectors_read * sector_size,
                        bytes_written: v.sectors_written * sector_size,
                        reads_completed: v.reads_completed,
                        writes_completed: v.writes_completed,
                        io_time_ms: v.io_time_ms,
                    },
                )
            })
            .collect(),
        time: now,
    });
    drop(guard);

    // 4) populate partition mount/fs/usage via /proc/mounts + statvfs
    let mounts = read_mount_info();
    for d in &mut disks {
        for part in &mut d.partitions {
            let dev_path = format!("/dev/{}", part.name);
            if let Some(mount_info) = mounts.get(&dev_path) {
                if let Some((total, available)) = get_space_info(&mount_info.mount_point) {
                    part.available_space = Some(available);
                    part.total_space = Some(total);
                    part.used_space = Some(total.saturating_sub(available));
                }
                part.file_system = Some(mount_info.file_system.clone());
                part.mount_point = Some(mount_info.mount_point.clone());
            }
        }
    }

    Ok(disks)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parse_scheduler_extracts_active_and_available_values() {
        let raw = "[none] mq-deadline kyber bfq".to_string();
        let (active, available) = parse_scheduler(Some(&raw));

        assert_eq!(active.as_deref(), Some("none"));
        assert_eq!(available, vec!["none", "mq-deadline", "kyber", "bfq"]);
    }

    #[test]
    fn parse_scheduler_handles_missing_value() {
        let (active, available) = parse_scheduler(None);

        assert_eq!(active, None);
        assert!(available.is_empty());
    }

    #[test]
    fn infer_transport_prefers_explicit_sysfs_transport() {
        let transport = infer_transport("sda", None, Some("usb".to_string()));

        assert_eq!(transport.as_deref(), Some("usb"));
    }

    #[test]
    fn infer_transport_uses_name_and_sysfs_path_fallbacks() {
        let nvme_path = "/sys/devices/pci0000:00/0000:00:1d.0/nvme/nvme0/nvme0n1".to_string();
        let usb_path =
            "/sys/devices/pci0000:00/usb1/1-1/host0/target0:0:0/0:0:0:0/block/sda".to_string();

        assert_eq!(
            infer_transport("nvme0n1", Some(&nvme_path), None).as_deref(),
            Some("nvme")
        );
        assert_eq!(
            infer_transport("sda", Some(&usb_path), None).as_deref(),
            Some("usb")
        );
        assert_eq!(
            infer_transport("vda", None, None).as_deref(),
            Some("virtio")
        );
    }

    #[test]
    fn dev_path_for_sys_block_name_rejects_invalid_names() {
        assert_eq!(
            dev_path_for_sys_block_name("nvme0n1").as_deref(),
            Some("/dev/nvme0n1")
        );
        assert_eq!(dev_path_for_sys_block_name("").as_deref(), None);
        assert_eq!(dev_path_for_sys_block_name("../sda").as_deref(), None);
        assert_eq!(
            dev_path_for_sys_block_name("disk/by-id/sda").as_deref(),
            None
        );
        assert_eq!(dev_path_for_sys_block_name("sda\0x").as_deref(), None);
    }
}
