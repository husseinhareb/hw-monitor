use serde::{Deserialize, Serialize};
use nvml_wrapper::Nvml;
use std::fs::{read_dir, read_to_string};
use std::path::PathBuf;

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct GpuInformations {
    id: Option<String>,
    name: Option<String>,
    driver_version: Option<String>,
    memory_total: Option<String>,
    memory_used: Option<String>,
    memory_free: Option<String>,
    temperature: Option<String>,
    utilization: Option<String>,
    clock_speed: Option<String>,
    wattage: Option<String>,
    fan_speed: Option<String>,
    performance_state: Option<String>,
}

fn add_memory_unit(value: u64) -> String {
    let memory = value as f64;
    if memory >= 1024.0 * 1024.0 * 1024.0 {
        format!("{:.0} GB", memory / (1024.0 * 1024.0 * 1024.0))
    } else if memory >= 1024.0 * 1024.0 {
        format!("{:.0} MB", memory / (1024.0 * 1024.0))
    } else {
        format!("{} MB", memory)
    }
}

fn add_clock_speed_unit(value: u32) -> String {
    let clock_speed = value as f64;
    if clock_speed >= 1000.0 {
        format!("{:.2} GHz", clock_speed / 1000.0)
    } else {
        format!("{} MHz", clock_speed)
    }
}

fn detect_nvidia_gpu_count() -> u32 {
    match Nvml::init() {
        Ok(nvml) => nvml.device_count().unwrap_or(0),
        Err(_) => 0,
    }
}

fn detect_amd_gpu_paths() -> Vec<PathBuf> {
    let mut paths = Vec::new();
    let drm_path = PathBuf::from("/sys/class/drm/");
    if let Ok(entries) = read_dir(drm_path) {
        for entry in entries.flatten() {
            let path = entry.path();
            if path.is_dir() {
                if let Some(name) = path.file_name().and_then(|n| n.to_str()) {
                    if name.starts_with("card") && !name.contains('-') && is_amd_gpu(&path) {
                        paths.push(path);
                    }
                }
            }
        }
    }
    paths
}

fn is_amd_gpu(path: &PathBuf) -> bool {
    let vendor_path = path.join("device/vendor");
    if let Ok(vendor) = read_to_string(&vendor_path) {
        return vendor.trim() == "0x1002"; // AMD vendor ID
    }
    false
}

fn read_hwmon_info(
    device_path: &PathBuf,
) -> (
    Option<String>,
    Option<String>,
    Option<String>,
    Option<String>,
) {
    let mut fan_speed = None;
    let mut temperature = None;
    let mut clock_speed = None;
    let mut wattage = None;

    let hwmon_dir = device_path.join("hwmon");
    if let Ok(entries) = read_dir(&hwmon_dir) {
        for entry in entries {
            if let Ok(entry) = entry {
                let hwmon_path = entry.path();

                if let Ok(fan_input) = read_to_string(hwmon_path.join("fan1_input")) {
                    fan_speed = Some(format!("{} RPM", fan_input.trim()));
                }

                if let Ok(temp_input) = read_to_string(hwmon_path.join("temp1_input")) {
                    let temp_celsius = temp_input.trim().parse::<u64>().unwrap_or(0) / 1000;
                    temperature = Some(format!("{} °C", temp_celsius));
                }

                if let Ok(freq_input) = read_to_string(hwmon_path.join("freq1_input")) {
                    let freq_mhz = freq_input.trim().parse::<u64>().unwrap_or(0) / 1_000_000;
                    clock_speed = Some(format!("{} MHz", freq_mhz));
                }

                if let Ok(power_input) = read_to_string(hwmon_path.join("power1_average")) {
                    let power_mw = power_input.trim().parse::<u64>().unwrap_or(0);
                    wattage = Some(format!("{:.3} W", power_mw as f64 / 1000000.0));
                } else if let Ok(power_input) = read_to_string(hwmon_path.join("power1_input")) {
                    let power_mw = power_input.trim().parse::<u64>().unwrap_or(0);
                    wattage = Some(format!("{:.3} W", power_mw as f64 / 1000000.0));
                }
            }
        }
    }

    (fan_speed, temperature, clock_speed, wattage)
}

fn get_amd_gpu_name() -> String {
    get_gpu_name_from_sysfs(0x1002).unwrap_or_else(|| "AMD GPU".to_string())
}

fn get_amd_gpu_info(gpu_path: &PathBuf, index: usize) -> Option<GpuInformations> {
    let device_path = gpu_path.join("device");

    let memory_used_raw = read_to_string(device_path.join("mem_info_vram_used"))
        .ok()
        .and_then(|s| s.trim().parse::<u64>().ok());

    let memory_total_raw = read_to_string(device_path.join("mem_info_vram_total"))
        .ok()
        .and_then(|s| s.trim().parse::<u64>().ok());

    let memory_used = memory_used_raw.map(add_memory_unit);
    let memory_total = memory_total_raw.map(add_memory_unit);
    let memory_free = match (memory_total_raw, memory_used_raw) {
        (Some(t), Some(u)) => Some(add_memory_unit(t.saturating_sub(u))),
        _ => None,
    };

    let performance_state = read_to_string(device_path.join("power_state"))
        .ok()
        .map(|s| s.trim().to_string());

    let (fan_speed, temperature, clock_speed, wattage) = read_hwmon_info(&device_path);
    let utilization = read_gpu_busy_percent(&device_path);

    Some(GpuInformations {
        id: Some(format!("amd-{}", index)),
        name: Some(get_amd_gpu_name()),
        driver_version: None,
        memory_total,
        memory_used,
        memory_free,
        temperature,
        utilization,
        clock_speed,
        wattage,
        fan_speed,
        performance_state,
    })
}

