use serde::{Serialize, Deserialize};
use libmedium::{
    parse_hwmons,
    sensors::sync_sensors::{Sensor, temp::TempSensor},
    units::Temperature,
};

#[derive(Serialize, Deserialize, Debug)]
pub struct SensorData {
    pub name: String,
    pub value: f32,
    pub critical: Option<f32>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct HwMonData {
    pub index: u32,
    pub name: String,
    pub sensors: Vec<SensorData>,
}


pub fn get_hwmon_data() -> Vec<HwMonData> {
    let hwmons = match parse_hwmons() {
        Ok(h) => h,
        Err(_) => return Vec::new(),
    };
    let mut hwmon_data = Vec::new();

    for hwmon in &hwmons {
        let mut sensors = Vec::new();
        for (_, temp_sensor) in hwmon.temps() {
            let temperature: Temperature = match temp_sensor.read_input() {
                Ok(t) => t,
                Err(_) => continue,
            };
            let critical_temp = temp_sensor.read_crit().ok();

            sensors.push(SensorData {
                name: temp_sensor.name().to_string(),
                value: temperature.as_degrees_celsius() as f32,
                critical: critical_temp.map(|t| t.as_degrees_celsius() as f32),
            });
        }
        hwmon_data.push(HwMonData {
            index: hwmon.index() as u32, // Convert u16 to u32
            name: hwmon.name().to_string(),
            sensors,
        });
    }
    hwmon_data
}

#[tauri::command]
pub fn get_sensors() -> Result<Vec<HwMonData>, String> {
    Ok(get_hwmon_data())
}
