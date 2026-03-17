use std::fs;
use serde::{Serialize, Deserialize};
use tokio::time::{sleep, Duration};

#[derive(Serialize, Deserialize)]
pub struct TotalUsage {
    memory: Option<String>,
    cpu: Option<String>,
    processes: Option<String>
}

fn read_cpu_times() -> Option<(u64, u64)> {
    let content = fs::read_to_string("/proc/stat").ok()?;
    let cpu_line = content.lines()
        .find(|line| line.starts_with("cpu "))?;

    let fields: Vec<u64> = cpu_line
        .split_whitespace()
        .skip(1)
        .filter_map(|field| field.parse().ok())
        .collect();

    let total_time: u64 = fields.iter().sum();
    let idle_time = *fields.get(3)?;

    Some((total_time, idle_time))
}

async fn get_cpu_usage_percentage() -> Option<u64> {
    let (prev_total, prev_idle) = read_cpu_times()?;
    
    sleep(Duration::from_secs(1)).await;
    
    let (total, idle) = read_cpu_times()?;

    let total_diff = total - prev_total;
    let idle_diff = idle - prev_idle;

    let cpu_usage = 100.0 * (total_diff - idle_diff) as f64 / total_diff as f64;
    let rounded_cpu_usage = cpu_usage.round() as u64;

    Some(rounded_cpu_usage)
}

fn get_memory_usage_percentage() -> Option<u64> {
    let mut total_memory = 0;
    let mut used_memory = 0;

    if let Ok(meminfo) = fs::read_to_string("/proc/meminfo") {
        for line in meminfo.lines() {
            let parts: Vec<&str> = line.split_whitespace().collect();
            if parts.len() >= 2 && parts[0] == "MemTotal:" {
                if let Ok(mem_total) = parts[1].parse::<u64>() {
                    total_memory = mem_total;
                }
            }
            if parts.len() >= 2 && parts[0] == "MemAvailable:" {
                if let Ok(memory_used) = parts[1].parse::<u64>() {
                    used_memory = memory_used;
                }
            }
        }
        if total_memory != 0 {
            let memory_usage_percentage = ((total_memory - used_memory) * 100) / total_memory;
            return Some(memory_usage_percentage);
        }
    }
    None
}

fn get_running_processes_count() -> Option<usize> {
    if let Ok(entries) = fs::read_dir("/proc") {
        let count = entries
            .filter_map(|entry| {
                entry.ok().and_then(|e| {
                    e.file_name().into_string().ok().and_then(|s| {
                        if s.chars().all(char::is_numeric) {
                            Some(())
                        } else {
                            None
                        }
                    })
                })
            })
            .count();
        Some(count)
    } else {
        None 
    }
}

#[tauri::command]
pub async fn get_total_usages() -> Option<TotalUsage> {
    let memory = get_memory_usage_percentage().map(|v| v.to_string());
    let cpu = get_cpu_usage_percentage().await.map(|v| v.to_string());
    let processes = get_running_processes_count().map(|v| v.to_string());

    Some(TotalUsage {
        memory,
        cpu,
        processes,
    })
}
