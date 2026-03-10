mod sysfs;
mod data;

pub use data::BatteryData;

use sysfs::SysFsBattery;

pub fn get_all_batteries() -> Result<Vec<BatteryData>, String> {
    SysFsBattery::discover()
}
