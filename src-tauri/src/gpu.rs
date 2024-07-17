use serde::{Serialize, Deserialize};
use std::process::Command;

#[derive(Serialize, Deserialize, Debug)]
pub struct GpuInformations {
    name: Option<String>,
    driver_version: Option<String>,
    memory_total: Option<String>,
    memory_used: Option<String>,
    memory_free: Option<String>,
    temperature: Option<String>,
    utilization: Option<String>,
    clock_speed: Option<String>,
    wattage: Option<String>,
}

fn add_memory_unit(value: &str) -> String {
    let memory: f64 = value.parse().unwrap_or(0.0);
    if memory >= 1024.0 {
        format!("{:.2} GB", memory / 1024.0)
    } else {
        format!("{} MB", memory)
    }
}

fn add_clock_speed_unit(value: &str) -> String {
    let clock_speed: f64 = value.parse().unwrap_or(0.0);
    if clock_speed >= 1000.0 {
        format!("{:.2} GHz", clock_speed / 1000.0)
    } else {
        format!("{} MHz", clock_speed)
    }
}

fn get_gpu_info() -> Option<GpuInformations> {
    let output = Command::new("nvidia-smi")
        .arg("--query-gpu=name,driver_version,memory.total,memory.used,memory.free,temperature.gpu,utilization.gpu,clocks.current.graphics,power.draw")
        .arg("--format=csv,noheader,nounits")
        .output()
        .ok()?
        .stdout;

    let output_str = String::from_utf8(output).ok()?;
    let parts: Vec<&str> = output_str.split(',').collect();

    if parts.len() < 9 { // Updated to match the new number of fields
        return None;
    }

    Some(GpuInformations {
        name: Some(parts[0].trim().to_string()),
        driver_version: Some(parts[1].trim().to_string()),
        memory_total: Some(add_memory_unit(parts[2].trim())),
        memory_used: Some(add_memory_unit(parts[3].trim())),
        memory_free: Some(add_memory_unit(parts[4].trim())),
        temperature: Some(format!("{} °C", parts[5].trim())),
        utilization: Some(format!("{}", parts[6].trim())),
        clock_speed: Some(add_clock_speed_unit(parts[7].trim())),
        wattage: Some(format!("{} W", parts[8].trim())), 
    })
}

#[tauri::command]
pub async fn get_gpu_informations() -> Option<GpuInformations> {
    // Try fetching NVIDIA GPU information
    if let Some(info) = get_gpu_info() {
        return Some(info);
    }

    // Implement other GPU information fetching methods here (e.g., for AMD or Intel GPUs)

    None // Return None if no GPU information could be fetched
}
