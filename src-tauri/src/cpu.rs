use serde::{Serialize, Deserialize};
use std::fs;

#[derive(Serialize, Deserialize)]
pub struct CpuInformations {
    name: Option<String>,
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
#[tauri::command]
pub fn get_cpu_informations() -> Option<CpuInformations> {
    if let Some(cpu_name) = get_cpu_name() {
        let cpu_info = CpuInformations {
            name: Some(cpu_name),
        };
        Some(cpu_info)
    } else {
        None
    }
}
