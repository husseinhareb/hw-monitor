use std::fs;
use serde::{Serialize, Deserialize};
use sysinfo::{System, RefreshKind, CpuRefreshKind};

#[derive(Serialize, Deserialize)]
pub struct TotalUsage {
    memory: Option<String>,
    cpu: Option<String>,
    processes: Option<String>
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


async fn get_cpu_usage_percentage() -> Option<u64> {
    let mut s = System::new_with_specifics(
        RefreshKind::new().with_cpu(CpuRefreshKind::everything()),
    );
    
    // Wait a bit because CPU usage is based on diff.
    std::thread::sleep(sysinfo::MINIMUM_CPU_UPDATE_INTERVAL);
    // Refresh CPUs again.
    s.refresh_cpu();

    let mut total_usage = 0.0;
    let mut num_cpus = 0;

    for cpu in s.cpus() {
        total_usage += cpu.cpu_usage() as f64;
        num_cpus += 1;
    }

    if num_cpus > 0 {
        let average_usage = (total_usage / num_cpus as f64) as u64;
        Some(average_usage)
    } else {
        None
    }
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
    if let Some(memory) = get_memory_usage_percentage() {
        if let Some(cpu) = get_cpu_usage_percentage().await {
            if let Some(processes) = get_running_processes_count() {

            let total_usage = TotalUsage {
                memory: Some(memory.to_string()),
                cpu: Some(cpu.to_string()),
                processes: Some(processes.to_string()),
            };
            return Some(total_usage);
        };
    }
    }
    None
}