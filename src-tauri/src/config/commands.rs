use serde::{Deserialize, Serialize};
use std::collections::HashSet;
use std::fs::{self, File};
use std::io::{self, Write};
use std::path::{Path, PathBuf};

const MIN_UPDATE_INTERVAL_MS: u32 = 1000;

trait ConfigValue: Sized {
    fn parse_config(s: &str) -> Result<Self, io::Error>;
    fn format_config(&self) -> String;
}

impl ConfigValue for String {
    fn parse_config(s: &str) -> Result<Self, io::Error> {
        Ok(s.to_string())
    }

    fn format_config(&self) -> String {
        self.clone()
    }
}

impl ConfigValue for u32 {
    fn parse_config(s: &str) -> Result<Self, io::Error> {
        s.parse()
            .map_err(|e| io::Error::new(io::ErrorKind::InvalidData, e))
    }

    fn format_config(&self) -> String {
        self.to_string()
    }
}

impl ConfigValue for bool {
    fn parse_config(s: &str) -> Result<Self, io::Error> {
        match s.trim().to_ascii_lowercase().as_str() {
            "true" => Ok(true),
            "false" => Ok(false),
            _ => Err(io::Error::new(
                io::ErrorKind::InvalidData,
                format!("invalid boolean value: {s}"),
            )),
        }
    }

    fn format_config(&self) -> String {
        self.to_string()
    }
}

impl ConfigValue for Vec<String> {
    fn parse_config(s: &str) -> Result<Self, io::Error> {
        Ok(s.split(',')
            .map(|entry| entry.trim())
            .filter(|entry| !entry.is_empty())
            .map(ToOwned::to_owned)
            .collect())
    }

    fn format_config(&self) -> String {
        self.join(",")
    }
}

macro_rules! define_config {
    ( $( $field:ident : $type:ty = $default:expr ),* $(,)? ) => {
        #[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
        pub struct ConfigData {
            $( pub $field: $type, )*
        }

        impl Default for ConfigData {
            fn default() -> Self {
                ConfigData {
                    $( $field: $default, )*
                }
            }
        }

        impl ConfigData {
            pub const KNOWN_KEYS: &'static [&'static str] = &[
                $( stringify!($field), )*
            ];

            pub fn canonical_key(key: &str) -> Option<&'static str> {
                match key {
                    $( stringify!($field) => Some(stringify!($field)), )*
                    _ => None,
                }
            }

            pub fn apply_kv(&mut self, key: &str, value: &str) -> Result<bool, io::Error> {
                match key {
                    $( stringify!($field) => self.$field = <$type as ConfigValue>::parse_config(value)?, )*
                    _ => return Ok(false),
                }
                Ok(true)
            }

            pub fn reset_key_to_default(&mut self, key: &str) -> bool {
                let defaults = ConfigData::default();
                match key {
                    $( stringify!($field) => {
                        self.$field = defaults.$field;
                        true
                    }, )*
                    _ => false,
                }
            }

            pub fn write_key_to(&self, key: &str, file: &mut dyn Write) -> Result<(), io::Error> {
                match key {
                    $( stringify!($field) => writeln!(file, "{}={}", stringify!($field), ConfigValue::format_config(&self.$field)), )*
                    _ => Err(io::Error::new(io::ErrorKind::InvalidInput, format!("unknown config key: {key}"))),
                }
            }

            #[allow(dead_code)]
            pub fn write_to(&self, file: &mut dyn Write) -> Result<(), io::Error> {
                $( self.write_key_to(stringify!($field), file)?; )*
                Ok(())
            }
        }
    }
}

