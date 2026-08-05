use crate::cpu_utils::TotalCpuState;
use serde::{Deserialize, Serialize};
use std::fs;

#[derive(Serialize, Deserialize)]
pub struct TotalUsage {
    memory: Option<u64>,
    cpu: Option<u64>,
    processes: Option<usize>,
}

fn get_cpu_usage_percentage(state: &TotalCpuState) -> Option<u64> {
    crate::cpu_utils::calc_cpu_usage(&state.0).map(|u| u.round() as u64)
}

fn get_memory_usage_percentage() -> Option<u64> {
    let mut total_kb: u64 = 0;
    let mut available_kb: u64 = 0;

    if let Ok(meminfo) = fs::read_to_string("/proc/meminfo") {
        for line in meminfo.lines() {
            let parts: Vec<&str> = line.split_whitespace().collect();
            if parts.len() >= 2 && parts[0] == "MemTotal:" {
                if let Ok(val) = parts[1].parse::<u64>() {
                    total_kb = val;
                }
            }
            if parts.len() >= 2 && parts[0] == "MemAvailable:" {
                if let Ok(val) = parts[1].parse::<u64>() {
                    available_kb = val;
                }
            }
        }
        let used_kb = total_kb.checked_sub(available_kb)?;
        return used_kb.checked_mul(100)?.checked_div(total_kb);
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
pub async fn get_total_usages(
    prev_total_cpu: tauri::State<'_, TotalCpuState>,
) -> Result<Option<TotalUsage>, String> {
    let memory = get_memory_usage_percentage();
    let cpu = get_cpu_usage_percentage(&prev_total_cpu);
    let processes = get_running_processes_count();

    Ok(Some(TotalUsage {
        memory,
        cpu,
        processes,
    }))
}
