use serde::{Deserialize, Serialize};
use std::collections::{HashMap, HashSet};
use std::fs;
use std::path::{Path, PathBuf};

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct SystemService {
    pub name: String,
    pub description: String,
    pub load_state: String,
    pub active_state: String,
    pub sub_state: String,
    pub unit_file_state: String,
}

// ── Unit file discovery ───────────────────────────────────────────────────────

/// Directories where systemd stores unit files, ordered by priority.
fn unit_file_dirs() -> Vec<PathBuf> {
    vec![
        PathBuf::from("/etc/systemd/system"),            // admin overrides (highest)
        PathBuf::from("/run/systemd/system"),             // runtime units
        PathBuf::from("/usr/lib/systemd/system"),         // distro-installed
        PathBuf::from("/lib/systemd/system"),             // Debian-style fallback
        PathBuf::from("/usr/local/lib/systemd/system"),   // locally installed
    ]
}

/// Collect every `.service` unit file, deduplicated by name (first found wins).
/// Returns a map of service_name (without .service) → unit file path.
fn discover_unit_files() -> HashMap<String, PathBuf> {
    let mut found: HashMap<String, PathBuf> = HashMap::new();
    for dir in unit_file_dirs() {
        let Ok(entries) = fs::read_dir(&dir) else { continue };
        for entry in entries.flatten() {
            let path = entry.path();
            let Some(fname) = path.file_name().and_then(|n| n.to_str()) else { continue };
            if !fname.ends_with(".service") { continue; }
            // Skip template units (contain @)
            if fname.contains('@') && !fname.contains("@.") { continue; }
            let name = fname.strip_suffix(".service").unwrap_or(fname).to_string();
            found.entry(name).or_insert(path);
        }
    }
    found
}

// ── Unit file parsing ─────────────────────────────────────────────────────────

fn parse_unit_description(path: &Path) -> String {
    let Ok(content) = fs::read_to_string(path) else {
        return String::new();
    };
    let mut in_unit = false;
    for line in content.lines() {
        let t = line.trim();
        if t.eq_ignore_ascii_case("[unit]") {
            in_unit = true;
            continue;
        }
        if t.starts_with('[') {
            in_unit = false;
            continue;
        }
        if in_unit {
            if let Some(val) = t.strip_prefix("Description=") {
                return val.trim().to_string();
            }
        }
    }
    String::new()
}

// ── Enabled state detection ───────────────────────────────────────────────────

/// Check if a service is "enabled" by looking for symlinks in .wants/ and
/// .requires/ directories under the systemd config paths.
fn detect_enabled_state(service_file_name: &str) -> String {
    let targets_dirs = [
        "/etc/systemd/system",
        "/run/systemd/system",
        "/usr/lib/systemd/system",
        "/lib/systemd/system",
    ];

    let svc = format!("{}.service", service_file_name);

    for base in &targets_dirs {
        let Ok(entries) = fs::read_dir(base) else { continue };
        for entry in entries.flatten() {
            let path = entry.path();
            let Some(name) = path.file_name().and_then(|n| n.to_str()) else { continue };
            if !(name.ends_with(".wants") || name.ends_with(".requires")) { continue; }
            if !path.is_dir() { continue; }
            let link = path.join(&svc);
            if link.exists() || fs::symlink_metadata(&link).is_ok() {
                return "enabled".to_string();
            }
        }
    }

    // Check for a static alias — if the unit file has no [Install] section
    // it's considered "static".
    if let Some(unit_path) = find_unit_file(service_file_name) {
        if let Ok(content) = fs::read_to_string(&unit_path) {
            let has_install = content.lines().any(|l| l.trim().eq_ignore_ascii_case("[install]"));
            if !has_install {
                return "static".to_string();
            }
        }
    }

    // Check if masked (symlink to /dev/null)
    for base in &targets_dirs {
        let p = Path::new(base).join(&svc);
        if let Ok(target) = fs::read_link(&p) {
            if target == Path::new("/dev/null") {
                return "masked".to_string();
            }
        }
    }

    "disabled".to_string()
}

fn find_unit_file(service_name: &str) -> Option<PathBuf> {
    let svc = format!("{}.service", service_name);
    for dir in unit_file_dirs() {
        let p = dir.join(&svc);
        if p.exists() {
            return Some(p);
        }
    }
    None
}

// ── Active state detection via cgroup fs ──────────────────────────────────────