fn read_gpu_busy_percent(device_path: &PathBuf) -> Option<String> {
    let gpu_busy_percent_file = device_path.join("gpu_busy_percent");

    if let Ok(contents) = read_to_string(&gpu_busy_percent_file) {
        if let Ok(value) = contents.trim().parse::<u64>() {
            return Some(format!("{}%", value));
        }
    }
    None
}

fn get_nvidia_gpu_info(device_index: u32) -> Option<GpuInformations> {
    let nvml = Nvml::init().ok()?;
    let device = nvml.device_by_index(device_index).ok()?;

    let name = device.name().ok()?;
    let driver_version = nvml.sys_driver_version().ok();
    let memory_info = device.memory_info().ok();
    let temperature = device.temperature(nvml_wrapper::enum_wrappers::device::TemperatureSensor::Gpu).ok();
    let utilization = device.utilization_rates().ok().map(|u| u.gpu);
    let clock_speed = device.clock_info(nvml_wrapper::enum_wrappers::device::Clock::Graphics).ok();
    let wattage = device.power_usage().ok();
    let fan_speed = device.fan_speed(0).ok();
    let performance_state = device.performance_state().ok();

    Some(GpuInformations {
        id: Some(format!("nvidia-{}", device_index)),
        name: Some(name),
        driver_version,
        memory_total: memory_info.as_ref().map(|m| add_memory_unit(m.total)),
        memory_used: memory_info.as_ref().map(|m| add_memory_unit(m.used)),
        memory_free: memory_info.as_ref().map(|m| add_memory_unit(m.free)),
        temperature: temperature.map(|t| format!("{} °C", t)),
        utilization: utilization.map(|u| format!("{} %", u)),
        clock_speed: clock_speed.map(add_clock_speed_unit),
        wattage: wattage.map(|w| format!("{:.1} W", w as f64 / 1000.0)),
        fan_speed: fan_speed.map(|f| format!("{} %", f)),
        performance_state: performance_state.map(|p| format!("{:?}", p)),
    })
}

fn is_intel_gpu(path: &PathBuf) -> bool {
    let vendor_path = path.join("device/vendor");
    if let Ok(vendor) = read_to_string(&vendor_path) {
        return vendor.trim() == "0x8086"; // Intel vendor ID
    }
    false
}

fn detect_intel_gpu_paths() -> Vec<PathBuf> {
    let mut paths = Vec::new();
    let drm_path = PathBuf::from("/sys/class/drm/");
    if let Ok(entries) = read_dir(drm_path) {
        for entry in entries.flatten() {
            let path = entry.path();
            if path.is_dir() {
                if let Some(name) = path.file_name().and_then(|n| n.to_str()) {
                    if name.starts_with("card") && !name.contains('-') && is_intel_gpu(&path) {
                        paths.push(path);
                    }
                }
            }
        }
    }
    paths
}

fn get_intel_gpu_name(device_path: &PathBuf) -> String {
    if let Some(name) = get_gpu_name_from_sysfs(0x8086) {
        return name;
    }
    // Fallback: read from DRM device name or product file
    if let Ok(label) = read_to_string(device_path.join("label")) {
        return label.trim().to_string();
    }
    "Intel GPU".to_string()
}

fn get_gpu_name_from_sysfs(vendor_id: u32) -> Option<String> {
    let vendor_str = format!("0x{:04x}", vendor_id);
    let drm_path = PathBuf::from("/sys/class/drm/");
    let entries = read_dir(&drm_path).ok()?;
    for entry in entries.flatten() {
        let path = entry.path();
        if !path.is_dir() {
            continue;
        }
        let name = path.file_name()?.to_str()?;
        if !name.starts_with("card") || name.contains('-') {
            continue;
        }
        let device_path = path.join("device");
        let vendor = read_to_string(device_path.join("vendor")).ok()?;
        if vendor.trim() != vendor_str {
            continue;
        }
        // Try product_name first (available on some drivers)
        if let Ok(product) = read_to_string(device_path.join("product_name")) {
            let product = product.trim();
            if !product.is_empty() {
                return Some(product.to_string());
            }
        }
        // Try label
        if let Ok(label) = read_to_string(device_path.join("label")) {
            let label = label.trim();
            if !label.is_empty() {
                return Some(label.to_string());
            }
        }
        // Fallback: read PCI device ID and look up in pci.ids
        if let Ok(device_id_str) = read_to_string(device_path.join("device")) {
            let device_id_str = device_id_str.trim().trim_start_matches("0x");
            if let Some(name) = lookup_pci_name(&vendor_str[2..], device_id_str) {
                return Some(name);
            }
        }
    }
    None
}

