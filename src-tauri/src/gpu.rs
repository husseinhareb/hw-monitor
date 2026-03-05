use serde::{Deserialize, Serialize};
use nvml_wrapper::Nvml;
use std::fs::{read_dir, read_to_string};
use std::path::PathBuf;
use ash::vk;
use ash::Entry;
use std::ffi::CStr;
use std::ptr;

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
    get_vulkan_gpu_name_by_vendor(0x1002).unwrap_or_else(|| "AMD GPU".to_string())
}

fn get_amd_gpu_info(gpu_path: &PathBuf, index: usize) -> Option<GpuInformations> {
    let device_path = gpu_path.join("device");

    let memory_used = read_to_string(device_path.join("mem_info_vram_used"))
        .ok()
        .and_then(|s| s.trim().parse::<u64>().ok())
        .map(add_memory_unit);

    let memory_total = read_to_string(device_path.join("mem_info_vram_total"))
        .ok()
        .and_then(|s| s.trim().parse::<u64>().ok())
        .map(add_memory_unit);

    let memory_free = memory_total.as_ref().and_then(|total| {
        memory_used.as_ref().map(|used| {
            let total_bytes =
                total.replace(" GB", "").replace(" MB", "").parse::<u64>().unwrap_or(0)
                    * 1024
                    * 1024;
            let used_bytes =
                used.replace(" GB", "").replace(" MB", "").parse::<u64>().unwrap_or(0)
                    * 1024
                    * 1024;
            add_memory_unit(total_bytes - used_bytes)
        })
    });

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
    // Try to read from Vulkan first
    if let Some(name) = get_vulkan_gpu_name_by_vendor(0x8086) {
        return name;
    }
    // Fallback: read from DRM device name or product file
    if let Ok(label) = read_to_string(device_path.join("label")) {
        return label.trim().to_string();
    }
    "Intel GPU".to_string()
}

fn get_vulkan_gpu_name_by_vendor(vendor_id: u32) -> Option<String> {
    let entry = unsafe { Entry::load().ok()? };
    let app_name = CStr::from_bytes_with_nul(b"GPU Detector\0").unwrap();
    let engine_name = CStr::from_bytes_with_nul(b"No Engine\0").unwrap();

    let app_info = vk::ApplicationInfo {
        s_type: vk::StructureType::APPLICATION_INFO,
        p_next: ptr::null(),
        p_application_name: app_name.as_ptr(),
        p_engine_name: engine_name.as_ptr(),
        application_version: vk::make_api_version(0, 1, 0, 0),
        engine_version: vk::make_api_version(0, 1, 0, 0),
        api_version: vk::make_api_version(0, 1, 0, 0),
    };

    let create_info = vk::InstanceCreateInfo {
        s_type: vk::StructureType::INSTANCE_CREATE_INFO,
        p_next: ptr::null(),
        flags: vk::InstanceCreateFlags::empty(),
        p_application_info: &app_info,
        enabled_layer_count: 0,
        pp_enabled_layer_names: ptr::null(),
        enabled_extension_count: 0,
        pp_enabled_extension_names: ptr::null(),
    };

    let instance = unsafe { entry.create_instance(&create_info, None).ok()? };

    let physical_devices = unsafe { instance.enumerate_physical_devices().ok()? };

    let mut result = None;
    for &device in &physical_devices {
        let properties = unsafe { instance.get_physical_device_properties(device) };
        if properties.vendor_id == vendor_id {
            let name = unsafe {
                CStr::from_ptr(properties.device_name.as_ptr())
                    .to_string_lossy()
                    .into_owned()
            };
            result = Some(name);
            break;
        }
    }

    unsafe { instance.destroy_instance(None) };
    result
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

    // Memory info from /sys/class/drm/card*/device/ (if i915 exposes it)
    let memory_total = read_to_string(device_path.join("mem_info_vram_total"))
        .ok()
        .and_then(|s| s.trim().parse::<u64>().ok())
        .map(add_memory_unit);

    let memory_used = read_to_string(device_path.join("mem_info_vram_used"))
        .ok()
        .and_then(|s| s.trim().parse::<u64>().ok())
        .map(add_memory_unit);

    let memory_free = if memory_total.is_some() && memory_used.is_some() {
        let total_str = memory_total.as_ref().unwrap();
        let used_str = memory_used.as_ref().unwrap();
        let total_bytes = total_str.replace(" GB", "").replace(" MB", "").parse::<u64>().unwrap_or(0) * 1024 * 1024;
        let used_bytes = used_str.replace(" GB", "").replace(" MB", "").parse::<u64>().unwrap_or(0) * 1024 * 1024;
        Some(add_memory_unit(total_bytes.saturating_sub(used_bytes)))
    } else {
        None
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
