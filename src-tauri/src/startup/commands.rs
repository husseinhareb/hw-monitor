//! Startup apps: XDG autostart entries (https://specifications.freedesktop.org/autostart-spec/).
//! System entries live in $XDG_CONFIG_DIRS/autostart (default /etc/xdg/autostart), user
//! entries in $XDG_CONFIG_HOME/autostart. A user file with the same name overrides the
//! system one, which is how an app is disabled without root: copy it with Hidden=true.
//! systemd user services that start at login are listed too, toggled with `systemctl --user`.

use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;
use std::fs;
use std::path::PathBuf;

use crate::config::get_config_dir;
use crate::proc_icon::extract_desktop_field;
use crate::services::run_systemctl;

#[derive(Serialize, Deserialize, Debug, Clone, PartialEq)]
pub struct StartupApp {
    /// Desktop file name (e.g. "discord.desktop"), used to toggle the entry.
    pub id: String,
    pub name: String,
    pub comment: Option<String>,
    pub command: Option<String>,
    /// Executable basename, so the frontend can resolve the app icon.
    pub executable: Option<String>,
    pub enabled: bool,
    /// "system" when the entry ships in a system autostart dir, "user" for a user autostart
    /// file, "service" for a systemd user service.
    pub scope: String,
}

fn user_autostart_dir() -> Option<PathBuf> {
    get_config_dir().map(|dir| dir.join("autostart"))
}

fn system_autostart_dirs() -> Vec<PathBuf> {
    let dirs = std::env::var("XDG_CONFIG_DIRS")
        .ok()
        .filter(|v| !v.is_empty())
        .unwrap_or_else(|| "/etc/xdg".into());
    dirs.split(':')
        .filter(|d| !d.is_empty())
        .map(|d| PathBuf::from(d).join("autostart"))
        .collect()
}

fn desktop_files(dir: &PathBuf) -> Vec<(String, PathBuf)> {
    let Ok(entries) = fs::read_dir(dir) else {
        return Vec::new();
    };
    entries
        .flatten()
        .filter_map(|e| {
            let id = e.file_name().to_string_lossy().into_owned();
            id.ends_with(".desktop").then(|| (id, e.path()))
        })
        .collect()
}

fn is_true(content: &str, key: &str) -> Option<bool> {
    extract_desktop_field(content, key).map(|v| v.eq_ignore_ascii_case("true"))
}

fn executable_of(exec: &str) -> Option<String> {
    exec.split_whitespace()
        .find(|token| *token != "env" && !token.contains('='))
        .map(|token| {
            token
                .trim_matches('"')
                .rsplit('/')
                .next()
                .unwrap_or(token)
                .to_string()
        })
        .filter(|name| !name.is_empty())
}

/// Build the entry shown to the user from the effective desktop file. Returns None
/// for entries that never start in this session (not an Application, or excluded
/// by OnlyShowIn/NotShowIn for the current desktop).
pub fn parse_startup_entry(
    id: &str,
    content: &str,
    scope: &str,
    current_desktops: &[String],
) -> Option<StartupApp> {
    if extract_desktop_field(content, "Type").is_some_and(|t| t != "Application") {
        return None;
    }
    let listed = |key: &str| {
        extract_desktop_field(content, key).map(|v| {
            v.split(';')
                .any(|d| current_desktops.iter().any(|c| c.eq_ignore_ascii_case(d)))
        })
    };
    // With no desktop detected (plain window manager) there is nothing to filter against.
    if !current_desktops.is_empty()
        && (listed("OnlyShowIn") == Some(false) || listed("NotShowIn") == Some(true))
    {
        return None;
    }

    let command = extract_desktop_field(content, "Exec");
    let enabled = is_true(content, "Hidden") != Some(true)
        && is_true(content, "X-GNOME-Autostart-enabled") != Some(false);
    Some(StartupApp {
        id: id.to_string(),
        name: extract_desktop_field(content, "Name")
            .unwrap_or_else(|| id.trim_end_matches(".desktop").to_string()),
        comment: extract_desktop_field(content, "Comment"),
        executable: command.as_deref().and_then(executable_of),
        command,
        enabled,
        scope: scope.to_string(),
    })
}