fn lookup_pci_name(vendor_id: &str, device_id: &str) -> Option<String> {
    let content = read_to_string("/usr/share/misc/pci.ids")
        .or_else(|_| read_to_string("/usr/share/hwdata/pci.ids"))
        .ok()?;
    let mut in_vendor = false;
    for line in content.lines() {
        if line.starts_with('#') || line.is_empty() {
            continue;
        }
        if !line.starts_with('\t') {
            // Vendor line
            if line.starts_with(vendor_id) {
                in_vendor = true;
            } else if in_vendor {
                break;
            }
        } else if in_vendor && !line.starts_with("\t\t") {
            // Device line (one tab)
            let trimmed = line.trim();
            if trimmed.starts_with(device_id) {
                let name = trimmed[device_id.len()..].trim();
                if !name.is_empty() {
                    return Some(name.to_string());
                }
            }
        }
    }
    None
}

fn get_intel_gpu_info(gpu_path: &PathBuf, index: usize) -> Option<GpuInformations> {
    let device_path = gpu_path.join("device");

    let name = get_intel_gpu_name(&device_path);

    // Read i915 frequency info
    let gt_dir = find_gt_dir(&device_path);
    let clock_speed = gt_dir.as_ref().and_then(|gt| {
        read_to_string(gt.join("gt_cur_freq_mhz"))
            .ok()
            .and_then(|s| s.trim().parse::<u32>().ok())
            .map(add_clock_speed_unit)
    });

    // Read hwmon info (temperature, power)
    let (fan_speed, temperature, hwmon_clock, wattage) = read_hwmon_info(&device_path);
    let clock_speed = clock_speed.or(hwmon_clock);

    let memory_total_raw = read_to_string(device_path.join("mem_info_vram_total"))
        .ok()
        .and_then(|s| s.trim().parse::<u64>().ok());

    let memory_used_raw = read_to_string(device_path.join("mem_info_vram_used"))
        .ok()
        .and_then(|s| s.trim().parse::<u64>().ok());

    let memory_total = memory_total_raw.map(add_memory_unit);
    let memory_used = memory_used_raw.map(add_memory_unit);
    let memory_free = match (memory_total_raw, memory_used_raw) {
        (Some(t), Some(u)) => Some(add_memory_unit(t.saturating_sub(u))),
        _ => None,
    };

    // Read utilization (i915 exposes gpu_busy_percent on some kernels)
    let utilization = read_gpu_busy_percent(&device_path)
        .or_else(|| {
            gt_dir.as_ref().and_then(|gt| {
                read_to_string(gt.join("gt_busy_percent"))
                    .ok()
                    .and_then(|s| s.trim().parse::<u64>().ok())
                    .map(|v| format!("{}%", v))
            })
        });

    // Driver version from i915 module
    let driver_version = read_to_string("/sys/module/i915/version")
        .ok()
        .map(|s| s.trim().to_string());

    Some(GpuInformations {
        id: Some(format!("intel-{}", index)),
        name: Some(name),
        driver_version,
        memory_total,
        memory_used,
        memory_free,
        temperature,
        utilization,
        clock_speed,
        wattage,
        fan_speed,
        performance_state: None,
    })
}

fn find_gt_dir(device_path: &PathBuf) -> Option<PathBuf> {
    // Try i915 gt directory structure: device/tile0/gt0 or device/gt
    let tile0_gt0 = device_path.join("tile0/gt0");
    if tile0_gt0.exists() {
        return Some(tile0_gt0);
    }
    let gt = device_path.join("gt");
    if gt.exists() {
        return Some(gt);
    }
    // Fallback: look in drm/card*/gt
    let drm_dir = device_path.join("drm");
    if let Ok(entries) = read_dir(&drm_dir) {
        for entry in entries.flatten() {
            let path = entry.path();
            if let Some(name) = path.file_name().and_then(|n| n.to_str()) {
                if name.starts_with("card") {
                    let gt_path = path.join("gt0");
                    if gt_path.exists() {
                        return Some(gt_path);
                    }
                }
            }
        }
    }
    None
}

#[tauri::command]
pub async fn get_gpu_informations() -> Vec<GpuInformations> {
    let mut gpus: Vec<GpuInformations> = Vec::new();

    // Collect NVIDIA GPUs
    let nvidia_count = detect_nvidia_gpu_count();
    for i in 0..nvidia_count {
        if let Some(info) = get_nvidia_gpu_info(i) {
            gpus.push(info);
        }
    }

    // Collect AMD GPUs
    for (i, path) in detect_amd_gpu_paths().iter().enumerate() {
        if let Some(info) = get_amd_gpu_info(path, i) {
            gpus.push(info);
        }
    }

    // Collect Intel GPUs
    for (i, path) in detect_intel_gpu_paths().iter().enumerate() {
        if let Some(info) = get_intel_gpu_info(path, i) {
            gpus.push(info);
        }
    }

    gpus
}
