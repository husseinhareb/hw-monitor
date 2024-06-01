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

fn categorize_sensor_data(name: &str) -> &str {
    if name.starts_with("nvme") {
        "Disks"
    } else if name.starts_with("coretemp") {
        "CPU"
    } else if name.starts_with("iwlwifi") {
        "WiFi"
    } else if name.starts_with("pch_") {
        "PCH"
    } else {
        "Other"
    }
}

fn get_hwmon_data() -> Vec<HwMonData> {
    let mut sys = System::new_all();
    sys.refresh_all();
    let mut hwmon_data = Vec::new();

    // Initialize categories
    let mut categories: std::collections::HashMap<&str, Vec<SensorData>> = std::collections::HashMap::new();
    categories.insert("CPU", Vec::new());
    categories.insert("Disks", Vec::new());
    categories.insert("WiFi", Vec::new());
    categories.insert("PCH", Vec::new());
    categories.insert("Other", Vec::new());

    // Collect component data
    let components = Components::new_with_refreshed_list();
    for component in &components {        let category = categorize_sensor_data(component.label());
        let sensor_data = SensorData {
            name: component.label().to_string(),
            value: component.temperature(),
            max: component.max(),
            critical: component.critical(),
        };
        if let Some(sensors) = categories.get_mut(category) {
            sensors.push(sensor_data);
        }
    }

    // Convert HashMap to Vec<HwMonData>
    for (category, sensors) in categories {
        hwmon_data.push(HwMonData {
            name: category.to_string(),
            sensors,
        });
    }

    hwmon_data
}

#[tauri::command]
pub fn get_sensors() -> Result<Vec<HwMonData>, String> {
    Ok(get_hwmon_data())
}
