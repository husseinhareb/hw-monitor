use serde::{Deserialize, Serialize};
use std::collections::{BTreeSet, HashMap};
use std::path::{Path, PathBuf};
use std::process::{Command, Stdio};
use std::thread;
use std::time::{Duration, Instant};

const ACTION_TIMEOUT: Duration = Duration::from_secs(120);

#[derive(Serialize, Deserialize, Debug, Clone, PartialEq, Eq)]
pub struct SystemService {
    pub name: String,
    pub description: String,
    pub load_state: String,
    pub active_state: String,
    pub sub_state: String,
    pub unit_file_state: String,
}

#[derive(Serialize, Deserialize, Debug, Clone, PartialEq, Eq)]
pub struct ServiceDetails {
    pub name: String,
    pub unit_file_path: Option<String>,
    pub status: String,
    pub logs: String,
}

#[derive(Debug, Clone, PartialEq, Eq)]
struct RuntimeService {
    description: String,
    load_state: String,
    active_state: String,
    sub_state: String,
}

fn service_name(unit: &str) -> Option<String> {
    unit.strip_suffix(".service").map(ToOwned::to_owned)
}

fn validate_service_name_argument(name: &str) -> Result<(), String> {
    if name.is_empty() {
        return Err("invalid_service_name".to_string());
    }

    if name.starts_with('-')
        || name.contains('/')
        || name.contains('\0')
        || name.chars().any(char::is_whitespace)
    {
        return Err("invalid_service_name".to_string());
    }

    Ok(())
}

fn validate_service_action(action: &str) -> Result<(), String> {
    if matches!(action, "start" | "stop" | "restart" | "enable" | "disable") {
        Ok(())
    } else {
        Err("invalid_service_action".to_string())
    }
}

fn parse_list_units_output(output: &str) -> HashMap<String, RuntimeService> {
    let mut services = HashMap::new();

    for line in output.lines() {
        let trimmed = line.trim();
        if trimmed.is_empty() {
            continue;
        }

        let mut parts = trimmed.split_whitespace();
        let Some(unit) = parts.next() else { continue };
        let Some(load_state) = parts.next() else {
            continue;
        };
        let Some(active_state) = parts.next() else {
            continue;
        };
        let Some(sub_state) = parts.next() else {
            continue;
        };
        let Some(name) = service_name(unit) else {
            continue;
        };
        let description = parts.collect::<Vec<_>>().join(" ");

        services.insert(
            name,
            RuntimeService {
                description,
                load_state: load_state.to_string(),
                active_state: active_state.to_string(),
                sub_state: sub_state.to_string(),
            },
        );
    }

    services
}

fn parse_list_unit_files_output(output: &str) -> HashMap<String, String> {
    let mut states = HashMap::new();

    for line in output.lines() {
        let trimmed = line.trim();
        if trimmed.is_empty() {
            continue;
        }

        let mut parts = trimmed.split_whitespace();
        let Some(unit) = parts.next() else { continue };
        let Some(unit_file_state) = parts.next() else {
            continue;
        };
        let Some(name) = service_name(unit) else {
            continue;
        };
        states.insert(name, unit_file_state.to_string());
    }

    states
}

fn merge_service_views(units_output: &str, unit_files_output: &str) -> Vec<SystemService> {
    let runtime = parse_list_units_output(units_output);
    let unit_files = parse_list_unit_files_output(unit_files_output);
    let mut names = BTreeSet::new();

    names.extend(runtime.keys().cloned());
    names.extend(unit_files.keys().cloned());

    names
        .into_iter()
        .map(|name| {
            let runtime_state = runtime.get(&name);
            let unit_file_state = unit_files
                .get(&name)
                .cloned()
                .unwrap_or_else(|| "unknown".to_string());

            let (description, load_state, active_state, sub_state) =
                if let Some(runtime_state) = runtime_state {
                    (
                        runtime_state.description.clone(),
                        runtime_state.load_state.clone(),
                        runtime_state.active_state.clone(),
                        runtime_state.sub_state.clone(),
                    )
                } else {
                    let load_state = if unit_file_state == "masked" {
                        "masked".to_string()
                    } else {
                        "loaded".to_string()
                    };
                    (
                        String::new(),
                        load_state,
                        "inactive".to_string(),
                        "dead".to_string(),
                    )
                };

            SystemService {
                name,
                description,
                load_state,
                active_state,
                sub_state,
                unit_file_state,
            }
        })
        .collect()
}

fn trusted_command_path(command: &str) -> Result<PathBuf, String> {
    ["/usr/bin", "/bin"]
        .iter()
        .map(|directory| Path::new(directory).join(command))
        .find(|path| path.is_file())
        .ok_or_else(|| format!("{command} is not installed in a trusted system directory"))
}

