use serde::{Serialize, Deserialize};
use nvml_wrapper::Nvml;
use nvml_wrapper::error::NvmlError;
use std::fs::{read_dir, read_to_string};
use std::path::PathBuf;
use std::error::Error;

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

fn detect_nvidia_gpus() -> bool {
    match Nvml::init() {
        Ok(nvml) => {
            let device_count = nvml.device_count();
            device_count.is_ok() && device_count.unwrap() > 0
        },
        Err(_) => false,
    }
}

fn detect_amd_gpus() -> bool {
    let drm_path = PathBuf::from("/sys/class/drm/");
    if let Ok(entries) = read_dir(drm_path) {
        for entry in entries {
            if let Ok(entry) = entry {
                let path = entry.path();
                if path.is_dir() && path.file_name().unwrap().to_str().unwrap().starts_with("card") {
                    if is_amd_gpu(&path) {
                        return true;
                    }
                }
            }
        }
    }
    false
}

fn is_amd_gpu(path: &PathBuf) -> bool {
    let vendor_path = path.join("device/vendor");
    if let Ok(vendor) = read_to_string(&vendor_path) {
        return vendor.trim() == "0x1002"; // AMD vendor ID
    }
    false
}

fn read_hwmon_info(device_path: &PathBuf) -> (Option<String>, Option<String>, Option<String>) {
    let mut fan_speed = None;
    let mut temperature = None;
    let mut clock_speed = None;

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
            }
        }
    }

    (fan_speed, temperature, clock_speed)
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

fn get_amd_gpu_info() -> Result<GpuInformations, Box<dyn Error>> {
    let drm_path = PathBuf::from("/sys/class/drm/");
    let mut amd_gpu_path = None;

    if let Ok(entries) = read_dir(drm_path) {
        for entry in entries {
            if let Ok(entry) = entry {
                let path = entry.path();
                if path.is_dir() && path.file_name().unwrap().to_str().unwrap().starts_with("card") {
                    if is_amd_gpu(&path) {
                        amd_gpu_path = Some(path);
                        break;
                    }
                }
            }
        }
    }

    if let Some(gpu_path) = amd_gpu_path {
        let device_path = gpu_path.join("device");

        // Read memory info
        let memory_used = read_to_string(device_path.join("mem_info_vram_used")).ok()
            .and_then(|s| s.trim().parse::<u64>().ok())
            .map(add_memory_unit);
        
        let memory_total = read_to_string(device_path.join("mem_info_vram_total")).ok()
            .and_then(|s| s.trim().parse::<u64>().ok())
            .map(add_memory_unit);
        
        let memory_free = memory_total.as_ref().and_then(|total| memory_used.as_ref().map(|used| {
            let total_bytes = total.replace(" GB", "").replace(" MB", "").parse::<u64>().unwrap_or(0) * 1024 * 1024;
            let used_bytes = used.replace(" GB", "").replace(" MB", "").parse::<u64>().unwrap_or(0) * 1024 * 1024;
            add_memory_unit(total_bytes - used_bytes)
        }));

        // Read performance state
        let performance_state = read_to_string(device_path.join("power_state")).ok().map(|s| s.trim().to_string());

        // Read hardware monitor info
        let (fan_speed, temperature, clock_speed) = read_hwmon_info(&device_path);

        // Read GPU busy percentage (utilization)
        let utilization = read_gpu_busy_percent(&device_path);

        Ok(GpuInformations {
            name: Some("AMD GPU".to_string()),
            driver_version: None,
            memory_total,
            memory_used,
            memory_free,
            temperature,
            utilization,
            clock_speed,
            wattage: None,
            fan_speed,
            performance_state,
        })
    } else {
        Err("No AMD GPU found".into())
    }
}

fn get_nvidia_gpu_info() -> Result<GpuInformations, NvmlError> {
    let nvml = Nvml::init()?;
    let device_count = nvml.device_count()?;

    if device_count == 0 {
        return Err(NvmlError::NoPermission);
    }

    let device = nvml.device_by_index(0)?;

    let name = device.name()?;
    let driver_version = nvml.sys_driver_version()?;
    let memory_info = device.memory_info()?;
    let temperature = device.temperature(nvml_wrapper::enum_wrappers::device::TemperatureSensor::Gpu)?;
    let utilization = device.utilization_rates()?.gpu;
    let clock_speed = device.clock_info(nvml_wrapper::enum_wrappers::device::Clock::Graphics)?;
    let wattage = device.power_usage()?;
    let fan_speed = match device.fan_speed(0) {
        Ok(speed) => speed,
        Err(_) => 0,
    };
    let performance_state = device.performance_state()?;

    Ok(GpuInformations {
        name: Some(name),
        driver_version: Some(driver_version),
        memory_total: Some(add_memory_unit(memory_info.total)),
        memory_used: Some(add_memory_unit(memory_info.used)),
        memory_free: Some(add_memory_unit(memory_info.free)),
        temperature: Some(format!("{} °C", temperature)),
        utilization: Some(format!("{} %", utilization)),
        clock_speed: Some(add_clock_speed_unit(clock_speed)),
        wattage: Some(format!("{:.1} W", wattage as f64 / 1000.0)),
        fan_speed: Some(format!("{} %", fan_speed)),
        performance_state: Some(format!("{:?}", performance_state)),
    })
}

#[tauri::command]
pub async fn get_gpu_informations() -> Option<GpuInformations> {
    if detect_nvidia_gpus() {
        match get_nvidia_gpu_info() {
            Ok(info) => return Some(info),
            Err(err) => {
                eprintln!("Failed to get NVIDIA GPU information: {:?}", err);
            },
        }
    }

    if detect_amd_gpus() {
        match get_amd_gpu_info() {
            Ok(info) => return Some(info),
            Err(err) => {
                eprintln!("Failed to get AMD GPU information: {:?}", err);
            },
        }
    }

    None
}
