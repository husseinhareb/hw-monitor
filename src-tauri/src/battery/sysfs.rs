use std::fs;
use std::path::{Path, PathBuf};

use super::data::BatteryData;

const SYSFS_ROOT: &str = "/sys/class/power_supply";

pub struct SysFsBattery;

impl SysFsBattery {
    pub fn discover() -> Result<Vec<BatteryData>, String> {
        let entries = fs::read_dir(SYSFS_ROOT).map_err(|e| e.to_string())?;
        let mut batteries = Vec::new();

        for entry in entries.flatten() {
            let path = entry.path();
            if Self::is_battery(&path) {
                if let Some(data) = Self::read_battery(&path) {
                    batteries.push(data);
                }
            }
        }

        Ok(batteries)
    }

    fn is_battery(path: &Path) -> bool {
        let type_val = read_sysfs_string(&path.join("type")).unwrap_or_default();
        let scope_val = read_sysfs_string(&path.join("scope")).unwrap_or_default();
        type_val.eq_ignore_ascii_case("battery")
            && (scope_val.is_empty()
                || scope_val.eq_ignore_ascii_case("system")
                || scope_val.eq_ignore_ascii_case("unknown"))
    }

    fn read_battery(path: &Path) -> Option<BatteryData> {
        let model = read_sysfs_string(&path.join("model_name"));
        let technology = read_sysfs_string(&path.join("technology")).unwrap_or_else(|| "Unknown".to_string());
        let cycle_count = read_sysfs_u32(&path.join("cycle_count")).filter(|&v| v > 0);

        let state = read_sysfs_string(&path.join("status")).unwrap_or_else(|| "Unknown".to_string());

        let percentage = read_sysfs_u32(&path.join("capacity")).unwrap_or(0);

        let voltage_now_uv = read_sysfs_f64(&path.join("voltage_now")).unwrap_or(0.0);
        let design_voltage_uv = read_sysfs_f64(&path.join("voltage_min_design"))
            .or_else(|| read_sysfs_f64(&path.join("voltage_max_design")))
            .or_else(|| read_sysfs_f64(&path.join("voltage_now")))
            .unwrap_or(0.0);

        // Energy in Wh — try energy_now (µWh), fallback to charge_now (µAh) * voltage
        let energy_uwh = read_sysfs_f64(&path.join("energy_now"))
            .or_else(|| read_sysfs_f64(&path.join("energy_avg")))
            .or_else(|| {
                let charge_uah = read_sysfs_f64(&path.join("charge_now"))
                    .or_else(|| read_sysfs_f64(&path.join("charge_avg")))?;
                Some(charge_uah * design_voltage_uv / 1_000_000.0)
            })
            .unwrap_or(0.0);
        let energy_wh = (energy_uwh / 1_000_000.0).round() as u32;

        // Energy full (µWh)
        let energy_full_uwh = read_sysfs_f64(&path.join("energy_full"))
            .or_else(|| {
                let charge_full_uah = read_sysfs_f64(&path.join("charge_full"))?;
                Some(charge_full_uah * design_voltage_uv / 1_000_000.0)
            })
            .unwrap_or(0.0);

        // Energy full design (µWh)
        let energy_full_design_uwh = read_sysfs_f64(&path.join("energy_full_design"))
            .or_else(|| {
                let charge_full_design_uah = read_sysfs_f64(&path.join("charge_full_design"))?;
                Some(charge_full_design_uah * design_voltage_uv / 1_000_000.0)
            })
            .unwrap_or(0.0);

        // State of health (%)
        let state_of_health = if energy_full_design_uwh > 0.0 {
            ((energy_full_uwh / energy_full_design_uwh) * 100.0).round() as u32
        } else {
            100
        };

        // Power draw (µW) for time estimates
        let power_uw = read_sysfs_f64(&path.join("power_now"))
            .filter(|&v| v > 10_000.0 && v < 100_000_000.0)
            .or_else(|| {
                let current_ua = read_sysfs_f64(&path.join("current_now"))?;
                if current_ua > 0.0 {
                    Some(current_ua * voltage_now_uv / 1_000_000.0)
                } else {
                    None
                }
            })
            .unwrap_or(0.0);

        // Time to empty / full in minutes
        let (time_to_empty, time_to_full) = compute_time_estimates(
            &state,
            energy_uwh,
            energy_full_uwh,
            power_uw,
        );

        // Temperature: sysfs "temp" is in 1/10 °C
        let temperature = read_sysfs_f64(&path.join("temp"))
            .map(|t| (t / 10.0).round() as u32);

        Some(BatteryData {
            model,
            state,
            cycle_count,
            energy: energy_wh,
            time_to_full,
            technology,
            time_to_empty,
            temperature,
            state_of_health,
            percentage,
        })
    }
}

fn compute_time_estimates(
    state: &str,
    energy_uwh: f64,
    energy_full_uwh: f64,
    power_uw: f64,
) -> (Option<u32>, Option<u32>) {
    if power_uw <= 0.0 {
        return (None, None);
    }

    let is_charging = state.eq_ignore_ascii_case("charging");
    let is_discharging = state.eq_ignore_ascii_case("discharging");

    let time_to_empty = if is_discharging && energy_uwh > 0.0 {
        Some(((energy_uwh / power_uw) * 60.0).round() as u32)
    } else {
        None
    };

    let time_to_full = if is_charging && energy_full_uwh > energy_uwh {
        Some((((energy_full_uwh - energy_uwh) / power_uw) * 60.0).round() as u32)
    } else {
        None
    };

    (time_to_empty, time_to_full)
}

fn read_sysfs_string(path: &Path) -> Option<String> {
    fs::read_to_string(path)
        .ok()
        .map(|s| s.trim().to_string())
        .filter(|s| !s.is_empty() && !s.starts_with('\0'))
}

fn read_sysfs_u32(path: &Path) -> Option<u32> {
    read_sysfs_string(path)?.parse::<u32>().ok()
}

fn read_sysfs_f64(path: &Path) -> Option<f64> {
    read_sysfs_string(path)?.parse::<f64>().ok()
}