define_config! {
    processes_update_time: u32 = 2000,
    processes_body_background_color: String = "#2d2d2d".into(),
    processes_body_color: String = "#ffffff".into(),
    processes_head_background_color: String = "#252526".into(),
    processes_head_color: String = "#ffffff".into(),
    processes_table_values: Vec<String> = vec!["user".into(), "pid".into(), "ppid".into(), "name".into(), "state".into(), "cpu_usage".into(), "memory".into()],
    processes_border_color: String = "#333333".into(),
    processes_tree_toggle_color: String = "#888888".into(),
    processes_monitor_border_color: String = "#555555".into(),
    performance_update_time: u32 = 1000,
    performance_sidebar_background_color: String = "#333333".into(),
    performance_sidebar_color: String = "#ffffff".into(),
    performance_sidebar_selected_color: String = "#ffffff".into(),
    performance_background_color: String = "#2d2d2d".into(),
    performance_title_color: String = "#ffffff".into(),
    performance_label_color: String = "#6d6d6d".into(),
    performance_value_color: String = "#ffffff".into(),
    performance_graph_color: String = "#09ffff".into(),
    performance_sec_graph_color: String = "#ff6384".into(),
    performance_scrollbar_color: String = "#888888".into(),
    sensors_update_time: u32 = 2000,
    sensors_background_color: String = "#2b2b2b".into(),
    sensors_foreground_color: String = "#ffffff".into(),
    sensors_boxes_background_color: String = "#3a3a3a".into(),
    sensors_boxes_foreground_color: String = "#ffffff".into(),
    sensors_battery_background_color: String = "#38e740".into(),
    sensors_battery_frame_color: String = "#ffffff".into(),
    sensors_boxes_title_foreground_color: String = "#0088dd".into(),
    sensors_battery_case_color: String = "#060606".into(),
    disks_update_time: u32 = 5000,
    disks_background_color: String = "#2b2b2b".into(),
    disks_boxes_background_color: String = "#3a3a3a".into(),
    disks_name_foreground_color: String = "#ffffff".into(),
    disks_size_foreground_color: String = "#cccccc".into(),
    disks_partition_background_color: String = "#4a4a4a".into(),
    disks_partition_usage_background_color: String = "#2b2b2b".into(),
    disks_partition_name_foreground_color: String = "#61dafb".into(),
    disks_partition_type_foreground_color: String = "#a3be8c".into(),
    disks_partition_usage_foreground_color: String = "#ffcb6b".into(),
    navbar_background_color: String = "#222222".into(),
    navbar_buttons_background_color: String = "#f3eae8".into(),
    navbar_buttons_foreground_color: String = "#212830".into(),
    navbar_search_background_color: String = "#f3eae8".into(),
    navbar_search_foreground_color: String = "#212830".into(),
    heatbar_color_one: String = "#00FF00".into(),
    heatbar_color_two: String = "#33FF00".into(),
    heatbar_color_three: String = "#66FF00".into(),
    heatbar_color_four: String = "#99FF00".into(),
    heatbar_color_five: String = "#CCFF00".into(),
    heatbar_color_six: String = "#FFFF00".into(),
    heatbar_color_seven: String = "#FFCC00".into(),
    heatbar_color_eight: String = "#FF9900".into(),
    heatbar_color_nine: String = "#FF6600".into(),
    heatbar_color_ten: String = "#FF0000".into(),
    heatbar_background_color: String = "#eeeeee".into(),
    config_background_color: String = "#2b2b2b".into(),
    config_container_background_color: String = "#3a3a3a".into(),
    config_input_background_color: String = "#333333".into(),
    config_input_border_color: String = "#444444".into(),
    config_button_background_color: String = "#f3eae8".into(),
    config_button_foreground_color: String = "#212830".into(),
    config_text_color: String = "#ffffff".into(),
    language: String = "en".into(),
    show_virtual_interfaces: bool = false,
}

