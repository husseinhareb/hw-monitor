use base64::{engine::general_purpose::STANDARD, Engine};
use std::collections::{HashMap, HashSet};
use std::fs;
use std::path::{Path, PathBuf};
use std::sync::{Mutex, OnceLock};

static ICON_CACHE: OnceLock<Mutex<HashMap<String, Option<String>>>> = OnceLock::new();
static ICON_INDEX: OnceLock<IconIndex> = OnceLock::new();

#[derive(Default)]
struct IconIndex {
    process_to_icon_name: HashMap<String, String>,
    icon_name_to_path: HashMap<String, PathBuf>,
}

fn cache() -> &'static Mutex<HashMap<String, Option<String>>> {
    ICON_CACHE.get_or_init(|| Mutex::new(HashMap::new()))
}

fn icon_index() -> &'static IconIndex {
    ICON_INDEX.get_or_init(build_icon_index)
}

#[tauri::command]
pub fn get_process_icon(name: String) -> Option<String> {
    let lookup_key = name.to_lowercase();

    if let Ok(guard) = cache().lock() {
        if let Some(cached) = guard.get(&lookup_key) {
            return cached.clone();
        }
    }

    let result = resolve_icon(&lookup_key);

    if let Ok(mut guard) = cache().lock() {
        guard.insert(lookup_key, result.clone());
    }

    result
}

fn resolve_icon(process_name: &str) -> Option<String> {
    let icon_name = icon_index()
        .process_to_icon_name
        .get(process_name)
        .cloned()?;

    if icon_name.starts_with('/') {
        let absolute_path = Path::new(&icon_name);
        if absolute_path.exists() {
            return read_as_data_url(absolute_path);
        }
    }

    let icon_path = icon_index().icon_name_to_path.get(&icon_name)?;
    read_as_data_url(icon_path)
}

fn build_icon_index() -> IconIndex {
    IconIndex {
        process_to_icon_name: build_process_icon_name_index(),
        icon_name_to_path: build_icon_path_index(),
    }
}

fn build_process_icon_name_index() -> HashMap<String, String> {
    let mut index = HashMap::new();

    for dir in desktop_search_dirs() {
        let Ok(entries) = fs::read_dir(&dir) else {
            continue;
        };

        for entry in entries.flatten() {
            let path = entry.path();
            if path.extension().and_then(|ext| ext.to_str()) != Some("desktop") {
                continue;
            }

            let Ok(content) = fs::read_to_string(&path) else {
                continue;
            };
            let Some(icon_name) = extract_desktop_field(&content, "Icon") else {
                continue;
            };

            let mut names = HashSet::new();
            if let Some(stem) = path.file_stem().and_then(|value| value.to_str()) {
                names.insert(stem.to_lowercase());
            }
            names.extend(extract_exec_basenames(&content));

            for name in names {
                index.entry(name).or_insert_with(|| icon_name.clone());
            }
        }
    }

    index
}

fn build_icon_path_index() -> HashMap<String, PathBuf> {
    let mut index = HashMap::new();

    for base in preferred_icon_search_roots() {
        let Some(priority) = icon_priority(&base) else {
            continue;
        };

        if let Ok(entries) = fs::read_dir(&base) {
            for entry in entries.flatten() {
                let path = entry.path();
                if !path.is_file() {
                    continue;
                }

                let Some(ext) = path.extension().and_then(|value| value.to_str()) else {
                    continue;
                };
                if !matches!(ext, "png" | "svg" | "jpg" | "jpeg") {
                    continue;
                }

                let Some(stem) = path.file_stem().and_then(|value| value.to_str()) else {
                    continue;
                };

                index
                    .entry(stem.to_string())
                    .or_insert_with(|| (priority, path.clone()));
            }
        }
    }

    index
        .into_iter()
        .map(|(icon_name, (_priority, path))| (icon_name, path))
        .collect()
}

