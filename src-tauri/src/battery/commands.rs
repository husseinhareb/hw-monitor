use super::data::BatteryData;
use super::sysfs::SysFsBattery;

#[tauri::command]
pub fn get_batteries() -> Result<Vec<BatteryData>, String> {
    SysFsBattery::discover()
}
