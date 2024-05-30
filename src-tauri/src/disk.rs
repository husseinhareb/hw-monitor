use serde::{Serialize, Deserialize};
use std::fs::File;
use std::io::{BufRead, BufReader};
use sysinfo::Disks;

const KILO_BYTE: u64 = 1000;

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

                    if current_disk.is_none() || !name.contains(current_disk.as_ref().unwrap()) {
                        current_disk = Some(name.clone());
                        disks.push(Disk {
                            name: name.clone(),
                            partitions: Vec::new(),
                            size: size,
                        });
                    }

                    if let Some(disk) = disks.last_mut() {
                        // Only add the partition if its name is not the same as the disk name
                        if name != disk.name {
                            disk.partitions.push(Partition {
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
pub fn get_disks() -> Result<Vec<Disk>, String> {
    let mut disks_info = get_disk_partition_info();
    let mut sys_disks = Disks::new_with_refreshed_list();

    for disk_info in &mut disks_info {
        for partition in &mut disk_info.partitions {
        for disk in sys_disks.list() {
            let sys_disk_base_name = disk.name().to_string_lossy().to_string();
            let disk_info_base_name = "/dev/".to_owned() + &partition.name;
            let partition_used_space = disk.total_space() - disk.available_space();
            if disk_info_base_name.contains(&sys_disk_base_name) {
                // Match found, update disk information
                    partition.available_space = Some(disk.available_space());
                    partition.total_space = Some(disk.total_space());
                    partition.file_system = Some(disk.file_system().to_string_lossy().to_string());
                    partition.used_space = Some(partition_used_space);
                    partition.mount_point = Some(disk.mount_point().to_string_lossy().to_string());
            }
        }
        }
    }

    Ok(disks_info)
}