fn preferred_icon_search_roots() -> Vec<PathBuf> {
    let mut roots = Vec::new();

    for base in [
        PathBuf::from("/usr/share/icons/hicolor"),
        PathBuf::from("/usr/local/share/icons/hicolor"),
    ] {
        roots.extend(expand_icon_roots(&base));
    }

    if let Ok(home) = std::env::var("HOME") {
        roots.extend(expand_icon_roots(
            &PathBuf::from(&home).join(".local/share/icons/hicolor"),
        ));
        roots.push(PathBuf::from(&home).join(".local/share/icons"));
        roots.push(PathBuf::from(&home).join(".icons"));
    }

    roots.push(PathBuf::from("/usr/share/icons"));
    roots.push(PathBuf::from("/usr/local/share/icons"));
    roots.push(PathBuf::from("/usr/share/pixmaps"));
    roots.push(PathBuf::from("/usr/local/share/pixmaps"));

    roots
}

fn expand_icon_roots(base: &Path) -> Vec<PathBuf> {
    let mut roots = Vec::new();
    let sizes = [
        "256x256", "128x128", "scalable", "96x96", "64x64", "48x48", "32x32", "24x24", "22x22",
        "16x16",
    ];
    let subdirs = ["apps", "devices", "mimetypes"];

    for size in sizes {
        for subdir in subdirs {
            roots.push(base.join(size).join(subdir));
        }
    }

    roots
}

fn icon_priority(path: &Path) -> Option<usize> {
    const PRIORITY_ROOTS: [&str; 10] = [
        "/usr/share/icons/hicolor/256x256/apps",
        "/usr/share/icons/hicolor/128x128/apps",
        "/usr/share/icons/hicolor/scalable/apps",
        "/usr/share/icons",
        "/usr/local/share/icons",
        "/usr/share/pixmaps",
        "/usr/local/share/pixmaps",
        ".local/share/icons/hicolor",
        ".local/share/icons",
        ".icons",
    ];

    let rendered = path.to_string_lossy();
    PRIORITY_ROOTS
        .iter()
        .position(|root| rendered.contains(root))
        .or(Some(PRIORITY_ROOTS.len()))
}

fn desktop_search_dirs() -> Vec<PathBuf> {
    let mut dirs = vec![
        PathBuf::from("/usr/share/applications"),
        PathBuf::from("/usr/local/share/applications"),
        PathBuf::from("/var/lib/flatpak/exports/share/applications"),
    ];

    if let Ok(home) = std::env::var("HOME") {
        dirs.push(PathBuf::from(&home).join(".local/share/applications"));
        dirs.push(PathBuf::from(&home).join(".local/share/flatpak/exports/share/applications"));
    }

    dirs
}

fn extract_exec_basenames(content: &str) -> HashSet<String> {
    let mut names = HashSet::new();
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

        if let Some(exec_value) = trimmed.strip_prefix("Exec=") {
            if let Some(name) = parse_exec_basename(exec_value) {
                names.insert(name);
            }
        }
    }

    names
}

fn parse_exec_basename(exec_value: &str) -> Option<String> {
    let tokens = exec_value.split_whitespace();

    for token in tokens {
        if token == "env" {
            continue;
        }
        if token.contains('=') && !token.starts_with('/') {
            continue;
        }

        let basename = Path::new(token)
            .file_name()
            .and_then(|value| value.to_str())
            .unwrap_or(token)
            .to_lowercase();

        if !basename.is_empty() {
            return Some(basename);
        }
    }

    None
}

#[allow(dead_code)]
pub fn exec_matches_process(content: &str, process_name: &str) -> bool {
    extract_exec_basenames(content).contains(&process_name.to_lowercase())
}

pub fn extract_desktop_field(content: &str, key: &str) -> Option<String> {
    let prefix = format!("{key}=");
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
            if let Some(value) = trimmed.strip_prefix(&prefix) {
                let value = value.trim().to_string();
                if !value.is_empty() {
                    return Some(value);
                }
            }
        }
    }

    None
}

fn read_as_data_url(path: &Path) -> Option<String> {
    let bytes = fs::read(path).ok()?;
    let ext = path.extension()?.to_str()?.to_lowercase();
    let mime = match ext.as_str() {
        "png" => "image/png",
        "jpg" | "jpeg" => "image/jpeg",
        "svg" => "image/svg+xml",
        "xpm" => return None,
        _ => return None,
    };
    Some(format!("data:{mime};base64,{}", STANDARD.encode(&bytes)))
}
