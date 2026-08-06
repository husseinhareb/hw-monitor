use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs;
use std::sync::OnceLock;
use std::time::{Duration, Instant};

/// System information that doesn't already have its own dedicated command.
/// CPU/GPU/Memory/Network data comes from their respective modules and is
/// composed on the frontend via Promise.all.
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct SystemInfo {
    // Operating System
    pub os_name: Option<String>,
    pub os_version: Option<String>,
    pub os_codename: Option<String>,
    pub os_arch: Option<String>,
    pub desktop_env: Option<String>,
    pub session_type: Option<String>,

    // Kernel
    pub kernel_version: Option<String>,

    // Host
    pub hostname: Option<String>,
    pub chassis_type: Option<String>,
    pub board_vendor: Option<String>,
    pub board_name: Option<String>,
    pub product_name: Option<String>,
    pub product_version: Option<String>,
    pub bios_vendor: Option<String>,
    pub bios_version: Option<String>,

    // Boot
    pub uptime: Option<String>,
    pub boot_time_epoch: Option<u64>,

    // User / Shell
    pub current_user: Option<String>,
    pub default_shell: Option<String>,

    // Packages
    pub package_counts: Option<String>,

    // Locale
    pub locale: Option<String>,
}

/// Cached result with a timestamp for TTL-based refresh.
struct CachedInfo {
    data: SystemInfo,
    timestamp: Instant,
}

/// Global cache. Static fields (os-release, DMI, kernel, hostname, env)
/// are one-shot. `uptime` and `btime` are re-read on each cache miss.
static CACHE: OnceLock<std::sync::Mutex<Option<CachedInfo>>> = OnceLock::new();

const CACHE_TTL: Duration = Duration::from_secs(30);

// ── OS helpers ──────────────────────────────────────────────────────

/// Parse an `/etc/os-release`-style key=value file into a HashMap.
pub fn parse_os_release(content: &str) -> HashMap<String, String> {
    let mut map = HashMap::new();
    for line in content.lines() {
        let line = line.trim();
        if line.is_empty() || line.starts_with('#') {
            continue;
        }
        if let Some((key, value)) = line.split_once('=') {
            let value = value.trim_matches('"').trim_matches('\'').trim();
            map.insert(key.trim().to_string(), value.to_string());
        }
    }
    map
}

fn read_os_info() -> Option<(Option<String>, Option<String>, Option<String>)> {
    let content = fs::read_to_string("/etc/os-release").ok()?;
    let info = parse_os_release(&content);
    let name = info.get("PRETTY_NAME").cloned().or_else(|| info.get("NAME").cloned());
    let version = info.get("VERSION").cloned();
    let codename = info
        .get("VERSION_CODENAME")
        .or_else(|| info.get("UBUNTU_CODENAME"))
        .cloned();
    Some((name, version, codename))
}

// ── Kernel ──────────────────────────────────────────────────────────

fn read_kernel_version() -> Option<String> {
    if let Ok(content) = fs::read_to_string("/proc/version") {
        let version = content.split_whitespace().take(3).collect::<Vec<_>>().join(" ");
        if !version.is_empty() {
            return Some(version);
        }
    }
    // libc::uname fallback
    unsafe {
        let mut uts: libc::utsname = std::mem::zeroed();
        if libc::uname(&mut uts) == 0 {
            let release = std::ffi::CStr::from_ptr(uts.release.as_ptr())
                .to_string_lossy()
                .into_owned();
            if !release.is_empty() {
                return Some(release);
            }
        }
    }
    None
}

// ── Host ────────────────────────────────────────────────────────────

fn read_hostname() -> Option<String> {
    let mut buf = vec![0u8; 256];
    unsafe {
        if libc::gethostname(buf.as_mut_ptr() as *mut libc::c_char, buf.len()) == 0 {
            if let Some(null_pos) = buf.iter().position(|&b| b == 0) {
                buf.truncate(null_pos);
            }
            return String::from_utf8(buf).ok();
        }
    }
    fs::read_to_string("/proc/sys/kernel/hostname")
        .ok()
        .map(|s| s.trim().to_string())
}

/// Map a DMI chassis type byte to a human-readable label.
pub fn chassis_type_label(code: u8) -> &'static str {
    match code {
        1 => "Other",
        2 => "Unknown",
        3 => "Desktop",
        4 => "Low Profile Desktop",
        5 => "Pizza Box",
        6 => "Mini Tower",
        7 => "Tower",
        8 => "Portable",
        9 => "Laptop",
        10 => "Notebook",
        11 => "Hand Held",
        12 => "Docking Station",
        13 => "All in One",
        14 => "Sub Notebook",
        15 => "Space-Saving",
        16 => "Lunch Box",
        17 => "Main Server Chassis",
        18 => "Expansion Chassis",
        19 => "Sub Chassis",
        20 => "Bus Expansion Chassis",
        21 => "Peripheral Chassis",
        22 => "RAID Chassis",
        23 => "Rack Mount Chassis",
        24 => "Sealed-Case PC",
        25 => "Multi-System",
        26 => "Compact PCI",
        27 => "Advanced TCA",
        28 => "Blade",
        29 => "Blade Enclosure",
        30 => "Tablet",
        31 => "Convertible",
        32 => "Detachable",
        33 => "IoT Gateway",
        34 => "Embedded PC",
        35 => "Mini PC",
        36 => "Automotive",
        _ => "Unknown",
    }
}

