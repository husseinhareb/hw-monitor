use serde::{Serialize, Deserialize};
use std::fs;

#[derive(Serialize, Deserialize)]
pub struct CpuInformations {
    name: Option<String>,
    cores: Option<String>,
}

fn get_cpu_name() -> Option<String> {
    if let Ok(cpu_info) = fs::read_to_string("/proc/cpuinfo") {
        for line in cpu_info.lines() {
            if line.starts_with("model name") {
                let parts: Vec<&str> = line.split(":").collect();
                if let Some(name) = parts.get(1) {
                    return Some(name.trim().to_string());
                }
            }
        }
    }
    None
}

fn get_cpu_nb_cores() -> Option<String> {
    if let Ok(cpu_info) = fs::read_to_string("/proc/cpuinfo") {
        for line in cpu_info.lines() {
            if line.starts_with("cpu cores") {
                let parts: Vec<&str> = line.split(":").collect();
                if let Some(cores) = parts.get(1) {
                    return Some(cores.trim().to_string());
                }
            }
        }
    }
    None
}

#[tauri::command]
pub fn get_cpu_informations() -> Option<CpuInformations> {
    if let Some(cpu_name) = get_cpu_name() {
        if let Some(cores) = get_cpu_nb_cores() {
            let cpu_info = CpuInformations {
                name: Some(cpu_name),
                cores: Some(cores),
            };
            return Some(cpu_info);
        }
    }
    None
}
