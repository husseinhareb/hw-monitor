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
                    let name = parts[3].to_string();
                    let size: u64 = parts[2].parse().unwrap_or(0) * KILO_BYTE;

                    if current_disk.is_none() || !name.contains(current_disk.as_ref().unwrap()) {
                        current_disk = Some(name.clone());
                        disks.push(Disk {
                            name: name.clone(),
                            partitions: Vec::new(),
                            size,
                        });
                    }
                    
                    if let Some(disk) = disks.last_mut() {
                        // Only add the partition if its name is not the same as the disk name
                        if name != disk.name {
                            disk.partitions.push(Partition {
                                name,
                                size,
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
    let disks = get_disk_partition_info();
    
    Ok(disks)
}
