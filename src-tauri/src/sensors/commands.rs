use serde::{Deserialize, Serialize};
use std::fs;
use std::path::Path;

#[derive(Serialize, Deserialize, Debug)]
pub struct SensorData {
    pub name: String,
    pub value: f32,
    pub critical: Option<f32>,
    pub sensor_type: String,
    pub unit: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct HwMonData {
    pub index: u32,
    pub name: String,
    pub sensors: Vec<SensorData>,
}

pub fn get_hwmon_data() -> Vec<HwMonData> {
    let hwmon_base = Path::new("/sys/class/hwmon");
    let mut hwmon_data = Vec::new();

    let entries = match fs::read_dir(hwmon_base) {
        Ok(e) => e,
        Err(_) => return hwmon_data,
    };

    for entry in entries.flatten() {
        let path = entry.path();
        let dir_name = match entry.file_name().into_string() {
            Ok(n) => n,
            Err(_) => continue,
        };

        // Parse index from "hwmonN"
        let index: u32 = match dir_name.strip_prefix("hwmon").and_then(|s| s.parse().ok()) {
            Some(i) => i,
            None => continue,
        };

        // Read hwmon name
        let name = fs::read_to_string(path.join("name"))
            .map(|s| s.trim().to_string())
            .unwrap_or_else(|_| dir_name.clone());

        let mut sensors = Vec::new();

        if let Ok(files) = fs::read_dir(&path) {
            let mut temp_indices: Vec<u32> = Vec::new();
            let mut fan_indices: Vec<u32> = Vec::new();

            for file in files.flatten() {
                let fname = file.file_name();
                let fname_str = fname.to_string_lossy();
                if fname_str.starts_with("temp") && fname_str.ends_with("_input") {
                    if let Some(idx_str) = fname_str
                        .strip_prefix("temp")
                        .and_then(|s| s.strip_suffix("_input"))
                    {
                        if let Ok(idx) = idx_str.parse::<u32>() {
                            temp_indices.push(idx);
                        }
                    }
                } else if fname_str.starts_with("fan") && fname_str.ends_with("_input") {
                    if let Some(idx_str) = fname_str
                        .strip_prefix("fan")
                        .and_then(|s| s.strip_suffix("_input"))
                    {
                        if let Ok(idx) = idx_str.parse::<u32>() {
                            fan_indices.push(idx);
                        }
                    }
                }
            }
            temp_indices.sort();
            fan_indices.sort();

            // Temperature sensors
            for idx in temp_indices {
                let input_path = path.join(format!("temp{}_input", idx));
                let temp_value = match fs::read_to_string(&input_path) {
                    Ok(s) => match s.trim().parse::<f32>() {
                        Ok(v) => v / 1000.0,
                        Err(_) => continue,
                    },
                    Err(_) => continue,
                };

                let label_path = path.join(format!("temp{}_label", idx));
                let sensor_name = fs::read_to_string(&label_path)
                    .map(|s| s.trim().to_string())
                    .unwrap_or_else(|_| format!("temp{}", idx));

                let crit_path = path.join(format!("temp{}_crit", idx));
                let critical = fs::read_to_string(&crit_path)
                    .ok()
                    .and_then(|s| s.trim().parse::<f32>().ok())
                    .map(|v| v / 1000.0);

                sensors.push(SensorData {
                    name: sensor_name,
                    value: temp_value,
                    critical,
                    sensor_type: "temperature".to_string(),
                    unit: "°C".to_string(),
                });
            }

            // Fan sensors (value is already in RPM, no conversion needed)
            for idx in fan_indices {
                let input_path = path.join(format!("fan{}_input", idx));
                let fan_value = match fs::read_to_string(&input_path) {
                    Ok(s) => match s.trim().parse::<f32>() {
                        Ok(v) => v,
                        Err(_) => continue,
                    },
                    Err(_) => continue,
                };

                let label_path = path.join(format!("fan{}_label", idx));
                let sensor_name = fs::read_to_string(&label_path)
                    .map(|s| s.trim().to_string())
                    .unwrap_or_else(|_| format!("fan{}", idx));

                // Fan max (used as "critical" threshold for display)
                let max_path = path.join(format!("fan{}_max", idx));
                let max_rpm = fs::read_to_string(&max_path)
                    .ok()
                    .and_then(|s| s.trim().parse::<f32>().ok());

                sensors.push(SensorData {
                    name: sensor_name,
                    value: fan_value,
                    critical: max_rpm,
                    sensor_type: "fan".to_string(),
                    unit: "RPM".to_string(),
                });
            }
        }

        hwmon_data.push(HwMonData {
            index,
            name,
            sensors,
        });
    }

    hwmon_data
}

#[tauri::command]
pub fn get_sensors() -> Result<Vec<HwMonData>, String> {
    Ok(get_hwmon_data())
}