fn run_systemctl(args: &[&str]) -> Result<String, String> {
    let systemctl = trusted_command_path("systemctl")?;
    let output = Command::new(systemctl)
        .args(args)
        .output()
        .map_err(|e| format!("failed to run systemctl: {e}"))?;

    if output.status.success() {
        return String::from_utf8(output.stdout)
            .map_err(|e| format!("systemctl output was not utf-8: {e}"));
    }

    let stderr = String::from_utf8_lossy(&output.stderr).trim().to_string();
    let stdout = String::from_utf8_lossy(&output.stdout).trim().to_string();
    Err(if !stderr.is_empty() {
        stderr
    } else if !stdout.is_empty() {
        stdout
    } else {
        "systemctl command failed".to_string()
    })
}

fn command_text(command: &str, args: &[&str]) -> Result<String, String> {
    let command_path = trusted_command_path(command)?;
    let output = Command::new(command_path)
        .args(args)
        .output()
        .map_err(|e| format!("failed to run {command}: {e}"))?;

    let stdout = String::from_utf8_lossy(&output.stdout).trim().to_string();
    let stderr = String::from_utf8_lossy(&output.stderr).trim().to_string();

    Ok(match (stdout.is_empty(), stderr.is_empty()) {
        (false, false) => format!("{stdout}\n{stderr}"),
        (false, true) => stdout,
        (true, false) => stderr,
        (true, true) => String::new(),
    })
}

fn list_services() -> Result<Vec<SystemService>, String> {
    let units_output = run_systemctl(&[
        "list-units",
        "--type=service",
        "--all",
        "--no-pager",
        "--no-legend",
    ])?;
    let unit_files_output = run_systemctl(&[
        "list-unit-files",
        "--type=service",
        "--all",
        "--no-pager",
        "--no-legend",
    ])?;
    Ok(merge_service_views(&units_output, &unit_files_output))
}

fn ensure_known_service_name(name: &str) -> Result<(), String> {
    validate_service_name_argument(name)?;

    if list_services()?.iter().any(|service| service.name == name) {
        Ok(())
    } else {
        Err("unknown_service".to_string())
    }
}

#[tauri::command]
pub async fn get_services() -> Result<Vec<SystemService>, String> {
    tauri::async_runtime::spawn_blocking(list_services)
        .await
        .map_err(|e| format!("failed to join service listing task: {e}"))?
}

fn service_details(service_name: &str) -> Result<ServiceDetails, String> {
    ensure_known_service_name(service_name)?;

    let unit = format!("{service_name}.service");
    let unit_file_path = run_systemctl(&["show", &unit, "--property=FragmentPath", "--value"])
        .ok()
        .map(|path| path.trim().to_string())
        .filter(|path| !path.is_empty());
    let status = command_text("systemctl", &["status", &unit, "--no-pager", "--lines=20"])?;
    let logs = command_text(
        "journalctl",
        &[
            "-u",
            &unit,
            "--no-pager",
            "--lines=80",
            "--output=short-iso",
        ],
    )?;

    Ok(ServiceDetails {
        name: service_name.to_string(),
        unit_file_path,
        status,
        logs,
    })
}

#[tauri::command]
pub async fn get_service_details(name: String) -> Result<ServiceDetails, String> {
    tauri::async_runtime::spawn_blocking(move || service_details(&name))
        .await
        .map_err(|e| format!("failed to join service details task: {e}"))?
}

fn run_privileged_action(action: &str, service_name: &str) -> Result<(), String> {
    validate_service_action(action)?;
    ensure_known_service_name(service_name)?;

    let unit = format!("{service_name}.service");
    let fallback_msg = format!("failed to {action} {service_name}");
    let pkexec = trusted_command_path("pkexec")?;
    let systemctl = trusted_command_path("systemctl")?;

    // Authentication is handled by the desktop's native polkit agent. User
    // credentials never enter the webview, Tauri IPC, or this process.
    let mut child = Command::new(pkexec)
        .arg(systemctl)
        .args([action, &unit])
        .stdin(Stdio::null())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .map_err(|e| format!("failed to start native authorization: {e}"))?;

    let started_at = Instant::now();

    loop {
        if started_at.elapsed() > ACTION_TIMEOUT {
            let _ = child.kill();
            let _ = child.wait();
            return Err("service_action_timeout".to_string());
        }

        match child.try_wait() {
            Ok(Some(_)) => {
                let output = child
                    .wait_with_output()
                    .map_err(|e| format!("failed to wait for native authorization: {e}"))?;

                if output.status.success() {
                    return Ok(());
                }

                let stderr = String::from_utf8_lossy(&output.stderr);
                if output.status.code() == Some(126) || output.status.code() == Some(127) {
                    return Err("service_authorization_cancelled".to_string());
                }

                let stderr = stderr.trim();
                return Err(if stderr.is_empty() {
                    fallback_msg
                } else {
                    stderr.to_string()
                });
            }
            Ok(None) => thread::sleep(Duration::from_millis(50)),
            Err(e) => {
                return Err(format!(
                    "failed while waiting for native authorization: {e}"
                ))
            }
        }
    }
}