/// Determine if a service is running by inspecting its cgroup.
///
/// systemd places each service in a cgroup under:
///   /sys/fs/cgroup/system.slice/<name>.service/     (cgroup v2)
///   /sys/fs/cgroup/systemd/system.slice/<name>.service/  (cgroup v1 hybrid)
///
/// If the directory exists, we check for live PIDs in `cgroup.procs` (v2) or
/// `tasks` (v1). If any PIDs exist, the service is "active" / "running".
fn detect_runtime_state(service_name: &str) -> (String, String) {
    let svc_dir = format!("{}.service", service_name);

    // Try cgroup v2 path first, then v1 hybrid
    let cgroup_paths = [
        PathBuf::from("/sys/fs/cgroup/system.slice").join(&svc_dir),
        PathBuf::from("/sys/fs/cgroup/systemd/system.slice").join(&svc_dir),
    ];

    for cg in &cgroup_paths {
        if !cg.is_dir() { continue; }

        // Look for PIDs in cgroup.procs (v2) or tasks (v1)
        let pids_file = if cg.join("cgroup.procs").exists() {
            cg.join("cgroup.procs")
        } else if cg.join("tasks").exists() {
            cg.join("tasks")
        } else {
            continue;
        };

        if let Ok(content) = fs::read_to_string(&pids_file) {
            let has_pids = content.lines().any(|l| {
                l.trim().parse::<u32>().is_ok()
            });
            if has_pids {
                return ("active".to_string(), "running".to_string());
            } else {
                // cgroup exists but empty → was active, now dead/exited
                return ("inactive".to_string(), "dead".to_string());
            }
        }
    }

    // Also check for failed state via systemd's transient runtime files
    let run_path = PathBuf::from("/run/systemd/units")
        .join(format!("invocation:{}.service", service_name));
    if run_path.exists() {
        // Invocation file exists but no cgroup pids → likely exited
        return ("inactive".to_string(), "dead".to_string());
    }

    ("inactive".to_string(), "dead".to_string())
}

// ── Load state ────────────────────────────────────────────────────────────────

fn detect_load_state(service_name: &str) -> String {
    let svc = format!("{}.service", service_name);

    // Check if masked (symlinked to /dev/null)
    for dir in unit_file_dirs() {
        let p = dir.join(&svc);
        if let Ok(target) = fs::read_link(&p) {
            if target == Path::new("/dev/null") {
                return "masked".to_string();
            }
        }
    }

    // If a unit file exists → "loaded"
    if find_unit_file(service_name).is_some() {
        return "loaded".to_string();
    }

    "not-found".to_string()
}

// ── Main listing ──────────────────────────────────────────────────────────────

fn list_services() -> Vec<SystemService> {
    let unit_files = discover_unit_files();

    // Also discover services that have active cgroups but might not have unit
    // files in the standard paths (e.g. dynamically generated units).
    let mut all_names: HashSet<String> = unit_files.keys().cloned().collect();

    let cgroup_slice = Path::new("/sys/fs/cgroup/system.slice");
    if let Ok(entries) = fs::read_dir(cgroup_slice) {
        for entry in entries.flatten() {
            if let Some(name) = entry.file_name().to_str() {
                if let Some(svc) = name.strip_suffix(".service") {
                    all_names.insert(svc.to_string());
                }
            }
        }
    }

    let mut services: Vec<SystemService> = Vec::with_capacity(all_names.len());

    for name in &all_names {
        let description = if let Some(path) = unit_files.get(name) {
            parse_unit_description(path)
        } else {
            String::new()
        };

        let load_state = detect_load_state(name);
        let (active_state, sub_state) = detect_runtime_state(name);
        let unit_file_state = detect_enabled_state(name);

        services.push(SystemService {
            name: name.clone(),
            description,
            load_state,
            active_state,
            sub_state,
            unit_file_state,
        });
    }

    services.sort_by(|a, b| a.name.cmp(&b.name));
    services
}

// ── Tauri commands ────────────────────────────────────────────────────────────

#[tauri::command]
pub async fn get_services() -> Result<Vec<SystemService>, String> {
    Ok(list_services())
}

/// Call systemctl via `sudo -S`, reading the password from stdin.
/// This lets the frontend collect the password via a GUI dialog instead of
/// a terminal prompt.
async fn systemd_unit_action(action: &str, service_name: &str, password: &str) -> Result<(), String> {
    use std::io::Write;
    use std::process::{Command, Stdio};

    let unit = format!("{}.service", service_name);
    let password = password.to_string();
    let action = action.to_string();
    let fallback_msg = format!("Failed to {} {}", action, service_name);

    let output = tauri::async_runtime::spawn_blocking(move || {
        let mut child = Command::new("sudo")
            .args(["-S", "systemctl", &action, &unit])
            .stdin(Stdio::piped())
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .spawn()
            .map_err(|e| format!("Failed to spawn sudo: {}", e))?;

        if let Some(mut stdin) = child.stdin.take() {
            let _ = stdin.write_all(format!("{}\n", password).as_bytes());
        }

        child.wait_with_output().map_err(|e| format!("Failed to wait: {}", e))
    })
    .await
    .map_err(|e| format!("Task error: {}", e))?
    .map_err(|e| e)?;

    if output.status.success() {
        return Ok(());
    }

    let stderr = String::from_utf8_lossy(&output.stderr);
    if stderr.contains("incorrect password")
        || stderr.contains("Authentication failure")
        || stderr.contains("Sorry, try again")
    {
        return Err("incorrect_password".to_string());
    }

    let msg = stderr.trim().to_string();
    Err(if msg.is_empty() { fallback_msg } else { msg })
}

#[tauri::command]
pub async fn stop_service(name: String, password: String) -> Result<(), String> {
    systemd_unit_action("stop", &name, &password).await
}

#[tauri::command]
pub async fn restart_service(name: String, password: String) -> Result<(), String> {
    systemd_unit_action("restart", &name, &password).await
}

#[tauri::command]
pub async fn start_service(name: String, password: String) -> Result<(), String> {
    systemd_unit_action("start", &name, &password).await
}