/// Set `key=value` inside the [Desktop Entry] group, replacing any existing value.
pub fn set_desktop_key(content: &str, key: &str, value: &str) -> String {
    let entry = format!("{key}={value}");
    let mut out: Vec<String> = Vec::new();
    let mut in_entry = false;
    let mut written = false;

    for line in content.lines() {
        let trimmed = line.trim();
        if trimmed.starts_with('[') {
            if in_entry && !written {
                out.push(entry.clone());
                written = true;
            }
            in_entry = trimmed == "[Desktop Entry]";
        } else if in_entry
            && trimmed
                .split_once('=')
                .is_some_and(|(k, _)| k.trim() == key)
        {
            if !written {
                out.push(entry.clone());
                written = true;
            }
            continue;
        }
        out.push(line.to_string());
    }
    if !written {
        if !in_entry {
            out.push("[Desktop Entry]".into());
        }
        out.push(entry);
    }
    out.join("\n") + "\n"
}

fn current_desktops() -> Vec<String> {
    std::env::var("XDG_CURRENT_DESKTOP")
        .unwrap_or_default()
        .split(':')
        .filter(|d| !d.is_empty())
        .map(str::to_string)
        .collect()
}

#[tauri::command]
pub fn get_startup_apps() -> Vec<StartupApp> {
    // id -> (effective file, scope). Earlier system dirs take precedence, the user dir wins over all.
    let mut files: BTreeMap<String, (PathBuf, &str)> = BTreeMap::new();
    for dir in system_autostart_dirs() {
        for (id, path) in desktop_files(&dir) {
            files.entry(id).or_insert((path, "system"));
        }
    }
    if let Some(dir) = user_autostart_dir() {
        for (id, path) in desktop_files(&dir) {
            let scope = files.get(&id).map_or("user", |(_, scope)| *scope);
            files.insert(id, (path, scope));
        }
    }

    let desktops = current_desktops();
    let mut apps: Vec<StartupApp> = files
        .into_iter()
        .filter_map(|(id, (path, scope))| {
            let content = fs::read_to_string(path).ok()?;
            parse_startup_entry(&id, &content, scope, &desktops)
        })
        .collect();
    apps.extend(user_services());
    apps.sort_by_key(|app| app.name.to_lowercase());
    apps
}

/// Every value of `key` in a systemd unit file, split on whitespace (WantedBy= can repeat).
fn unit_values<'a>(content: &'a str, key: &str) -> Vec<&'a str> {
    content
        .lines()
        .filter_map(|line| line.trim().split_once('='))
        .filter(|(k, _)| k.trim() == key)
        .flat_map(|(_, v)| v.split_whitespace())
        .collect()
}

/// Build the entry for a systemd user service from its unit file. Disabled services are
/// kept only when enabling them would start them at login and they are not socket
/// activated (Also=), which would otherwise surface plumbing like pipewire.
pub fn parse_user_service(id: &str, content: &str, enabled: bool) -> Option<StartupApp> {
    let content = &content.replace("\\\n", " ");
    let at_login = unit_values(content, "WantedBy").iter().any(|t| {
        matches!(
            *t,
            "default.target" | "graphical-session.target" | "graphical-session-pre.target"
        )
    });
    if !enabled && (!at_login || !unit_values(content, "Also").is_empty()) {
        return None;
    }
    let field = |key: &str| {
        content.lines().find_map(|line| {
            let (k, v) = line.trim().split_once('=')?;
            (k.trim() == key && !v.trim().is_empty()).then(|| v.trim().to_string())
        })
    };
    // Strip systemd's ExecStart prefixes (-, @, :, +, !)
    let home = std::env::var("HOME").unwrap_or_default();
    let command = field("ExecStart").map(|c| {
        let c = c
            .trim_start_matches(['-', '@', ':', '+', '!'])
            .split_whitespace()
            .collect::<Vec<_>>()
            .join(" ");
        expand_specifiers(&c, &home)
    });
    Some(StartupApp {
        id: id.to_string(),
        name: id.trim_end_matches(".service").to_string(),
        comment: field("Description"),
        executable: command.as_deref().and_then(executable_of),
        command,
        enabled,
        scope: "service".to_string(),
    })
}