async fn systemd_unit_action(action: &str, service_name: &str) -> Result<(), String> {
    let action = action.to_string();
    let service_name = service_name.to_string();

    tauri::async_runtime::spawn_blocking(move || run_privileged_action(&action, &service_name))
        .await
        .map_err(|e| format!("failed to join service action task: {e}"))?
}

#[tauri::command]
pub async fn stop_service(name: String) -> Result<(), String> {
    systemd_unit_action("stop", &name).await
}

#[tauri::command]
pub async fn restart_service(name: String) -> Result<(), String> {
    systemd_unit_action("restart", &name).await
}

#[tauri::command]
pub async fn start_service(name: String) -> Result<(), String> {
    systemd_unit_action("start", &name).await
}

#[tauri::command]
pub async fn enable_service(name: String) -> Result<(), String> {
    systemd_unit_action("enable", &name).await
}

#[tauri::command]
pub async fn disable_service(name: String) -> Result<(), String> {
    systemd_unit_action("disable", &name).await
}

#[cfg(test)]
mod tests {
    use super::{
        merge_service_views, parse_list_unit_files_output, parse_list_units_output,
        validate_service_action, validate_service_name_argument,
    };

    #[test]
    fn parses_runtime_states_including_active_exited() {
        let input = "\
dbus.service loaded active running D-Bus System Message Bus
systemd-tmpfiles-clean.service loaded active exited Cleanup of Temporary Directories
masked-demo.service masked inactive dead Demo
";

        let parsed = parse_list_units_output(input);

        assert_eq!(parsed["dbus"].active_state, "active");
        assert_eq!(parsed["dbus"].sub_state, "running");
        assert_eq!(parsed["systemd-tmpfiles-clean"].sub_state, "exited");
        assert_eq!(parsed["masked-demo"].load_state, "masked");
    }

    #[test]
    fn validates_service_name_arguments_before_systemctl_calls() {
        assert!(validate_service_name_argument("ssh").is_ok());
        assert!(validate_service_name_argument("user@1000").is_ok());
        assert!(validate_service_name_argument("dbus-org.freedesktop.resolve1").is_ok());
        assert!(validate_service_name_argument("systemd\\x2dresolved").is_ok());
        assert!(validate_service_name_argument("custom+escaped:name").is_ok());

        assert!(validate_service_name_argument("").is_err());
        assert!(validate_service_name_argument("--system").is_err());
        assert!(validate_service_name_argument("../ssh").is_err());
        assert!(validate_service_name_argument("ssh service").is_err());
        assert!(validate_service_name_argument("ssh\0service").is_err());
    }

    #[test]
    fn only_exposes_the_intended_privileged_actions() {
        for action in ["start", "stop", "restart", "enable", "disable"] {
            assert!(validate_service_action(action).is_ok());
        }
        assert!(validate_service_action("mask").is_err());
        assert!(validate_service_action("--root=/tmp").is_err());
    }

    #[test]
    fn parses_unit_file_states() {
        let input = "\
dbus.service static -
masked-demo.service masked enabled
cron.service enabled enabled
";

        let parsed = parse_list_unit_files_output(input);

        assert_eq!(parsed["dbus"], "static");
        assert_eq!(parsed["masked-demo"], "masked");
        assert_eq!(parsed["cron"], "enabled");
    }

    #[test]
    fn merge_keeps_same_frontend_shape() {
        let units = "\
dbus.service loaded active running D-Bus System Message Bus
systemd-tmpfiles-clean.service loaded active exited Cleanup of Temporary Directories
";
        let unit_files = "\
dbus.service static -
masked-demo.service masked enabled
systemd-tmpfiles-clean.service static -
";

        let merged = merge_service_views(units, unit_files);

        assert!(merged.iter().any(|svc| {
            svc.name == "masked-demo"
                && svc.load_state == "masked"
                && svc.active_state == "inactive"
                && svc.sub_state == "dead"
                && svc.unit_file_state == "masked"
        }));

        assert!(merged.iter().any(|svc| {
            svc.name == "systemd-tmpfiles-clean"
                && svc.active_state == "active"
                && svc.sub_state == "exited"
                && svc.unit_file_state == "static"
        }));
    }
}
