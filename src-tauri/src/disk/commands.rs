// src-tauri/src/disk.rs

use serde::{Deserialize, Serialize};
use std::fs::{self, File};
use std::io::{BufRead, BufReader};
use std::collections::HashMap;
use std::ffi::CString;
use tokio::time::{sleep, Duration};

struct DiskStat {
    name: String,
    sectors_read: u64,
    sectors_written: u64,
}

fn read_diskstats() -> Result<Vec<DiskStat>, String> {
    let content = fs::read_to_string("/proc/diskstats").map_err(|e| e.to_string())?;
    let mut stats = Vec::new();
    for line in content.lines() {
        let fields: Vec<&str> = line.split_whitespace().collect();
        if fields.len() >= 14 {
            let name = fields[2].to_string();
            let sectors_read = fields[5].parse::<u64>().unwrap_or(0);
            let sectors_written = fields[9].parse::<u64>().unwrap_or(0);
            stats.push(DiskStat { name, sectors_read, sectors_written });
        }
    }
    Ok(stats)
}

const KILO_BYTE: u64 = 1000;
const BYTES_PER_SECTOR: u64 = 512;

#[repr(C)]
struct Statvfs {
    f_bsize: u64,
    f_frsize: u64,
    f_blocks: u64,
    f_bfree: u64,
    f_bavail: u64,
    _padding: [u8; 200],
}

extern "C" {
    fn statvfs(path: *const std::os::raw::c_char, buf: *mut Statvfs) -> std::os::raw::c_int;
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
            map.insert(device, MountInfo {
                mount_point: fields[1].to_string(),
                file_system: fields[2].to_string(),
            });
        }
    }
    map
}

fn get_space_info(mount_point: &str) -> Option<(u64, u64)> {
    let c_path = CString::new(mount_point).ok()?;
    let mut buf: Statvfs = unsafe { std::mem::zeroed() };
    let ret = unsafe { statvfs(c_path.as_ptr(), &mut buf) };
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
    pub size: u64,
    pub available_space: Option<u64>,
    pub total_space: Option<u64>,
    pub used_space: Option<u64>,
    pub file_system: Option<String>,
    pub mount_point: Option<String>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Disk {
    pub name: String,
    pub size: u64,
    pub partitions: Vec<Partition>,

    // new fields
    pub read_speed: String,    // KB/s
    pub write_speed: String,   // KB/s
    pub total_read: u64,       // bytes
    pub total_write: u64,      // bytes
}

fn get_disk_partition_info() -> Vec<Disk> {
    let mut disks: Vec<Disk> = Vec::new();
    if let Ok(file) = File::open("/proc/partitions") {
        let reader = BufReader::new(file);
        let mut current_disk: Option<String> = None;

        for line in reader.lines().skip(2) {
            if let Ok(line) = line {
                let parts: Vec<&str> = line.split_whitespace().collect();
                if parts.len() >= 4 {
                    let name = parts[3].to_string();
                    let size: u64 = parts[2].parse().unwrap_or(0) * KILO_BYTE;

                    // new "base" disk?
                    if current_disk.is_none()
                        || !name.starts_with(current_disk.as_ref().unwrap())
                    {
                        current_disk = Some(name.clone());
                        disks.push(Disk {
                            name: name.clone(),
                            size,
                            partitions: Vec::new(),
                            read_speed: "0.0".into(),
                            write_speed: "0.0".into(),
                            total_read: 0,
                            total_write: 0,
                        });
                    }

                    // add partition if it's not the base device
                    if let Some(d) = disks.last_mut() {
                        if name != d.name {
                            d.partitions.push(Partition {
                                name: name.clone(),
                                size,
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
        }
    } else {
        eprintln!("Failed to open /proc/partitions.");
    }
    disks
}

#[tauri::command]
pub async fn get_disks() -> Result<Vec<Disk>, String> {
    // 1) snapshot #1 from /proc/diskstats
    let stats1 = read_diskstats()?;
    let map1: HashMap<_, _> = stats1
        .into_iter()
        .map(|st| (st.name.clone(), st))
        .collect();

    // 2) build out partition list
    let mut disks = get_disk_partition_info();

    // 3) wait 1 second
    sleep(Duration::from_secs(1)).await;

    // 4) snapshot #2
    let stats2 = read_diskstats()?;
    let map2: HashMap<_, _> = stats2
        .into_iter()
        .map(|st| (st.name.clone(), st))
        .collect();

    // 5) for each disk, compute delta → speeds & totals
    for d in &mut disks {
        if let (Some(s1), Some(s2)) = (map1.get(&d.name), map2.get(&d.name)) {
            let bytes1_r = s1.sectors_read * BYTES_PER_SECTOR;
            let bytes2_r = s2.sectors_read * BYTES_PER_SECTOR;
            let bytes1_w = s1.sectors_written * BYTES_PER_SECTOR;
            let bytes2_w = s2.sectors_written * BYTES_PER_SECTOR;

            let delta_r = bytes2_r.saturating_sub(bytes1_r);
            let delta_w = bytes2_w.saturating_sub(bytes1_w);

            // KB/s, one decimal
            let rk = (delta_r as f64 / 1024.0 * 10.0).round() / 10.0;
            let wk = (delta_w as f64 / 1024.0 * 10.0).round() / 10.0;

            d.read_speed   = format!("{:.1}", rk);
            d.write_speed  = format!("{:.1}", wk);
            d.total_read   = bytes2_r;
            d.total_write  = bytes2_w;
        }
    }

    // 6) populate partition mount/fs/usage via /proc/mounts + statvfs
    let mounts = read_mount_info();
    for d in &mut disks {
        for part in &mut d.partitions {
            let dev_path = format!("/dev/{}", part.name);
            if let Some(mount_info) = mounts.get(&dev_path) {
                if let Some((total, available)) = get_space_info(&mount_info.mount_point) {
                    part.available_space = Some(available);
                    part.total_space     = Some(total);
                    part.used_space      = Some(total.saturating_sub(available));
                }
                part.file_system = Some(mount_info.file_system.clone());
                part.mount_point = Some(mount_info.mount_point.clone());
            }
        }
    }

    Ok(disks)
}
