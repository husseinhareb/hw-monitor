use std::fs::File;
use std::io::{BufRead, BufReader};
use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize)]
pub struct Disks {
    name: String,
    partitions: Vec<String>,
}

fn read_diskstats() -> Vec<Disks> {
    let file = File::open("/proc/diskstats").expect("Failed to open diskstats file");
    let reader = BufReader::new(file);
    let mut disks = Vec::new();
    let mut current_disk = String::new();
    let mut partitions = Vec::new();

    for line in reader.lines() {
        if let Ok(line) = line {
            let fields: Vec<&str> = line.split_whitespace().collect();
            if fields.len() >= 3 {
                let disk_name = fields[2].to_string();
                let partition_name = fields[3].to_string();
                if current_disk.is_empty() || disk_name != current_disk {
                    if !current_disk.is_empty() {
                        disks.push(Disks { name: current_disk, partitions: partitions.clone() });
                        partitions.clear();
                    }
                    current_disk = disk_name.clone();
                }
                partitions.push(partition_name);
            }
        }
    }
    if !current_disk.is_empty() {
        disks.push(Disks { name: current_disk, partitions });
    }
    disks
}

#[tauri::command]
pub fn get_disks() -> Vec<Disks> {
    read_diskstats()
}
