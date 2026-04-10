use base64::{engine::general_purpose::STANDARD, Engine};
use std::collections::HashMap;
use std::fs;
use std::path::{Path, PathBuf};
use std::sync::{Mutex, OnceLock};

// ── Cache ─────────────────────────────────────────────────────────────────────

static ICON_CACHE: OnceLock<Mutex<HashMap<String, Option<String>>>> = OnceLock::new();

fn cache() -> &'static Mutex<HashMap<String, Option<String>>> {
    ICON_CACHE.get_or_init(|| Mutex::new(HashMap::new()))
}

// ── Tauri command ─────────────────────────────────────────────────────────────

/// Returns a base64-encoded data URL for the process icon, or null if not found.
#[tauri::command]
pub fn get_process_icon(name: String) -> Option<String> {
    {
        if let Ok(guard) = cache().lock() {
            if let Some(cached) = guard.get(&name) {
                return cached.clone();
            }
        }
    }

    let result = resolve_icon(&name);

    if let Ok(mut guard) = cache().lock() {
        guard.insert(name, result.clone());
    }

    result
}

// ── Resolution pipeline ───────────────────────────────────────────────────────

fn resolve_icon(process_name: &str) -> Option<String> {
    let icon_name = find_icon_name_for_process(process_name)?;

    // If the field is an absolute path, read it directly.
    if icon_name.starts_with('/') {
        let p = Path::new(&icon_name);
        if p.exists() {
            return read_as_data_url(p);
        }
    }

    let path = find_icon_file(&icon_name)?;
    read_as_data_url(&path)
}

// ── Desktop file lookup ───────────────────────────────────────────────────────

fn desktop_search_dirs() -> Vec<PathBuf> {
    let mut dirs = vec![
        PathBuf::from("/usr/share/applications"),
        PathBuf::from("/usr/local/share/applications"),
        PathBuf::from("/var/lib/flatpak/exports/share/applications"),
    ];
    if let Ok(home) = std::env::var("HOME") {
        dirs.push(PathBuf::from(&home).join(".local/share/applications"));
        dirs.push(
            PathBuf::from(&home)
                .join(".local/share/flatpak/exports/share/applications"),
        );
    }
    dirs
}

fn find_icon_name_for_process(process_name: &str) -> Option<String> {
    let name_lower = process_name.to_lowercase();

    for dir in desktop_search_dirs() {
        let Ok(entries) = fs::read_dir(&dir) else {
            continue;
        };

        for entry in entries.flatten() {
            let path = entry.path();

            // Only consider .desktop files.
            if path.extension().and_then(|e| e.to_str()) != Some("desktop") {
                continue;
            }

            // Quick check: does the desktop filename itself match?
            let stem = path
                .file_stem()
                .and_then(|s| s.to_str())
                .unwrap_or("")
                .to_lowercase();

            let Ok(content) = fs::read_to_string(&path) else {
                continue;
            };

            let matches = stem == name_lower
                || exec_matches_process(&content, &name_lower);

            if matches {
                if let Some(icon) = extract_desktop_field(&content, "Icon") {
                    return Some(icon);
                }
            }
        }
    }
    None
}

/// Checks whether any Exec= line in a .desktop file resolves to `process_name`.
pub fn exec_matches_process(content: &str, process_name: &str) -> bool {
    let mut in_entry = false;
    for line in content.lines() {
        let trimmed = line.trim();
        if trimmed == "[Desktop Entry]" {
            in_entry = true;
            continue;
        }
        if trimmed.starts_with('[') {
            in_entry = false;
            continue;
        }
        if !in_entry {
            continue;
        }
        if let Some(exec_val) = trimmed.strip_prefix("Exec=") {
            // First token, strip path.
            let cmd = exec_val.split_whitespace().next().unwrap_or("");
            let basename = Path::new(cmd)
                .file_name()
                .and_then(|n| n.to_str())
                .unwrap_or(cmd)
                .to_lowercase();
            if basename == process_name {
                return true;
            }
        }
    }
    false
}

/// Returns the value of `key=` from the [Desktop Entry] section.
pub fn extract_desktop_field(content: &str, key: &str) -> Option<String> {
    let prefix = format!("{}=", key);
    let mut in_entry = false;
    for line in content.lines() {
        let trimmed = line.trim();
        if trimmed == "[Desktop Entry]" {
            in_entry = true;
            continue;
        }
        if trimmed.starts_with('[') {
            in_entry = false;
            continue;
        }
        if in_entry {
            if let Some(val) = trimmed.strip_prefix(&prefix) {
                let v = val.trim().to_string();
                if !v.is_empty() {
                    return Some(v);
                }
            }
        }
    }
    None
}

// ── Icon file resolution ──────────────────────────────────────────────────────

fn find_icon_file(icon_name: &str) -> Option<PathBuf> {
    // Preferred sizes (largest first for quality).
    let sizes = [
        "256x256", "128x128", "scalable", "96x96", "64x64", "48x48", "32x32",
        "24x24", "22x22", "16x16",
    ];
    let exts = ["png", "svg"];
    let subdirs = ["apps", "devices", "mimetypes"];

    let hicolor_bases: Vec<PathBuf> = {
        let mut v = vec![
            PathBuf::from("/usr/share/icons/hicolor"),
            PathBuf::from("/usr/local/share/icons/hicolor"),
        ];
        if let Ok(home) = std::env::var("HOME") {
            v.push(PathBuf::from(&home).join(".local/share/icons/hicolor"));
        }
        v
    };

    for base in &hicolor_bases {
        for size in &sizes {
            for subdir in &subdirs {
                for ext in &exts {
                    let path = base.join(size).join(subdir).join(format!("{}.{}", icon_name, ext));
                    if path.exists() {
                        return Some(path);
                    }
                }
            }
        }
    }

    // Fallback: pixmaps
    let pixmap_dirs = [
        PathBuf::from("/usr/share/pixmaps"),
        PathBuf::from("/usr/local/share/pixmaps"),
    ];
    for dir in &pixmap_dirs {
        for ext in &exts {
            let path = dir.join(format!("{}.{}", icon_name, ext));
            if path.exists() {
                return Some(path);
            }
        }
        // Some pixmaps drop the extension.
        let path = dir.join(icon_name);
        if path.exists() {
            return Some(path);
        }
    }

    // Last resort: walk /usr/share/icons looking for any match.
    if let Ok(entries) = fs::read_dir("/usr/share/icons") {
        for theme_entry in entries.flatten() {
            let theme_path = theme_entry.path();
            for size in &sizes {
                for ext in &exts {
                    let path = theme_path
                        .join(size)
                        .join("apps")
                        .join(format!("{}.{}", icon_name, ext));
                    if path.exists() {
                        return Some(path);
                    }
                }
            }
        }
    }

    None
}

// ── Base64 data URL ───────────────────────────────────────────────────────────

fn read_as_data_url(path: &Path) -> Option<String> {
    let bytes = fs::read(path).ok()?;
    let ext = path.extension()?.to_str()?.to_lowercase();
    let mime = match ext.as_str() {
        "png" => "image/png",
        "jpg" | "jpeg" => "image/jpeg",
        "svg" => "image/svg+xml",
        "xpm" => return None, // XPM is complex; skip
        _ => return None,
    };
    Some(format!("data:{};base64,{}", mime, STANDARD.encode(&bytes)))
}
