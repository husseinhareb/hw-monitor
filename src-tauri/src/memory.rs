use std::{fs, io};
use serde::{Serialize, Deserialize};

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

fn parse_meminfo_line(line: &str, keyword: &str) -> Option<i64> {
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
    for line in meminfo.lines() {
        if let Some(value) = parse_meminfo_line(line, "MemTotal:") {
            memory.total = Some(value);
        } else if let Some(value) = parse_meminfo_line(line, "MemFree:") {
            memory.free = Some(value);
        } else if let Some(value) = parse_meminfo_line(line, "MemAvailable:") {
            memory.available = Some(value);
        } else if let Some(value) = parse_meminfo_line(line, "Cached:") {
            memory.cached = Some(value);
        } else if let Some(value) = parse_meminfo_line(line, "Active:") {
            memory.active = Some(value);
        }
        else if let Some(value) = parse_meminfo_line(line, "SwapTotal:") {
            memory.swap_total = Some(value);
        }
        else if let Some(value) = parse_meminfo_line(line, "SwapCache:") {
            memory.swap_cache = Some(value);
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
