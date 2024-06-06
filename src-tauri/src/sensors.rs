use serde::{Serialize, Deserialize};
use sysinfo::{System, Components};

#[derive(Serialize, Deserialize, Debug)]
pub struct SensorData {
    name: String,
    value: f32,
    critical: Option<f32>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct HwMonData {
    name: String,
    sensors: Vec<SensorData>,
}

fn get_hwmon_data() -> Vec<HwMonData> {
    let mut sys = System::new_all();
    sys.refresh_all();
    let components = Components::new_with_refreshed_list();
    let mut hwmon_data = Vec::new();
    for component in &components {
        let sensor_data = SensorData {
            name: component.label().to_string(),
            value: component.temperature(),
            critical: component.critical(),
        };
        hwmon_data.push(HwMonData {
            name: component.label().to_string(),
            sensors: vec![sensor_data],
        });
    }

    hwmon_data
}

fn filter_hwmon_data_by_name(hwmon_data: Vec<HwMonData>, name_filter: &str) -> Vec<HwMonData> {
    hwmon_data.into_iter()
        .filter(|data| data.name.to_lowercase().contains(name_filter))
        .collect()
}

fn get_cpu_temperature_data() -> Vec<HwMonData> {
    let hwmon_data = get_hwmon_data();
    filter_hwmon_data_by_name(hwmon_data, "coretemp")
}

fn get_disks_temperature_data() -> Vec<HwMonData> {
    let hwmon_data = get_hwmon_data();
    filter_hwmon_data_by_name(hwmon_data, "nvme")
}

fn get_gpu_temperature_data() -> Vec<HwMonData> {
    let hwmon_data = get_hwmon_data();
    filter_hwmon_data_by_name(hwmon_data, "")
}

#[tauri::command]
pub fn get_sensors() -> Result<Vec<HwMonData>, String> {
    Ok(get_hwmon_data())
}

#[tauri::command]
pub fn get_cpu_sensors() -> Result<Vec<HwMonData>, String> {
    Ok(get_cpu_temperature_data())
}

#[tauri::command]
pub fn get_disk_sensors() -> Result<Vec<HwMonData>, String> {
    Ok(get_disks_temperature_data())
}

#[tauri::command]
pub  fn get_gpu_sensors() -> Result<Vec<HwMonData>, String> {
    Ok(get_gpu_temperature_data())
}
