use std::fs::File;
use std::io::{BufRead, BufReader};
use serde::{Serialize, Deserialize};

const KILO_BYTE: u64 = 1000;

#[derive(Serialize, Deserialize, Debug)]
pub struct Partition {
    name: String,
    size: u64,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Disk {
    name: String,
    partitions: Vec<Partition>,
    size: u64,
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
                        disks.push(Disk {
                            name: disk_name,
                            partitions: Vec::new(),
                            size: disk_size,
                        });
                    }
                    if let Some(disk) = disks.last_mut() {
                        let partition_size: u64 = parts[2].parse().unwrap_or(0) * KILO_BYTE;
                        disk.partitions.push(Partition {
                            name: partition_name,
                            size: partition_size,
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
