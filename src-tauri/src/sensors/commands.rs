use serde::{Deserialize, Serialize};
use std::fs;
use std::path::Path;

#[derive(Serialize, Deserialize, Debug)]
pub struct SensorData {
    pub id: String,
    pub name: String,
    pub value: f32,
    pub warning: Option<f32>,
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

#[derive(Clone, Copy)]
struct SensorSpec {
    prefix: &'static str,
    input_suffixes: &'static [&'static str],
    warning_suffixes: &'static [&'static str],
    critical_suffixes: &'static [&'static str],
    sensor_type: &'static str,
    unit: &'static str,
    scale: f32,
}

const SENSOR_SPECS: &[SensorSpec] = &[
    SensorSpec {
        prefix: "temp",
        input_suffixes: &["_input"],
        warning_suffixes: &["_max"],
        critical_suffixes: &["_crit"],
        sensor_type: "temperature",
        unit: "°C",
        scale: 1000.0,
    },
    SensorSpec {
        prefix: "fan",
        input_suffixes: &["_input"],
        warning_suffixes: &[],
        critical_suffixes: &["_max"],
        sensor_type: "fan",
        unit: "RPM",
        scale: 1.0,
    },
    SensorSpec {
        prefix: "in",
        input_suffixes: &["_input"],
        warning_suffixes: &["_max"],
        critical_suffixes: &["_crit"],
        sensor_type: "voltage",
        unit: "V",
        scale: 1000.0,
    },
    SensorSpec {
        prefix: "power",
        input_suffixes: &["_input", "_average"],
        warning_suffixes: &["_cap", "_max"],
        critical_suffixes: &["_crit"],
        sensor_type: "power",
        unit: "W",
        scale: 1_000_000.0,
    },
    SensorSpec {
        prefix: "curr",
        input_suffixes: &["_input"],
        warning_suffixes: &["_max"],
        critical_suffixes: &["_crit"],
        sensor_type: "current",
        unit: "A",
        scale: 1000.0,
    },
    SensorSpec {
        prefix: "humidity",
        input_suffixes: &["_input"],
        warning_suffixes: &["_max"],
        critical_suffixes: &["_crit"],
        sensor_type: "humidity",
        unit: "%",
        scale: 1000.0,
    },
    SensorSpec {
        prefix: "pwm",
        input_suffixes: &[""],
        warning_suffixes: &[],
        critical_suffixes: &[],
        sensor_type: "pwm",
        unit: "",
        scale: 1.0,
    },
    SensorSpec {
        prefix: "intrusion",
        input_suffixes: &["_alarm"],
        warning_suffixes: &[],
        critical_suffixes: &[],
        sensor_type: "intrusion",
        unit: "",
        scale: 1.0,
    },
    SensorSpec {
        prefix: "energy",
        input_suffixes: &["_input"],
        warning_suffixes: &[],
        critical_suffixes: &[],
        sensor_type: "energy",
        unit: "J",
        scale: 1_000_000.0,
    },
];

pub fn get_hwmon_data() -> Vec<HwMonData> {
    let hwmon_base = Path::new("/sys/class/hwmon");
    read_hwmon_data(hwmon_base)
}

fn read_hwmon_data(hwmon_base: &Path) -> Vec<HwMonData> {
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
        let sensor_id_prefix = stable_hwmon_id(&path, &dir_name);

        let mut sensors = Vec::new();

        if let Ok(files) = fs::read_dir(&path) {
            let file_names: Vec<String> = files
                .flatten()
                .map(|file| file.file_name().to_string_lossy().into_owned())
                .collect();

            for spec in SENSOR_SPECS {
                let mut indices = sensor_indices(&file_names, *spec);
                indices.sort_unstable();
                indices.dedup();

                for idx in indices {
                    let Some(value) =
                        read_scaled_value(&path, spec.prefix, idx, spec.input_suffixes, spec.scale)
                    else {
                        continue;
                    };

                    let name = read_sensor_label(&path, spec.prefix, idx);
                    let warning = read_scaled_value(
                        &path,
                        spec.prefix,
                        idx,
                        spec.warning_suffixes,
                        spec.scale,
                    );
                    let critical = read_scaled_value(
                        &path,
                        spec.prefix,
                        idx,
                        spec.critical_suffixes,
                        spec.scale,
                    );

                    sensors.push(SensorData {
                        id: format!("{sensor_id_prefix}:{}{}", spec.prefix, idx),
                        name,
                        value,
                        warning,
                        critical,
                        sensor_type: spec.sensor_type.to_string(),
                        unit: spec.unit.to_string(),
                    });
                }
            }
        }

        hwmon_data.push(HwMonData {
            index,
            name,
            sensors,
        });
    }

    hwmon_data.sort_by_key(|hwmon| hwmon.index);
    hwmon_data
}

fn sensor_indices(file_names: &[String], spec: SensorSpec) -> Vec<u32> {
    file_names
        .iter()
        .filter_map(|file_name| {
            spec.input_suffixes
                .iter()
                .find_map(|suffix| parse_sensor_index(file_name, spec.prefix, suffix))
        })
        .collect()
}

