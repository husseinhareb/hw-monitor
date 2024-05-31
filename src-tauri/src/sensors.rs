use serde::{Serialize, Deserialize};
use sysinfo::{System, Components};

#[derive(Serialize, Deserialize, Debug)]
pub struct SensorData {
    name: String,
    value: f32,
    max: f32,
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

    let mut components_data: Vec<SensorData> = Vec::new();
    let components = Components::new_with_refreshed_list();
    for component in &components {
        components_data.push(SensorData {
            name: component.label().to_string(),
            value: component.temperature(),
            max: component.max(),
            critical: component.critical(),
        });
    }

    hwmon_data.push(HwMonData {
        name: "Components".to_string(),
        sensors: components_data,
    });

    hwmon_data
}

#[tauri::command]
pub fn get_sensors() -> Result<Vec<HwMonData>, String> {
    Ok(get_hwmon_data())
}
