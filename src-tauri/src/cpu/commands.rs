use serde::{Serialize, Deserialize};
use std::fs;
use crate::sensors;
use crate::cpu_utils::PerfCpuState;

#[derive(Serialize, Deserialize)]
pub struct CpuInformations {
    name: Option<String>,
    socket: Option<String>,
    cores: Option<String>,
    threads: Option<String>,
    usage: Option<i64>,
    current_speed: Option<String>,
    base_speed: Option<String>,
    max_speed: Option<String>,
    virtualization: Option<String>,
    uptime: Option<String>,
    temperature: Option<String>, 
}

/// Static CPU info that never changes at runtime — cached after first read.
#[derive(Clone)]
struct StaticCpuInfo {
    name: String,
    cores: String,
    threads: String,
    virtualization: String,
    num_sockets: usize,
    base_speed: Option<String>,
    max_speed: Option<String>,
}

/// Global one-shot cache for static CPU fields.
static STATIC_CPU: std::sync::OnceLock<Option<StaticCpuInfo>> = std::sync::OnceLock::new();

fn get_static_cpu_info() -> Option<&'static StaticCpuInfo> {
    STATIC_CPU.get_or_init(|| {
        let cpu_info = fs::read_to_string("/proc/cpuinfo").ok()?;
        let (name, cores, threads, virtualization, num_sockets) = parse_static_fields(&cpu_info)?;
        let base_speed = read_sysfs_freq("/sys/devices/system/cpu/cpu0/cpufreq/base_frequency")
            .or_else(|| read_sysfs_freq("/sys/devices/system/cpu/cpu0/cpufreq/cpuinfo_min_freq"));
        let max_speed = read_sysfs_freq("/sys/devices/system/cpu/cpu0/cpufreq/cpuinfo_max_freq");
        Some(StaticCpuInfo { name, cores, threads, virtualization, num_sockets, base_speed, max_speed })
    }).as_ref()
}

/// Read a frequency value from sysfs (KHz string).
fn read_sysfs_freq(path: &str) -> Option<String> {
    fs::read_to_string(path).ok().map(|s| s.trim().to_string()).filter(|s| !s.is_empty())
}

/// Extract static fields from /proc/cpuinfo (name, cores, threads, virt, sockets).
fn parse_static_fields(cpu_info: &str) -> Option<(String, String, String, String, usize)> {
    let mut cpu_name = None;
    let mut cores = None;
    let mut threads = None;
    let mut virtualization = None;
    let mut counted_sockets: Vec<String> = Vec::new();

    for line in cpu_info.lines() {
        if line.starts_with("model name") {
            if cpu_name.is_none() {
                cpu_name = line.split(':').nth(1).map(|s| s.trim().to_string());
            }
        } else if line.starts_with("cpu cores") {
            if cores.is_none() {
                cores = line.split(':').nth(1).map(|s| s.trim().to_string());
            }
        } else if line.starts_with("siblings") {
            if threads.is_none() {
                threads = line.split(':').nth(1).map(|s| s.trim().to_string());
            }
        } else if line.starts_with("flags") {
            if virtualization.is_none() {
                virtualization = Some(
                    if line.contains(" vmx ") || line.contains(" svm ") { "Enabled" } else { "Disabled" }.to_string()
                );
            }
        } else if line.starts_with("physical id") {
            if let Some(id) = line.split(':').nth(1).map(|s| s.trim().to_string()) {
                if !counted_sockets.contains(&id) {
                    counted_sockets.push(id);
                }
            }
        }
    }

    Some((cpu_name?, cores?, threads?, virtualization.unwrap_or_default(), counted_sockets.len().max(1)))
}

/// Read per-core MHz from /proc/cpuinfo and return average in GHz.
fn get_current_speed() -> Option<String> {
    let cpu_info = fs::read_to_string("/proc/cpuinfo").ok()?;
    let mut speeds = Vec::new();
    for line in cpu_info.lines() {
        if line.contains("cpu MHz") {
            if let Some(val) = line.split(':').nth(1).and_then(|s| s.trim().parse::<f64>().ok()) {
                speeds.push(val);
            }
        }
    }
    if speeds.is_empty() {
        return None;
    }
    let avg_ghz = speeds.iter().sum::<f64>() / speeds.len() as f64 / 1000.0;
    Some(format!("{:.2}", avg_ghz))
}

fn uptime_to_hms(uptime_seconds: f64) -> String {
    let hours = (uptime_seconds / 3600.0) as u64;
    let minutes = ((uptime_seconds % 3600.0) / 60.0) as u64;
    let seconds = (uptime_seconds % 60.0) as u64;
    format!("{:02}:{:02}:{:02}", hours, minutes, seconds)
}

fn get_cpu_usage_percentage(state: &PerfCpuState) -> Option<i64> {
    crate::cpu_utils::calc_cpu_usage(&state.0).map(|u| u as i64)
}

fn get_cpu_temperature() -> Option<String> {
    let hwmon_data = sensors::get_hwmon_data();
    for hwmon in hwmon_data {
        for sensor in hwmon.sensors {
            if sensor.name.contains("core") || sensor.name.contains("Package") {
                return Some(format!("{:.1} °C", sensor.value));
            }
        }
    }
    None
}

fn get_cpu_info(prev_cpu: &PerfCpuState) -> Option<CpuInformations> {
    let static_info = get_static_cpu_info()?;

    let uptime_seconds = fs::read_to_string("/proc/uptime")
        .ok()?
        .split_whitespace()
        .next()?
        .parse::<f64>()
        .ok()?;

    Some(CpuInformations {
        name: Some(static_info.name.clone()),
        cores: Some(static_info.cores.clone()),
        threads: Some(static_info.threads.clone()),
        usage: get_cpu_usage_percentage(prev_cpu),
        base_speed: static_info.base_speed.clone(),
        current_speed: get_current_speed(),
        max_speed: static_info.max_speed.clone(),
        virtualization: Some(static_info.virtualization.clone()),
        socket: Some(static_info.num_sockets.to_string()),
        uptime: Some(uptime_to_hms(uptime_seconds)),
        temperature: get_cpu_temperature(),
    })
}



#[tauri::command]
pub async fn get_cpu_informations(prev_cpu: tauri::State<'_, PerfCpuState>) -> Result<Option<CpuInformations>, String> {
    Ok(get_cpu_info(&prev_cpu))
}