#[derive(Debug, Clone, PartialEq, Eq)]
enum ConfigLine {
    Blank(String),
    Comment(String),
    Unknown(String),
    Known(&'static str),
}

#[derive(Debug, Clone, Default)]
struct ConfigDocument {
    lines: Vec<ConfigLine>,
    needs_rewrite: bool,
}

impl ConfigDocument {
    fn write_to(&self, file: &mut dyn Write, data: &ConfigData) -> Result<(), io::Error> {
        let mut written_keys = HashSet::new();

        for line in &self.lines {
            match line {
                ConfigLine::Blank(raw) | ConfigLine::Comment(raw) | ConfigLine::Unknown(raw) => {
                    writeln!(file, "{raw}")?;
                }
                ConfigLine::Known(key) => {
                    if written_keys.insert(*key) {
                        data.write_key_to(key, file)?;
                    }
                }
            }
        }

        for key in ConfigData::KNOWN_KEYS {
            if written_keys.insert(*key) {
                data.write_key_to(key, file)?;
            }
        }

        Ok(())
    }
}

impl ConfigData {
    pub fn clamp_update_intervals(&mut self) -> bool {
        let mut changed = false;

        if self.processes_update_time < MIN_UPDATE_INTERVAL_MS {
            self.processes_update_time = MIN_UPDATE_INTERVAL_MS;
            changed = true;
        }
        if self.performance_update_time < MIN_UPDATE_INTERVAL_MS {
            self.performance_update_time = MIN_UPDATE_INTERVAL_MS;
            changed = true;
        }
        if self.sensors_update_time < MIN_UPDATE_INTERVAL_MS {
            self.sensors_update_time = MIN_UPDATE_INTERVAL_MS;
            changed = true;
        }
        if self.disks_update_time < MIN_UPDATE_INTERVAL_MS {
            self.disks_update_time = MIN_UPDATE_INTERVAL_MS;
            changed = true;
        }

        changed
    }
}

macro_rules! set_config_command {
    ($name:ident, $ConfigType:ident { $( $field:ident : $type:ty ),* $(,)? }) => {
        #[derive(Debug, Deserialize)]
        pub struct $ConfigType {
            $( pub $field: $type, )*
        }

        #[tauri::command]
        pub async fn $name(configs: $ConfigType) -> Result<(), String> {
            let file_path = config_file().map_err(|e| e.to_string())?;
            let (mut data, document) = load_config_document_from_path(&file_path)
                .map_err(|e| e.to_string())?;
            $( data.$field = configs.$field; )*
            data.clamp_update_intervals();
            write_config_document(&file_path, &document, &data)
                .map_err(|e| e.to_string())?;
            Ok(())
        }
    }
}

pub fn create_config() -> Result<(), String> {
    let config_dir =
        get_config_dir().ok_or_else(|| "Unable to determine config directory".to_string())?;
    let folder_path = config_dir.join("hw-monitor");

    if !folder_exists(&folder_path) {
        fs::create_dir_all(&folder_path).map_err(|e| e.to_string())?;
    }

    let file_path = folder_path.join("hw-monitor.conf");

    if !file_exists(&file_path) {
        write_config_document(
            &file_path,
            &ConfigDocument::default(),
            &ConfigData::default(),
        )
        .map_err(|e| e.to_string())?;
    } else {
        let metadata = fs::metadata(&file_path).map_err(|e| e.to_string())?;
        if metadata.len() == 0 {
            write_config_document(
                &file_path,
                &ConfigDocument::default(),
                &ConfigData::default(),
            )
            .map_err(|e| e.to_string())?;
        }
    }

    Ok(())
}

#[tauri::command]
pub async fn set_default_config() -> Result<(), String> {
    default_config().map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn set_all_configs(configs: ConfigData) -> Result<(), String> {
    write_all_configs(&configs).map_err(|e| e.to_string())
}

pub fn default_config() -> Result<(), io::Error> {
    let data = ConfigData::default();
    write_all_configs(&data)
}

pub fn read_all_configs() -> Result<ConfigData, io::Error> {
    let file_path = config_file()?;
    let (data, document) = load_config_document_from_path(&file_path)?;

    if document.needs_rewrite {
        write_config_document(&file_path, &document, &data)?;
    }

    Ok(data)
}

pub fn write_all_configs(config_data: &ConfigData) -> Result<(), io::Error> {
    let file_path = config_file()?;
    let document = if file_exists(&file_path) {
        load_config_document_from_path(&file_path)
            .map(|(_, document)| document)
            .unwrap_or_default()
    } else {
        ConfigDocument::default()
    };

    let mut normalized = config_data.clone();
    normalized.clamp_update_intervals();
    write_config_document(&file_path, &document, &normalized)
}

#[tauri::command]
pub async fn get_configs() -> Result<ConfigData, String> {
    read_all_configs().map_err(|e| e.to_string())
}

set_config_command!(set_processes_configs, ProcessesConfig {
    processes_update_time: u32,
    processes_body_background_color: String,
    processes_body_color: String,
    processes_head_background_color: String,
    processes_head_color: String,
    processes_table_values: Vec<String>,
    processes_border_color: String,
    processes_tree_toggle_color: String,
    processes_monitor_border_color: String,
});

set_config_command!(
    set_performance_configs,
    PerformanceConfig {
        performance_update_time: u32,
        performance_sidebar_background_color: String,
        performance_sidebar_color: String,
        performance_sidebar_selected_color: String,
        performance_background_color: String,
        performance_title_color: String,
        performance_label_color: String,
        performance_value_color: String,
        performance_graph_color: String,
        performance_sec_graph_color: String,
        show_virtual_interfaces: bool,
        performance_scrollbar_color: String,
    }
);

set_config_command!(
    set_sensors_configs,
    SensorsConfig {
        sensors_update_time: u32,
        sensors_background_color: String,
        sensors_foreground_color: String,
        sensors_boxes_background_color: String,
        sensors_boxes_foreground_color: String,
        sensors_battery_background_color: String,
        sensors_battery_frame_color: String,
        sensors_boxes_title_foreground_color: String,
        sensors_battery_case_color: String,
    }
);

set_config_command!(
    set_disks_configs,
    DisksConfig {
        disks_update_time: u32,
        disks_background_color: String,
        disks_boxes_background_color: String,
        disks_name_foreground_color: String,
        disks_size_foreground_color: String,
        disks_partition_background_color: String,
        disks_partition_usage_background_color: String,
        disks_partition_name_foreground_color: String,
        disks_partition_type_foreground_color: String,
        disks_partition_usage_foreground_color: String,
    }
);

set_config_command!(
    set_navbar_configs,
    NavbarConfig {
        navbar_background_color: String,
        navbar_buttons_background_color: String,
        navbar_buttons_foreground_color: String,
        navbar_search_background_color: String,
        navbar_search_foreground_color: String,
    }
);

set_config_command!(
    set_heatbar_configs,
    HeatbarConfig {
        heatbar_color_one: String,
        heatbar_color_two: String,
        heatbar_color_three: String,
        heatbar_color_four: String,
        heatbar_color_five: String,
        heatbar_color_six: String,
        heatbar_color_seven: String,
        heatbar_color_eight: String,
        heatbar_color_nine: String,
        heatbar_color_ten: String,
        heatbar_background_color: String,
    }
);

set_config_command!(
    set_config_panel_configs,
    ConfigPanelConfig {
        config_background_color: String,
        config_container_background_color: String,
        config_input_background_color: String,
        config_input_border_color: String,
        config_button_background_color: String,
        config_button_foreground_color: String,
        config_text_color: String,
    }
);

set_config_command!(set_language_config, LanguageConfig { language: String });

fn load_config_document_from_path(
    file_path: &Path,
) -> Result<(ConfigData, ConfigDocument), io::Error> {
    let content = fs::read_to_string(file_path)?;
    Ok(parse_config_content(&content))
}

fn parse_config_content(content: &str) -> (ConfigData, ConfigDocument) {
    let mut data = ConfigData::default();
    let mut document = ConfigDocument::default();
    let mut seen_known = HashSet::new();

    for raw_line in content.lines() {
        let trimmed = raw_line.trim();

        if trimmed.is_empty() {
            document.lines.push(ConfigLine::Blank(raw_line.to_string()));
            continue;
        }

        if trimmed.starts_with('#') {
            document
                .lines
                .push(ConfigLine::Comment(raw_line.to_string()));
            continue;
        }

        let Some((key, value)) = raw_line.split_once('=') else {
            document.needs_rewrite = true;
            continue;
        };

        let key = key.trim();
        let value = value.trim();

        if let Some(canonical_key) = ConfigData::canonical_key(key) {
            if seen_known.insert(canonical_key) {
                document.lines.push(ConfigLine::Known(canonical_key));
            } else {
                document.needs_rewrite = true;
            }

            if data.apply_kv(canonical_key, value).is_err() {
                document.needs_rewrite = true;
                data.reset_key_to_default(canonical_key);
            }

            continue;
        }

        document
            .lines
            .push(ConfigLine::Unknown(raw_line.to_string()));
    }

    if data.clamp_update_intervals() {
        document.needs_rewrite = true;
    }

    (data, document)
}

fn write_config_document(
    file_path: &Path,
    document: &ConfigDocument,
    data: &ConfigData,
) -> Result<(), io::Error> {
    if let Some(parent) = file_path.parent() {
        fs::create_dir_all(parent)?;
    }

    let temp_file_path = file_path.with_extension("tmp");

    {
        let mut file = File::create(&temp_file_path)?;
        document.write_to(&mut file, data)?;
        file.flush()?;
        file.sync_all()?;
    }

    fs::rename(&temp_file_path, file_path)?;
    sync_parent_dir(file_path)?;
    Ok(())
}

fn sync_parent_dir(file_path: &Path) -> Result<(), io::Error> {
    if let Some(parent) = file_path.parent() {
        File::open(parent)?.sync_all()?;
    }
    Ok(())
}

fn config_file() -> Result<PathBuf, io::Error> {
    let config_dir = get_config_dir().ok_or_else(|| {
        io::Error::new(
            io::ErrorKind::NotFound,
            "Unable to determine config directory",
        )
    })?;
    Ok(config_dir.join("hw-monitor").join("hw-monitor.conf"))
}

fn get_config_dir() -> Option<PathBuf> {
    if let Ok(xdg) = std::env::var("XDG_CONFIG_HOME") {
        if !xdg.is_empty() {
            return Some(PathBuf::from(xdg));
        }
    }

    if let Ok(home) = std::env::var("HOME") {
        return Some(PathBuf::from(home).join(".config"));
    }

    None
}

fn folder_exists(path: &Path) -> bool {
    fs::metadata(path)
        .map(|metadata| metadata.is_dir())
        .unwrap_or(false)
}

fn file_exists(path: &Path) -> bool {
    fs::metadata(path)
        .map(|metadata| metadata.is_file())
        .unwrap_or(false)
}

#[cfg(test)]
mod tests {
    use super::{parse_config_content, ConfigData, ConfigDocument, ConfigLine};

    fn render(document: &ConfigDocument, data: &ConfigData) -> String {
        let mut output = Vec::new();
        document.write_to(&mut output, data).unwrap();
        String::from_utf8(output).unwrap()
    }

    #[test]
    fn parser_recovers_invalid_values_and_marks_rewrite() {
        let input = "\
# comment
performance_update_time=0
show_virtual_interfaces=maybe
custom_key=keep_me
malformed_line
";

        let (data, document) = parse_config_content(input);

        assert_eq!(data.performance_update_time, 1000);
        assert!(!data.show_virtual_interfaces);
        assert!(document.needs_rewrite);
        assert!(matches!(document.lines[0], ConfigLine::Comment(_)));
        assert!(matches!(
            document.lines[1],
            ConfigLine::Known("performance_update_time")
        ));
        assert!(matches!(
            document.lines[2],
            ConfigLine::Known("show_virtual_interfaces")
        ));
        assert!(matches!(document.lines[3], ConfigLine::Unknown(_)));
    }

    #[test]
    fn writer_preserves_comments_and_unknown_keys() {
        let input = "\
# keep comment
custom_key=value
processes_update_time=2500
";

        let (data, document) = parse_config_content(input);
        let rendered = render(&document, &data);

        assert!(rendered.contains("# keep comment"));
        assert!(rendered.contains("custom_key=value"));
        assert!(rendered.contains("processes_update_time=2500"));
        assert!(rendered.contains("language=en"));
    }
}
