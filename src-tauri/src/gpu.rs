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
    let sysfs_path = PathBuf::from("/sys/class/drm/");
    match read_dir(&sysfs_path) {
        Ok(mut entries) => entries.any(|entry| {
            if let Ok(entry) = entry {
                let path = entry.path();
                if path.is_dir() {
                    let device_name = path.file_name().unwrap().to_str().unwrap();
                    device_name.starts_with("card") && is_amd_gpu(&path)
                } else {
                    false
                }
            } else {
                false
            }
        }),
        Err(_) => false,
    }
}

fn is_amd_gpu(path: &PathBuf) -> bool {
    let vendor_path = path.join("device/vendor");
    if let Ok(vendor) = read_to_string(&vendor_path) {
        return vendor.trim() == "0x1002"; // AMD vendor ID
    }
    false
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

fn get_amd_gpu_info() -> Result<GpuInformations, Box<dyn Error>> {
    let sysfs_path = PathBuf::from("/sys/class/drm/");
    let devices = read_dir(&sysfs_path)?;

    for entry in devices {
        let entry = entry?;
        let path = entry.path();

        if path.is_dir() {
            let device_name = path.file_name().unwrap().to_str().unwrap();
            if device_name.starts_with("card") && !device_name.contains('-') && is_amd_gpu(&path) {
                let device_path = path.join("device");
                let mut info = GpuInformations {
                    name: Some(device_name.to_string()),
                    driver_version: None,
                    memory_total: None,
                    memory_used: None,
                    memory_free: None,
                    temperature: None,
                    utilization: None,
                    clock_speed: None,
                    wattage: None,
                    fan_speed: None,
                    performance_state: None,
                };

                let memory_total_path = device_path.join("mem_info_vram_total");
                if let Ok(total) = read_to_string(&memory_total_path) {
                    info.memory_total = Some(add_memory_unit(total.trim().parse::<u64>()?));
                }

                let memory_used_path = device_path.join("mem_info_vram_used");
                if let Ok(used) = read_to_string(&memory_used_path) {
                    info.memory_used = Some(add_memory_unit(used.trim().parse::<u64>()?));
                }

                let memory_free_path = device_path.join("mem_info_vram_free");
                if let Ok(free) = read_to_string(&memory_free_path) {
                    info.memory_free = Some(add_memory_unit(free.trim().parse::<u64>()?));
                }

                let temperature_path = device_path.join("hwmon/hwmon0/temp1_input");
                if let Ok(temp) = read_to_string(&temperature_path) {
                    info.temperature = Some(format!("{} °C", temp.trim()));
                }

                let utilization_path = device_path.join("gpu_busy_percent");
                if let Ok(util) = read_to_string(&utilization_path) {
                    info.utilization = Some(format!("{} %", util.trim()));
                }

                let clock_speed_path = device_path.join("pp_dpm_sclk");
                if let Ok(clock) = read_to_string(&clock_speed_path) {
                    if let Some(line) = clock.lines().last() {
                        let clock_speed = line.split_whitespace().last().unwrap().parse::<u32>()?;
                        info.clock_speed = Some(add_clock_speed_unit(clock_speed));
                    }
                }

                let wattage_path = device_path.join("hwmon/hwmon0/power1_average");
                if let Ok(watt) = read_to_string(&wattage_path) {
                    info.wattage = Some(format!("{:.1} W", watt.trim().parse::<f64>()? / 1000000.0));
                }

                let fan_speed_path = device_path.join("hwmon/hwmon0/fan1_input");
                if let Ok(speed) = read_to_string(&fan_speed_path) {
                    info.fan_speed = Some(format!("{} RPM", speed.trim()));
                }

                return Ok(info);
            }
        }
    }

    Err("No AMD GPU found".into())
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

