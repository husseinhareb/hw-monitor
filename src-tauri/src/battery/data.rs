use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct BatteryData {
    pub model: Option<String>,
    pub state: String,
    pub cycle_count: Option<u32>,
    pub energy: u32,
    pub time_to_full: Option<u32>,
    pub technology: String,
    pub time_to_empty: Option<u32>,
    pub temperature: Option<u32>,
    pub state_of_health: u32,
    pub percentage: u32,
}
