use serde::{Serialize, Deserialize};
use std::fs;

#[derive(Serialize, Deserialize)]
pub struct CpuInformations {
    name: Option<String>,
    cores: Option<String>,
    threads: Option<String>,
    cpu_speed: Option<String>, // Changed to store as String
}

fn get_cpu_info() -> Option<CpuInformations> {
    if let Ok(cpu_info) = fs::read_to_string("/proc/cpuinfo") {
        let mut cpu_name = None;
        let mut cores = None;
        let mut threads = None;
        let mut cpu_speeds = Vec::new(); // Changed to store all CPU speeds

        for line in cpu_info.lines() {
            if line.starts_with("model name") {
                let parts: Vec<&str> = line.split(":").collect();
                if let Some(name) = parts.get(1) {
                    cpu_name = Some(name.trim().to_string());
                }
            } else if line.starts_with("cpu cores") {
                let parts: Vec<&str> = line.split(":").collect();
                if let Some(core_count) = parts.get(1) {
                    cores = Some(core_count.trim().to_string());
                }
            } else if line.starts_with("siblings") {
                let parts: Vec<&str> = line.split(":").collect();
                if let Some(thread_count) = parts.get(1) {
                    threads = Some(thread_count.trim().to_string());
                }
            } else if line.contains("cpu MHz") {
                if let Some(speed_str) = line.split(":").nth(1) {
                    if let Ok(speed) = speed_str.trim().parse::<f64>() {
                        cpu_speeds.push(speed); // Store CPU speed in the vector
                    }
                }
            }
        }

        if let (Some(cpu_name), Some(cores), Some(threads)) = (cpu_name, cores, threads) {
            // Calculate the average CPU speed in GHz
            let average_cpu_speed_mhz = cpu_speeds.iter().sum::<f64>() / cpu_speeds.len() as f64;
            let average_cpu_speed_ghz = average_cpu_speed_mhz / 1000.0; // Convert to GHz
            let formatted_speed = format!("{:.1}", average_cpu_speed_ghz); // Format with two digits precision

            return Some(CpuInformations {
                name: Some(cpu_name),
                cores: Some(cores),
                threads: Some(threads),
                cpu_speed: Some(formatted_speed), // Store the formatted CPU speed
            });
        }
    }
    None
}

#[tauri::command]
pub fn get_cpu_informations() -> Option<CpuInformations> {
    get_cpu_info()
}
