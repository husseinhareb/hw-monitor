use std::fs::File;
use std::io::{BufRead, BufReader};
use serde::{Serialize, Deserialize};

const KILO_BYTE: u64 = 1024;
const BYTES_IN_GB: u64 = 1024 * 1024 * 1024;

#[derive(Serialize, Deserialize, Debug)]
pub struct Partition {
    name: String,
    size_gb: u64,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Disk {
    name: String,
    partitions: Vec<Partition>,
    size_gb: u64,
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
                    let disk_name = parts[3].to_string();
                    let partition_name = parts[3].to_string();
                    if current_disk.is_none() || !partition_name.contains(current_disk.as_ref().unwrap()) {
                        current_disk = Some(disk_name.clone());
                        let disk_size: u64 = parts[2].parse().unwrap_or(0) * KILO_BYTE;
                        let disk_size_gb = disk_size / BYTES_IN_GB;
                        disks.push(Disk {
                            name: disk_name,
                            partitions: Vec::new(),
                            size_gb: disk_size_gb,
                        });
                    }
                    if let Some(disk) = disks.last_mut() {
                        let partition_size: u64 = parts[2].parse().unwrap_or(0) * KILO_BYTE;
                        let partition_size_gb = partition_size / BYTES_IN_GB;
                        disk.partitions.push(Partition {
                            name: partition_name,
                            size_gb: partition_size_gb,
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

#[tauri::command]
pub fn get_disks() -> Result<Vec<Disk>, String> {
    let disks = get_disk_partition_info();
    
    Ok(disks)
}
