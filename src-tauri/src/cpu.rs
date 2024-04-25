use serde::{Serialize, Deserialize};
use std::fs;
use std::process::Command;


#[derive(Serialize, Deserialize)]
pub struct CpuInformations {
    name: Option<String>,
    cores: Option<String>,
    threads: Option<String>,
    socket: Option<String>,
    cpu_speed: Option<String>,
    base_speed: Option<String>,
    max_speed: Option<String>,
    virtualization: Option<String>,
    uptime: Option<String>,
}

fn get_base_speed_from_file() -> Option<String> {
    let cpu_base_freq_file = "/sys/devices/system/cpu/cpu0/cpufreq/base_frequency";

    match fs::read_to_string(cpu_base_freq_file) {
        Ok(cpu_clock_info) => Some(cpu_clock_info.trim().to_string()), // Read and trim the value
        Err(_) => None, // Return None if reading the file fails
    }
}

fn get_max_speed_from_file() -> Option<String> {
    let cpu_max_freq_file = "/sys/devices/system/cpu/cpu0/cpufreq/cpuinfo_max_freq";

    match fs::read_to_string(cpu_max_freq_file) {
        Ok(cpu_clock_info) => Some(cpu_clock_info.trim().to_string()), // Read and trim the value
        Err(_) => None, // Return None if reading the file fails
    }
}

fn get_max_speed_from_lscpu() -> Option<String> {
    let output = Command::new("lscpu")
        .output()
        .ok()?
        .stdout;
    let output_str = String::from_utf8(output).ok()?;

    for line in output_str.lines() {
        if let Some(speed_str) = line.strip_prefix("CPU max MHz:") {
            return Some(speed_str.trim().to_string());
        }
    }

    None
}

fn get_base_speed_from_lscpu() -> Option<String> {
    let output = Command::new("lscpu")
        .output()
        .ok()?
        .stdout;
    let output_str = String::from_utf8(output).ok()?;

    for line in output_str.lines() {
        if let Some(speed_str) = line.strip_prefix("CPU min MHz:") {
            return Some(speed_str.trim().to_string());
        }
    }

    None
}

fn uptime_to_hms(uptime_seconds: f64) -> String {
    let hours = (uptime_seconds / 3600.0) as u64;
    let minutes = ((uptime_seconds % 3600.0) / 60.0) as u64;
    let seconds = (uptime_seconds % 60.0) as u64;
    format!("{:02}:{:02}:{:02}", hours, minutes, seconds)
}


fn get_cpu_info() -> Option<CpuInformations> {
    let base_speed = get_base_speed_from_file().or_else(|| get_base_speed_from_lscpu());
    let max_speed = get_max_speed_from_file().or_else(|| get_max_speed_from_lscpu());

    if let Ok(cpu_info) = fs::read_to_string("/proc/cpuinfo") {
        let mut cpu_name = None;
        let mut cores = None;
        let mut threads = None;
        let mut cpu_speeds = Vec::new();
        let mut virtualization = None;
        let mut num_sockets = 0;
        let mut counted_sockets: Vec<String> = Vec::new();

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
            } else if line.starts_with("flags") {
                // Check if the flags line contains the virtualization flags
                if line.contains(" vmx ") || line.contains(" svm ") {
                    // If virtualization flags are found, set the status to "Enabled"
                    virtualization = Some("Enabled".to_string());
                } else {
                    // If virtualization flags are not found, set the status to "Disabled"
                    virtualization = Some("Disabled".to_string());
                }
            } else if line.starts_with("physical id") {
                let parts: Vec<&str> = line.split(":").collect();
                if let Some(socket_id) = parts.get(1) {
                    let socket_id = socket_id.trim().to_string();
                    // Check if this socket has already been counted
                    if !counted_sockets.contains(&socket_id) {
                        num_sockets += 1;
                        counted_sockets.push(socket_id);
                    }
                }
            }
        }

        if let (Some(cpu_name), Some(cores), Some(threads)) = (cpu_name, cores, threads) {
            // Calculate the average CPU speed in GHz
            let average_cpu_speed_mhz = cpu_speeds.iter().sum::<f64>() / cpu_speeds.len() as f64;
            let average_cpu_speed_ghz = average_cpu_speed_mhz / 1000.0; // Convert to GHz
            let formatted_speed = format!("{:.2}", average_cpu_speed_ghz); // Format with two digits precision

            let uptime_seconds = fs::read_to_string("/proc/uptime")
            .ok()?
            .split_whitespace()
            .next()?
            .parse::<f64>()
            .ok()?;
            let uptime_tuple = uptime_to_hms(uptime_seconds);

            return Some(CpuInformations {
                name: Some(cpu_name),
                cores: Some(cores),
                threads: Some(threads),
                base_speed,
                cpu_speed: Some(formatted_speed),
                max_speed,
                virtualization,
                socket: Some(num_sockets.to_string()),
                uptime: Some(uptime_tuple),
            });
        }
    }
    None
}

#[tauri::command]
pub fn get_cpu_informations() -> Option<CpuInformations> {
    get_cpu_info()
}