fn parse_sensor_index(file_name: &str, prefix: &str, suffix: &str) -> Option<u32> {
    let remainder = file_name.strip_prefix(prefix)?;
    let index = if suffix.is_empty() {
        remainder
    } else {
        remainder.strip_suffix(suffix)?
    };

    if index.is_empty() || !index.chars().all(|ch| ch.is_ascii_digit()) {
        return None;
    }

    index.parse().ok()
}

fn read_scaled_value(
    path: &Path,
    prefix: &str,
    idx: u32,
    suffixes: &[&str],
    scale: f32,
) -> Option<f32> {
    suffixes.iter().find_map(|suffix| {
        let file_path = path.join(format!("{prefix}{idx}{suffix}"));
        fs::read_to_string(file_path)
            .ok()
            .and_then(|value| value.trim().parse::<f32>().ok())
            .map(|value| value / scale)
    })
}

fn read_sensor_label(path: &Path, prefix: &str, idx: u32) -> String {
    fs::read_to_string(path.join(format!("{prefix}{idx}_label")))
        .map(|label| label.trim().to_string())
        .ok()
        .filter(|label| !label.is_empty())
        .unwrap_or_else(|| format!("{prefix}{idx}"))
}

fn stable_hwmon_id(path: &Path, fallback: &str) -> String {
    fs::canonicalize(path.join("device"))
        .map(|device_path| device_path.to_string_lossy().into_owned())
        .unwrap_or_else(|_| fallback.to_string())
}

#[tauri::command]
pub fn get_sensors() -> Result<Vec<HwMonData>, String> {
    Ok(get_hwmon_data())
}

#[cfg(test)]
mod tests {
    use super::{parse_sensor_index, read_hwmon_data};
    use std::fs;
    use std::path::{Path, PathBuf};

    fn test_dir(name: &str) -> PathBuf {
        let path = std::env::temp_dir().join(format!(
            "hw_monitor_sensors_{}_{}",
            std::process::id(),
            name
        ));
        let _ = fs::remove_dir_all(&path);
        fs::create_dir_all(&path).unwrap();
        path
    }

    fn write(path: &Path, value: &str) {
        fs::write(path, value).unwrap();
    }

    #[test]
    fn parses_supported_hwmon_sensor_types() {
        let base = test_dir("types");
        let chip = base.join("hwmon2");
        fs::create_dir_all(&chip).unwrap();

        write(&chip.join("name"), "chipset\n");
        write(&chip.join("temp1_input"), "42500\n");
        write(&chip.join("temp1_label"), "CPU Package\n");
        write(&chip.join("temp1_max"), "80000\n");
        write(&chip.join("temp1_crit"), "100000\n");
        write(&chip.join("fan1_input"), "1300\n");
        write(&chip.join("fan1_max"), "2500\n");
        write(&chip.join("in0_input"), "1200\n");
        write(&chip.join("in0_label"), "Vcore\n");
        write(&chip.join("power1_average"), "45000000\n");
        write(&chip.join("power1_cap"), "65000000\n");
        write(&chip.join("curr1_input"), "1500\n");
        write(&chip.join("humidity1_input"), "52300\n");
        write(&chip.join("pwm1"), "128\n");
        write(&chip.join("intrusion0_alarm"), "1\n");
        write(&chip.join("energy1_input"), "2500000\n");

        let hwmon_data = read_hwmon_data(&base);
        assert_eq!(hwmon_data.len(), 1);
        assert_eq!(hwmon_data[0].index, 2);
        assert_eq!(hwmon_data[0].name, "chipset");

        let sensors = &hwmon_data[0].sensors;
        assert_eq!(sensors.len(), 9);
        assert_eq!(sensors[0].id, "hwmon2:temp1");
        assert_eq!(sensors[0].name, "CPU Package");
        assert_eq!(sensors[0].sensor_type, "temperature");
        assert_eq!(sensors[0].unit, "°C");
        assert_eq!(sensors[0].value, 42.5);
        assert_eq!(sensors[0].warning, Some(80.0));
        assert_eq!(sensors[0].critical, Some(100.0));

        let voltage = sensors
            .iter()
            .find(|sensor| sensor.sensor_type == "voltage")
            .unwrap();
        assert_eq!(voltage.id, "hwmon2:in0");
        assert_eq!(voltage.name, "Vcore");
        assert_eq!(voltage.value, 1.2);
        assert_eq!(voltage.unit, "V");

        let power = sensors
            .iter()
            .find(|sensor| sensor.sensor_type == "power")
            .unwrap();
        assert_eq!(power.value, 45.0);
        assert_eq!(power.warning, Some(65.0));

        let intrusion = sensors
            .iter()
            .find(|sensor| sensor.sensor_type == "intrusion")
            .unwrap();
        assert_eq!(intrusion.id, "hwmon2:intrusion0");
        assert_eq!(intrusion.value, 1.0);

        let _ = fs::remove_dir_all(base);
    }

    #[test]
    fn parses_sensor_indices_for_plain_and_suffixed_inputs() {
        assert_eq!(parse_sensor_index("temp1_input", "temp", "_input"), Some(1));
        assert_eq!(parse_sensor_index("pwm2", "pwm", ""), Some(2));
        assert_eq!(parse_sensor_index("pwm2_enable", "pwm", ""), None);
        assert_eq!(
            parse_sensor_index("intrusion0_alarm", "intrusion", "_alarm"),
            Some(0)
        );
        assert_eq!(parse_sensor_index("input", "in", "_input"), None);
    }
}