/// Expand the systemd specifiers a user unit's ExecStart commonly uses: %h (home) and %% (a
/// literal %). Others are left as written.
pub fn expand_specifiers(command: &str, home: &str) -> String {
    let mut out = String::with_capacity(command.len());
    let mut chars = command.chars();
    while let Some(c) = chars.next() {
        if c != '%' {
            out.push(c);
            continue;
        }
        match chars.next() {
            Some('h') => out.push_str(home),
            Some('%') => out.push('%'),
            Some(other) => {
                out.push('%');
                out.push(other);
            }
            None => out.push('%'),
        }
    }
    out
}

fn user_services() -> Vec<StartupApp> {
    let Ok(files) = run_systemctl(&[
        "--user",
        "list-unit-files",
        "--type=service",
        "--state=enabled,disabled",
        "--no-legend",
        "--plain",
        "--no-pager",
    ]) else {
        return Vec::new();
    };
    // Template units (foo@.service) cannot be enabled without an instance name
    let units: BTreeMap<&str, bool> = files
        .lines()
        .filter_map(|line| {
            let mut fields = line.split_whitespace();
            let unit = fields.next()?;
            let state = fields.next()?;
            (!unit.contains('@')).then_some((unit, state == "enabled"))
        })
        .collect();
    if units.is_empty() {
        return Vec::new();
    }

    let mut args = vec!["--user", "show", "--property=Id,FragmentPath", "--"];
    args.extend(units.keys());
    let Ok(show) = run_systemctl(&args) else {
        return Vec::new();
    };
    show.split("\n\n")
        .filter_map(|block| {
            let mut id = None;
            let mut path = None;
            for line in block.lines() {
                match line.split_once('=') {
                    Some(("Id", value)) => id = Some(value),
                    Some(("FragmentPath", value)) if !value.is_empty() => path = Some(value),
                    _ => {}
                }
            }
            let id = id?;
            let content = fs::read_to_string(path?).ok()?;
            parse_user_service(id, &content, *units.get(id)?)
        })
        .collect()
}

fn set_user_service_enabled(id: &str, enabled: bool) -> Result<(), String> {
    // Only toggle a service this tab lists, never an arbitrary unit name from the UI
    if !user_services().iter().any(|app| app.id == id) {
        return Err(format!("startup entry not found: {id}"));
    }
    let action = if enabled { "enable" } else { "disable" };
    run_systemctl(&["--user", action, "--", id]).map(|_| ())
}

#[tauri::command]
pub fn set_startup_app_enabled(id: String, enabled: bool) -> Result<(), String> {
    if id.ends_with(".service") {
        return set_user_service_enabled(&id, enabled);
    }
    // The id comes from the UI; only accept a bare desktop file name.
    if !id.ends_with(".desktop") || id.contains('/') || id.starts_with('.') {
        return Err(format!("invalid startup entry: {id}"));
    }
    let user_dir = user_autostart_dir().ok_or("unable to determine config directory")?;
    let user_path = user_dir.join(&id);

    let source = if user_path.exists() {
        Some(user_path.clone())
    } else {
        system_autostart_dirs()
            .into_iter()
            .map(|dir| dir.join(&id))
            .find(|path| path.exists())
    }
    .ok_or_else(|| format!("startup entry not found: {id}"))?;
    let content = fs::read_to_string(&source).map_err(|e| e.to_string())?;

    let value = if enabled { "true" } else { "false" };
    let mut updated = set_desktop_key(&content, "Hidden", if enabled { "false" } else { "true" });
    if extract_desktop_field(&content, "X-GNOME-Autostart-enabled").is_some() {
        updated = set_desktop_key(&updated, "X-GNOME-Autostart-enabled", value);
    }

    fs::create_dir_all(&user_dir).map_err(|e| e.to_string())?;
    fs::write(&user_path, updated).map_err(|e| e.to_string())
}
