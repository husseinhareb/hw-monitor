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
    let mut hwmon_data = Vec::new();

    // Collect component data
    let components = Components::new_with_refreshed_list();
    for component in &components {          let sensor_data = SensorData {
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

fn get_cpu_temperature_data() -> Vec<HwMonData> {
    let hwmon_data = get_hwmon_data();
    let cpu_data: Vec<HwMonData> = hwmon_data.into_iter()
        .filter(|data| data.name.to_lowercase().contains("coretemp"))
        .collect();
    cpu_data
}

#[tauri::command]
pub fn get_sensors() -> Result<Vec<HwMonData>, String> {
    Ok(get_hwmon_data())
}

#[tauri::command]
pub fn get_cpu_sensors() -> Result<Vec<HwMonData>, String> {
    Ok(get_cpu_temperature_data())
}
