extern crate battery;

use battery::{Battery, Manager};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct BatteryData {
    model: Option<String>,
    state: String,
    cycle_count: Option<u32>,
    energy: u32, // in Wh
    time_to_full: Option<u32>, // in minutes
    technology: String,
    time_to_empty: Option<u32>, // in minutes
    temperature: Option<u32>, // in Celsius
    state_of_health: u32,
    percentage: u32, 
}

fn transform_battery_data(battery: &Battery) -> BatteryData {
    BatteryData {
        model: battery.model().map(|m| m.to_string()),
        state: format!("{:?}", battery.state()),
        cycle_count: battery.cycle_count(),
        energy: (battery.energy().get::<battery::units::energy::joule>() / 3600.0).round() as u32, 
        time_to_full: battery.time_to_full().map(|t| t.get::<battery::units::time::minute>().round() as u32),
        technology: format!("{:?}", battery.technology()),
        time_to_empty: battery.time_to_empty().map(|t| t.get::<battery::units::time::minute>().round() as u32),
        temperature: battery.temperature().map(|t| t.value.round() as u32),
        state_of_health: (battery.state_of_health().value * 100.0).round() as u32,
        percentage: (battery.state_of_charge().value * 100.0).round() as u32, 
    }
}

fn get_battery_data() -> Result<Vec<BatteryData>, battery::Error> {
    let manager = Manager::new()?;
    let mut batteries = Vec::new();

    for maybe_battery in manager.batteries()? {
        let battery = maybe_battery?;
        batteries.push(transform_battery_data(&battery));
    }

    Ok(batteries)
}

#[tauri::command]
pub fn get_batteries() -> Result<Vec<BatteryData>, String> {
    get_battery_data().map_err(|e| e.to_string())
}
