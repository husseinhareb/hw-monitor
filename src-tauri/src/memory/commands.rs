use std::{fs, io};
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

fn form_factor_name(code: u8) -> Option<&'static str> {
    match code {
        0x01 => Some("Other"),
        0x03 => Some("SIMM"),
        0x04 => Some("SIP"),
        0x05 => Some("Chip"),
        0x06 => Some("DIP"),
        0x07 => Some("ZIP"),
        0x08 => Some("Proprietary Card"),
        0x09 => Some("DIMM"),
        0x0A => Some("TSOP"),
        0x0B => Some("Row of chips"),
        0x0C => Some("RIMM"),
        0x0D => Some("SODIMM"),
        0x0E => Some("SRIMM"),
        0x0F => Some("FB-DIMM"),
        0x10 => Some("Die"),
        _ => None,
    }
}

fn memory_type_name(code: u8) -> Option<&'static str> {
    match code {
        0x01 => Some("Other"),
        0x03 => Some("DRAM"),
        0x04 => Some("EDRAM"),
        0x05 => Some("VRAM"),
        0x06 => Some("SRAM"),
        0x07 => Some("RAM"),
        0x08 => Some("ROM"),
        0x09 => Some("Flash"),
        0x0A => Some("EEPROM"),
        0x0B => Some("FEPROM"),
        0x0C => Some("EPROM"),
        0x0D => Some("CDRAM"),
        0x0E => Some("3DRAM"),
        0x0F => Some("SDRAM"),
        0x10 => Some("SGRAM"),
        0x11 => Some("RDRAM"),
        0x12 => Some("DDR"),
        0x13 => Some("DDR2"),
        0x14 => Some("DDR2 FB-DIMM"),
        0x18 => Some("DDR3"),
        0x19 => Some("FBD2"),
        0x1A => Some("DDR4"),
        0x1B => Some("LPDDR"),
        0x1C => Some("LPDDR2"),
        0x1D => Some("LPDDR3"),
        0x1E => Some("LPDDR4"),
        0x1F => Some("Logical non-volatile device"),
        0x20 => Some("HBM"),
        0x21 => Some("HBM2"),
        0x22 => Some("DDR5"),
        0x23 => Some("LPDDR5"),
        0x24 => Some("HBM3"),
        _ => None,
    }
}

/// Read memory hardware info by parsing the raw SMBIOS/DMI tables
/// from /sys/firmware/dmi/tables/DMI.
/// Parses Type 16 (Physical Memory Array) for slot count and
/// Type 17 (Memory Device) for speed, form factor, and type.
fn read_dmi_hardware_info() -> MemoryHardwareInfo {
    let raw = match fs::read("/sys/firmware/dmi/tables/DMI") {
        Ok(data) => data,
        Err(_) => return MemoryHardwareInfo::default(),
    };

    let mut total_slots: u16 = 0;
    let mut populated_slots: u16 = 0;
    let mut speed: Option<String> = None;
    let mut form_factor: Option<String> = None;
    let mut memory_type: Option<String> = None;

    let mut offset = 0;
    while offset + 4 <= raw.len() {
        let entry_type = raw[offset];
        let length = raw[offset + 1] as usize;

        if length < 4 || offset + length > raw.len() {
            break;
        }

        // Type 16: Physical Memory Array
        if entry_type == 16 && length >= 15 {
            let num_devices = u16::from_le_bytes([raw[offset + 13], raw[offset + 14]]);
            total_slots += num_devices;
        }

        // Type 17: Memory Device
        if entry_type == 17 && length >= 21 {
            let size = u16::from_le_bytes([raw[offset + 12], raw[offset + 13]]);

            // size != 0 and size != 0xFFFF means a module is installed
            if size != 0 && size != 0xFFFF {
                populated_slots += 1;

                if form_factor.is_none() {
                    form_factor = form_factor_name(raw[offset + 14]).map(String::from);
                }

                if memory_type.is_none() {
                    memory_type = memory_type_name(raw[offset + 18]).map(String::from);
                }

                // Speed at offset 21-22 (requires length >= 23)
                if speed.is_none() && length >= 23 {
                    let spd = u16::from_le_bytes([raw[offset + 21], raw[offset + 22]]);
                    if spd != 0 && spd != 0xFFFF {
                        speed = Some(format!("{} MT/s", spd));
                    }
                }
            }
        }

        // End-of-table
        if entry_type == 127 {
            break;
        }

        // Skip past the formatted area to the strings section
        offset += length;

        // Strings are null-terminated, section ends with double null
        while offset < raw.len() {
            if raw[offset] == 0 {
                offset += 1;
                break;
            }
            // Skip to end of this string
            while offset < raw.len() && raw[offset] != 0 {
                offset += 1;
            }
            // Skip the null terminator
            if offset < raw.len() {
                offset += 1;
            }
        }
    }

    let slots_used = if total_slots > 0 {
        Some(format!("{} of {}", populated_slots, total_slots))
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
    read_dmi_hardware_info()
}
