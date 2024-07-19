use serde::{Serialize, Deserialize};
use nvml_wrapper::Nvml;
use nvml_wrapper::error::NvmlError;

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
    if memory >= 1024.0 * 1024.0 * 1024.0{
        format!("{:.0} GB", memory / (1024.0 * 1024.0 * 1024.0))
    }
    else if memory >= 1024.0 * 1024.0 {
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

fn get_gpu_info() -> Result<GpuInformations, NvmlError> {
    let nvml = Nvml::init()?;
    
    let device_count = nvml.device_count()?;
    if device_count == 0 {
        return Err(NvmlError::NoPermission); // Changed to a more appropriate error
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
        Err(_) => 0, // Return 0 or handle this case as you see fit
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
        wattage: Some(format!("{:.1} W", wattage as f64 / 1000.0)), // NVML returns power in milliwatts
        fan_speed: Some(format!("{} %", fan_speed)),
        performance_state: Some(format!("{:?}", performance_state)),
    })
}

#[tauri::command]
pub async fn get_gpu_informations() -> Option<GpuInformations> {
    // Try fetching NVIDIA GPU information
    match get_gpu_info() {
        Ok(info) => {
            Some(info)
        },
        Err(err) => {
            eprintln!("Failed to get GPU information: {:?}", err);
            None
        },
    }
}
