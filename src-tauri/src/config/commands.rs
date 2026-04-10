use std::fs::{self, File};
use std::path::PathBuf;
use std::io::{self, BufRead, Write};
use serde::{Serialize, Deserialize};

trait ConfigValue: Sized {
    fn parse_config(s: &str) -> Result<Self, io::Error>;
    fn format_config(&self) -> String;
}

impl ConfigValue for String {
    fn parse_config(s: &str) -> Result<Self, io::Error> { Ok(s.to_string()) }
    fn format_config(&self) -> String { self.clone() }
}

impl ConfigValue for u32 {
    fn parse_config(s: &str) -> Result<Self, io::Error> {
        s.parse().map_err(|e| io::Error::new(io::ErrorKind::InvalidData, e))
    }
    fn format_config(&self) -> String { self.to_string() }
}

impl ConfigValue for bool {
    fn parse_config(s: &str) -> Result<Self, io::Error> { Ok(s == "true") }
    fn format_config(&self) -> String { self.to_string() }
}

impl ConfigValue for Vec<String> {
    fn parse_config(s: &str) -> Result<Self, io::Error> {
        Ok(s.split(',').map(|s| s.trim().to_string()).collect())
    }
    fn format_config(&self) -> String { self.join(",") }
}

macro_rules! define_config {
    ( $( $field:ident : $type:ty = $default:expr ),* $(,)? ) => {
        #[derive(Debug, Serialize, Deserialize)]
        pub struct ConfigData {
            $( pub $field: $type, )*
        }
        impl Default for ConfigData {
            fn default() -> Self {
                ConfigData { $( $field: $default, )* }
            }
        }
        impl ConfigData {
            pub fn apply_kv(&mut self, key: &str, value: &str) -> Result<bool, io::Error> {
                match key {
                    $( stringify!($field) => self.$field = <$type as ConfigValue>::parse_config(value)?, )*
                    _ => return Ok(false),
                }
                Ok(true)
            }
            pub fn write_to(&self, file: &mut File) -> Result<(), io::Error> {
                $( writeln!(file, "{}={}", stringify!($field), ConfigValue::format_config(&self.$field))?; )*
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

macro_rules! set_config_command {
    ($name:ident, $ConfigType:ident { $( $field:ident : $type:ty ),* $(,)? }) => {
        #[derive(Debug, Deserialize)]
        pub struct $ConfigType {
            $( pub $field: $type, )*
        }

        #[tauri::command]
        pub async fn $name(configs: $ConfigType) -> Result<(), String> {
            let mut data = read_all_configs().map_err(|e| e.to_string())?;
            $( data.$field = configs.$field; )*
            write_all_configs(&data).map_err(|e| e.to_string())?;
            Ok(())
        }
    }
}

pub fn create_config() -> Result<(), String> {
    let config_dir = get_config_dir().ok_or_else(|| "Unable to determine config directory".to_string())?;
    let folder_path = config_dir.join("hw-monitor");

    if !folder_exists(&folder_path) {
        fs::create_dir(&folder_path).map_err(|e| e.to_string())?;
    }

    let file_path = folder_path.join("hw-monitor.conf");

    if !file_exists(&file_path) {
        File::create(&file_path).map_err(|e| e.to_string())?;
        default_config().map_err(|e| e.to_string())?;
    } else {
        let metadata = fs::metadata(&file_path).map_err(|e| e.to_string())?;
        if metadata.len() == 0 {
            default_config().map_err(|e| e.to_string())?;
        }
    }

    Ok(())
}

#[tauri::command]
pub async fn set_default_config() -> Result<(), String> {
    default_config().map_err(|e| e.to_string())
}

pub fn default_config() -> Result<(), io::Error> {
    let data = ConfigData::default();
    write_all_configs(&data)
}

pub fn read_all_configs() -> Result<ConfigData, io::Error> {
    let file_path = config_file()?;
    let file = File::open(&file_path)?;
    let reader = io::BufReader::new(file);
    let mut data = ConfigData::default();

    for line in reader.lines() {
        let line = line?;
        let trimmed = line.trim();

        if trimmed.is_empty() || trimmed.starts_with('#') {
            continue;
        }

        let (key, value) = trimmed.split_once('=')
            .ok_or_else(|| io::Error::new(io::ErrorKind::InvalidData, "Invalid format in config file"))?;

        if !data.apply_kv(key.trim(), value.trim())? {
            return Err(io::Error::new(io::ErrorKind::InvalidData, format!("Unknown key: {}", key)));
        }
    }

    Ok(data)
}

pub fn write_all_configs(config_data: &ConfigData) -> Result<(), io::Error> {
    let file_path = config_file()?;
    let temp_file_path = file_path.with_extension("tmp");

    {
        let mut file = File::create(&temp_file_path)?;
        config_data.write_to(&mut file)?;
        file.flush()?;
    }

    fs::rename(temp_file_path, file_path)?;
    Ok(())
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

set_config_command!(set_performance_configs, PerformanceConfig {
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
});

set_config_command!(set_sensors_configs, SensorsConfig {
    sensors_update_time: u32,
    sensors_background_color: String,
    sensors_foreground_color: String,
    sensors_boxes_background_color: String,
    sensors_boxes_foreground_color: String,
    sensors_battery_background_color: String,
    sensors_battery_frame_color: String,
    sensors_boxes_title_foreground_color: String,
    sensors_battery_case_color: String,
});

set_config_command!(set_disks_configs, DisksConfig {
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
});

set_config_command!(set_navbar_configs, NavbarConfig {
    navbar_background_color: String,
    navbar_buttons_background_color: String,
    navbar_buttons_foreground_color: String,
    navbar_search_background_color: String,
    navbar_search_foreground_color: String,
});

set_config_command!(set_heatbar_configs, HeatbarConfig {
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
});

set_config_command!(set_config_panel_configs, ConfigPanelConfig {
    config_background_color: String,
    config_container_background_color: String,
    config_input_background_color: String,
    config_input_border_color: String,
    config_button_background_color: String,
    config_button_foreground_color: String,
    config_text_color: String,
});

set_config_command!(set_language_config, LanguageConfig {
    language: String,
});

fn config_file() -> Result<PathBuf, io::Error> {
    let config_dir = get_config_dir().ok_or_else(|| io::Error::new(io::ErrorKind::NotFound, "Unable to determine config directory"))?;
    let folder_path = config_dir.join("hw-monitor");
    let file_path = folder_path.join("hw-monitor.conf");
    Ok(file_path)
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

fn folder_exists(path: &PathBuf) -> bool {
    fs::metadata(path).map(|m| m.is_dir()).unwrap_or(false)
}

fn file_exists(path: &PathBuf) -> bool {
    fs::metadata(path).map(|m| m.is_file()).unwrap_or(false)
}
