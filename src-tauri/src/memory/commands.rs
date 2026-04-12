use std::{fs, io, process::Command};
use serde::{Serialize, Deserialize};

const KILO_BYTE:i64 = 1024;

#[derive(Debug, Serialize, Deserialize)]
pub struct Memory {
    total: Option<i64>,
    free: Option<i64>,
    available: Option<i64>,
    cached: Option<i64>,
    active: Option<i64>,
    swap_total: Option<i64>,
    swap_cache: Option<i64>,
}

#[derive(Debug, Serialize, Deserialize, Default)]
pub struct MemoryHardwareInfo {
    speed: Option<String>,
    slots_used: Option<String>,
    form_factor: Option<String>,
    memory_type: Option<String>,
}


impl Memory {
    fn new() -> Memory {
        Memory {
            total: None,
            free: None,
            available: None,
            cached: None,
            active: None,
            swap_total: None,
            swap_cache: None,
        }
    }
}

pub fn parse_meminfo_line(line: &str, keyword: &str) -> Option<i64> {
    if line.starts_with(keyword) {
        let value = line
            .split_whitespace()
            .nth(1)?
            .parse::<i64>()
            .ok()?;
        Some(value)
    } else {
        None
    }
}


fn read_meminfo() -> io::Result<Memory> {
    let mut memory = Memory::new();

    let meminfo = fs::read_to_string("/proc/meminfo")?;
    //Fetched data is in kilobytes
    for line in meminfo.lines() {
        if let Some(value) = parse_meminfo_line(line, "MemTotal:") {
            memory.total = Some(value.saturating_mul(KILO_BYTE));
        } else if let Some(value) = parse_meminfo_line(line, "MemFree:") {
            memory.free = Some(value.saturating_mul(KILO_BYTE));
        } else if let Some(value) = parse_meminfo_line(line, "MemAvailable:") {
            memory.available = Some(value.saturating_mul(KILO_BYTE));
        } else if let Some(value) = parse_meminfo_line(line, "Cached:") {
            memory.cached = Some(value.saturating_mul(KILO_BYTE));
        } else if let Some(value) = parse_meminfo_line(line, "Active:") {
            memory.active = Some(value.saturating_mul(KILO_BYTE));
        } else if let Some(value) = parse_meminfo_line(line, "SwapTotal:") {
            memory.swap_total = Some(value.saturating_mul(KILO_BYTE));
        } else if let Some(value) = parse_meminfo_line(line, "SwapCached:") {
            memory.swap_cache = Some(value.saturating_mul(KILO_BYTE));
        }
    }

    Ok(memory)
}

#[tauri::command]
pub fn get_mem_info() -> Memory {
    match read_meminfo() {
        Ok(memory) => memory,
        Err(_) => Memory::new(),
    }
}

/// Read memory hardware info using `udevadm info` on the DMI sysfs node.
/// This works without root — same approach as Mission Center.
fn read_udevadm_memory_info() -> MemoryHardwareInfo {
    let output = match Command::new("udevadm")
        .args(["info", "-q", "property", "-p", "/sys/devices/virtual/dmi/id"])
        .output()
    {
        Ok(out) if out.status.success() => {
            String::from_utf8_lossy(&out.stdout).into_owned()
        }
        _ => return MemoryHardwareInfo::default(),
    };

    let mut speed: Option<String> = None;
    let mut form_factor: Option<String> = None;
    let mut memory_type: Option<String> = None;
    let mut max_devices: u64 = 0;
    let mut populated: u64 = 0;

    // Iterate over modules (MEMORY_DEVICE_0_, MEMORY_DEVICE_1_, ...)
    let mut module_index: u64 = 0;
    loop {
        let prefix = format!("MEMORY_DEVICE_{}_", module_index);
        if !output.contains(&prefix) {
            break;
        }

        // Check if this module is present (has SIZE > 0)
        let size_key = format!("{}SIZE=", prefix);
        let mut present = false;
        for line in output.lines() {
            if let Some(val) = line.strip_prefix(&size_key) {
                let size: u64 = val.trim().parse().unwrap_or(0);
                if size > 0 {
                    present = true;
                    populated += 1;
                }
                break;
            }
        }

        if present {
            if speed.is_none() {
                // Prefer CONFIGURED_SPEED_MTS, fall back to SPEED_MTS
                let configured_key = format!("{}CONFIGURED_SPEED_MTS=", prefix);
                let speed_key = format!("{}SPEED_MTS=", prefix);
                let mut spd: u64 = 0;
                let mut fallback_spd: u64 = 0;

                for line in output.lines() {
                    if let Some(val) = line.strip_prefix(&configured_key) {
                        spd = val.trim().parse().unwrap_or(0);
                    } else if let Some(val) = line.strip_prefix(&speed_key) {
                        fallback_spd = val.trim().parse().unwrap_or(0);
                    }
                }

                let final_spd = if spd > 0 { spd } else { fallback_spd };
                if final_spd > 0 {
                    speed = Some(format!("{} MT/s", final_spd));
                }
            }

            if form_factor.is_none() {
                let key = format!("{}FORM_FACTOR=", prefix);
                for line in output.lines() {
                    if let Some(val) = line.strip_prefix(&key) {
                        let v = val.trim();
                        if !v.is_empty() {
                            form_factor = Some(v.to_string());
                        }
                        break;
                    }
                }
            }

            if memory_type.is_none() {
                let key = format!("{}TYPE=", prefix);
                for line in output.lines() {
                    if let Some(val) = line.strip_prefix(&key) {
                        let v = val.trim();
                        if !v.is_empty() {
                            memory_type = Some(v.to_string());
                        }
                        break;
                    }
                }
            }
        }

        module_index += 1;
    }

    // Get total slot count from MEMORY_ARRAY_NUM_DEVICES
    for line in output.lines() {
        if let Some(val) = line.strip_prefix("MEMORY_ARRAY_NUM_DEVICES=") {
            max_devices = val.trim().parse().unwrap_or(0);
            break;
        }
    }

    let slots_used = if max_devices > 0 {
        Some(format!("{} of {}", populated, max_devices))
    } else if populated > 0 {
        Some(format!("{}", populated))
    } else {
        None
    };

    MemoryHardwareInfo {
        speed,
        slots_used,
        form_factor,
        memory_type,
    }
}

#[tauri::command]
pub fn get_mem_hardware_info() -> MemoryHardwareInfo {
    read_udevadm_memory_info()
}