fn read_dmi_field(path: &str) -> Option<String> {
    fs::read_to_string(path)
        .ok()
        .map(|s| s.trim().to_string())
        .filter(|s| !s.is_empty())
}

fn read_chassis_type() -> Option<String> {
    let raw = read_dmi_field("/sys/devices/virtual/dmi/id/chassis_type")?;
    let code: u8 = raw.parse().ok()?;
    Some(chassis_type_label(code).to_string())
}

// ── Uptime / Boot ───────────────────────────────────────────────────

fn read_uptime_seconds() -> Option<f64> {
    fs::read_to_string("/proc/uptime")
        .ok()?
        .split_whitespace()
        .next()?
        .parse::<f64>()
        .ok()
}

fn read_uptime() -> Option<String> {
    let seconds = read_uptime_seconds()?;
    Some(crate::cpu::uptime_to_hms(seconds))
}

fn read_boot_time_epoch() -> Option<u64> {
    let content = fs::read_to_string("/proc/stat").ok()?;
    for line in content.lines() {
        if line.starts_with("btime ") {
            return line
                .split_whitespace()
                .nth(1)
                .and_then(|s| s.parse::<u64>().ok());
        }
    }
    None
}

// ── Packages ────────────────────────────────────────────────────────

/// Try each known package manager, counting installed packages.
/// Returns a JSON-like string, e.g. `{"dpkg": 2456, "flatpak": 5}`.
fn count_packages() -> Option<String> {
    let managers: &[(&str, &[&str])] = &[
        ("dpkg", &["dpkg-query", "-f", "${Package}\n", "-W"]),
        ("rpm", &["rpm", "-qa"]),
        ("pacman", &["pacman", "-Qq"]),
        ("apk", &["apk", "info"]),
        ("flatpak", &["flatpak", "list", "--columns=application"]),
        ("snap", &["snap", "list"]),
    ];

    let mut counts: Vec<String> = Vec::new();
    for &(label, cmd) in managers {
        match std::process::Command::new(cmd[0])
            .args(&cmd[1..])
            .stdout(std::process::Stdio::piped())
            .stderr(std::process::Stdio::null())
            .output()
        {
            Ok(output) if output.status.success() => {
                let output_str = String::from_utf8_lossy(&output.stdout);
                let count = output_str.lines().count();
                // snap list has a header row
                let count = if label == "snap" {
                    count.saturating_sub(1)
                } else {
                    count
                };
                if count > 0 {
                    counts.push(format!(r#""{}": {}"#, label, count));
                }
            }
            _ => {}
        }
    }

    if counts.is_empty() {
        None
    } else {
        Some(format!("{{ {} }}", counts.join(", ")))
    }
}

// ── Main gatherer ───────────────────────────────────────────────────

fn gather_system_info() -> Option<SystemInfo> {
    let (os_name, os_version, os_codename) =
        read_os_info().unwrap_or((None, None, None));

    Some(SystemInfo {
        os_name,
        os_version,
        os_codename,
        os_arch: Some(std::env::consts::ARCH.to_string()),
        desktop_env: std::env::var("XDG_CURRENT_DESKTOP").ok(),
        session_type: std::env::var("XDG_SESSION_TYPE").ok(),
        kernel_version: read_kernel_version(),
        hostname: read_hostname(),
        chassis_type: read_chassis_type(),
        board_vendor: read_dmi_field("/sys/devices/virtual/dmi/id/board_vendor"),
        board_name: read_dmi_field("/sys/devices/virtual/dmi/id/board_name"),
        product_name: read_dmi_field("/sys/devices/virtual/dmi/id/product_name"),
        product_version: read_dmi_field("/sys/devices/virtual/dmi/id/product_version"),
        bios_vendor: read_dmi_field("/sys/devices/virtual/dmi/id/bios_vendor"),
        bios_version: read_dmi_field("/sys/devices/virtual/dmi/id/bios_version"),
        uptime: read_uptime(),
        boot_time_epoch: read_boot_time_epoch(),
        current_user: std::env::var("USER")
            .or_else(|_| std::env::var("LOGNAME"))
            .ok(),
        default_shell: std::env::var("SHELL").ok(),
        package_counts: count_packages(),
        locale: std::env::var("LANG").ok(),
    })
}

// ── Tauri command ───────────────────────────────────────────────────

#[tauri::command]
pub fn get_system_info(force: Option<bool>) -> Result<Option<SystemInfo>, String> {
    let cache = CACHE.get_or_init(|| std::sync::Mutex::new(None));

    if !force.unwrap_or(false) {
        if let Ok(guard) = cache.lock() {
            if let Some(entry) = guard.as_ref() {
                if entry.timestamp.elapsed() < CACHE_TTL {
                    return Ok(Some(entry.data.clone()));
                }
            }
        }
    }

    let info = gather_system_info();

    if let Ok(mut guard) = cache.lock() {
        if let Some(ref data) = info {
            *guard = Some(CachedInfo {
                data: data.clone(),
                timestamp: Instant::now(),
            });
        }
    }

    Ok(info)
}
