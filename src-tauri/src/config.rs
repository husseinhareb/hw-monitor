use std::fs::{self, File};
use std::path::PathBuf;
use std::io::{self, BufRead, Write};
use tauri::InvokeError;
use serde::{Serialize, Deserialize};

// Struct for the configuration data
#[derive(Debug, Deserialize, Serialize)]
pub struct ConfigData {
    pub processes_update_time: u32,
    pub processes_body_background_color: String,
    pub processes_body_color: String,
    pub processes_head_background_color: String,
    pub processes_head_color: String,
    pub processes_table_values: Vec<String>,

    pub performance_update_time: u32,
    pub performance_sidebar_background_color: String,
    pub performance_sidebar_color: String,
    pub performance_sidebar_selected_color: String,
    pub performance_background_color: String,
    pub performance_title_color: String,
    pub performance_label_color: String,
    pub performance_value_color: String,
    pub performance_graph_color: String,
    pub performance_sec_graph_color: String,

    pub sensors_update_time: u32,
    pub sensors_background_color: String,
    pub sensors_foreground_color: String,
    pub sensors_boxes_background_color: String,
    pub sensors_boxes_foreground_color: String,
    pub sensors_battery_background_color: String,
    pub sensors_battery_frame_color: String,
    pub sensors_boxes_title_foreground_color: String,

    pub disks_update_time: u32,
    pub disks_background_color: String,
    pub disks_boxes_background_color: String,
    pub disks_name_foreground_color: String,
    pub disks_size_foreground_color: String,
    pub disks_partition_background_color: String,
    pub disks_partition_usage_background_color: String,
    pub disks_partition_name_foreground_color: String,
    pub disks_partition_type_foreground_color: String,
    pub disks_partition_usage_foreground_color: String,

    pub navbar_background_color: String,
    pub navbar_buttons_background_color: String,
    pub navbar_buttons_foreground_color: String,
    pub navbar_search_background_color: String,
    pub navbar_search_foreground_color: String,

    pub heatbar_color_one: String,
    pub heatbar_color_two: String,
    pub heatbar_color_three: String,
    pub heatbar_color_four: String,
    pub heatbar_color_five: String,
    pub heatbar_color_six: String,
    pub heatbar_color_seven: String,
    pub heatbar_color_eight: String,
    pub heatbar_color_nine: String,
    pub heatbar_color_ten: String,

    pub language: String,
}


#[derive(Debug, Deserialize)]
pub struct PorcessesConfig {
    pub processes_update_time: u32,
    pub processes_body_background_color: String,
    pub processes_body_color: String,
    pub processes_head_background_color: String,
    pub processes_head_color: String,
    pub processes_table_values: Vec<String>,
}

#[derive(Debug, Deserialize)]
pub struct PerformanceConfig {
    pub performance_update_time: u32,
    pub performance_sidebar_background_color: String,
    pub performance_sidebar_color: String,
    pub performance_sidebar_selected_color: String,
    pub performance_background_color: String,
    pub performance_title_color: String,
    pub performance_label_color: String,
    pub performance_value_color: String,
    pub performance_graph_color: String,
    pub performance_sec_graph_color: String,
}

// Structs for individual groups of configs
#[derive(Debug, Deserialize)]
pub struct SensorsConfig {
    pub sensors_update_time: u32,
    pub sensors_background_color: String,
    pub sensors_foreground_color: String,
    pub sensors_boxes_background_color: String,
    pub sensors_boxes_foreground_color: String,
    pub sensors_battery_background_color: String,
    pub sensors_battery_frame_color: String,
    pub sensors_boxes_title_foreground_color: String,
}

#[derive(Debug, Deserialize)]
pub struct DisksConfig {
    pub disks_update_time: u32,
    pub disks_background_color: String,
    pub disks_boxes_background_color: String,
    pub disks_name_foreground_color: String,
    pub disks_size_foreground_color: String,
    pub disks_partition_background_color: String,
    pub disks_partition_usage_background_color: String,
    pub disks_partition_name_foreground_color: String,
    pub disks_partition_type_foreground_color: String,
    pub disks_partition_usage_foreground_color: String,
}

#[derive(Debug, Deserialize)]
pub struct NavbarConfig {
    pub navbar_background_color: String,
    pub navbar_buttons_background_color: String,
    pub navbar_buttons_foreground_color: String,
    pub navbar_search_background_color: String,
    pub navbar_search_foreground_color: String,
}

#[derive(Debug, Deserialize)]
pub struct HeatbarConfig {
    pub heatbar_color_one: String,
    pub heatbar_color_two: String,
    pub heatbar_color_three: String,
    pub heatbar_color_four: String,
    pub heatbar_color_five: String,
    pub heatbar_color_six: String,
    pub heatbar_color_seven: String,
    pub heatbar_color_eight: String,
    pub heatbar_color_nine: String,
    pub heatbar_color_ten: String,
}

#[derive(Debug, Deserialize)]
pub struct LanguageConfig {
    pub language: String,

}

// Function to create the initial configuration file if it does not exist
pub fn create_config() -> Result<(), InvokeError> {
    let config_dir = dirs::config_dir().ok_or_else(|| InvokeError::from("Unable to determine config directory"))?;
    let folder_path = config_dir.join("hw-monitor");

    if !folder_exists(&folder_path) {
        fs::create_dir(&folder_path).map_err(|e| InvokeError::from(e.to_string()))?;
    }

    let file_path = folder_path.join("hw-monitor.conf");

    if !file_exists(&file_path) {
        File::create(&file_path).map_err(|e| InvokeError::from(e.to_string()))?;
        default_config().map_err(|e| InvokeError::from(e.to_string()))?;
    } else {
        let metadata = fs::metadata(&file_path).map_err(|e| InvokeError::from(e.to_string()))?;
        if metadata.len() == 0 {
            default_config().map_err(|e| InvokeError::from(e.to_string()))?;
        }
    }

    Ok(())
}

#[tauri::command]
pub async fn set_default_config() -> Result<(), InvokeError> {
    match default_config() {
        Ok(_) => Ok(()),
        Err(e) => Err(InvokeError::from(e.to_string())),
    }
}

pub fn default_config() -> Result<(), io::Error> {
    let file_path = config_file()?;

    let mut file = File::create(&file_path)?;

    let default_values = "\
        processes_update_time=2000\n\
        processes_body_background_color=#2d2d2d\n\
        processes_body_color=#ffffff\n\
        processes_head_background_color=#252526\n\
        processes_head_color=#ffffff\n\
        processes_table_values=user,pid,ppid,name,state,cpu_usage,memory\n\
        performance_update_time=1000\n\
        performance_sidebar_background_color=#333333\n\
        performance_sidebar_color=#ffffff\n\
        performance_sidebar_selected_color=#ffffff\n\
        performance_background_color=#2d2d2d\n\
        performance_title_color=#ffffff\n\
        performance_label_color=#6d6d6d\n\
        performance_value_color=#ffffff\n\
        performance_graph_color=#09ffff\n\
        performance_sec_graph_color=#ff6384\n\
        sensors_update_time=2000\n\
        sensors_background_color=#2b2b2b\n\
        sensors_foreground_color=#ffffff\n\
        sensors_boxes_background_color=#3a3a3a\n\
        sensors_boxes_foreground_color=#ffffff\n\
        sensors_battery_background_color=#38e740\n\
        sensors_battery_frame_color=#ffffff\n\
        sensors_boxes_title_foreground_color=#0088dd\n\
        disks_update_time=5000\n\
        disks_background_color=#2b2b2b\n\
        disks_boxes_background_color=#3a3a3a\n\
        disks_name_foreground_color=#ffffff\n\
        disks_size_foreground_color=#cccccc\n\
        disks_partition_background_color=#4a4a4a\n\
        disks_partition_usage_background_color=#2b2b2b\n\
        disks_partition_name_foreground_color=#61dafb\n\
        disks_partition_type_foreground_color=#a3be8c\n\
        disks_partition_usage_foreground_color=#ffcb6b\n\
        navbar_background_color=#222222\n\
        navbar_buttons_background_color=#f3eae8\n\
        navbar_buttons_foreground_color=#212830\n\
        navbar_search_background_color=#f3eae8\n\
        navbar_search_foreground_color=#212830\n\
        heatbar_color_one=#00FF00\n\
        heatbar_color_two=#33FF00\n\
        heatbar_color_three=#66FF00\n\
        heatbar_color_four=#99FF00\n\
        heatbar_color_five=#CCFF00\n\
        heatbar_color_six=#FFFF00\n\
        heatbar_color_seven=#FFCC00\n\
        heatbar_color_eight=#FF9900\n\
        heatbar_color_nine=#FF6600\n\
        heatbar_color_ten=#FF0000\n\
        language=en\n\
    ";

    file.write_all(default_values.as_bytes())?;
    Ok(())
}

// Function to read all configs
pub fn read_all_configs() -> Result<ConfigData, io::Error> {
    let file_path = config_file()?;

    let file = File::open(&file_path)?;
    let reader = io::BufReader::new(file);

    let mut config_data: ConfigData = ConfigData {
        processes_update_time: 1000,
        processes_body_background_color: String::new(),
        processes_body_color: String::new(),
        processes_head_background_color: String::new(),
        processes_head_color: String::new(),
        processes_table_values: Vec::new(),
        performance_update_time: 1000,
        performance_sidebar_background_color: String::new(),
        performance_sidebar_color: String::new(),
        performance_sidebar_selected_color: String::new(),
        performance_background_color: String::new(),
        performance_title_color: String::new(),
        performance_label_color: String::new(),
        performance_value_color: String::new(),
        performance_graph_color: String::new(),
        performance_sec_graph_color: String::new(),
        sensors_update_time: 1000,
        sensors_background_color: String::new(),
        sensors_foreground_color: String::new(),
        sensors_boxes_background_color: String::new(),
        sensors_boxes_foreground_color: String::new(),
        sensors_battery_background_color: String::new(),
        sensors_battery_frame_color: String::new(),
        sensors_boxes_title_foreground_color: String::new(),
        disks_update_time: 1000,
        disks_background_color: String::new(),
        disks_boxes_background_color: String::new(),
        disks_name_foreground_color: String::new(),
        disks_size_foreground_color: String::new(),
        disks_partition_background_color: String::new(),
        disks_partition_usage_background_color: String::new(),
        disks_partition_name_foreground_color: String::new(),
        disks_partition_type_foreground_color: String::new(),
        disks_partition_usage_foreground_color: String::new(),
        navbar_background_color: String::new(),
        navbar_buttons_background_color: String::new(),
        navbar_buttons_foreground_color: String::new(),
        navbar_search_background_color: String::new(),
        navbar_search_foreground_color: String::new(),
        heatbar_color_one: String::new(),
        heatbar_color_two: String::new(),
        heatbar_color_three: String::new(),
        heatbar_color_four: String::new(),
        heatbar_color_five: String::new(),
        heatbar_color_six: String::new(),
        heatbar_color_seven: String::new(),
        heatbar_color_eight: String::new(),
        heatbar_color_nine: String::new(),
        heatbar_color_ten: String::new(),
        language: String::new(),
    };

    for line in reader.lines() {
        let line = line?;
        let trimmed_line = line.trim();

        if trimmed_line.is_empty() || trimmed_line.starts_with('#') {
            continue; // Skip blank lines and comments
        }

        let parts: Vec<&str> = trimmed_line.split('=').map(|s| s.trim()).collect();
        if parts.len() != 2 {
            return Err(io::Error::new(io::ErrorKind::InvalidData, "Invalid format in config file"));
        }

        let key = parts[0];
        let value = parts[1];

        match key {
            "processes_update_time" => {
                config_data.processes_update_time = value.parse().map_err(|e| io::Error::new(io::ErrorKind::InvalidData, e))?;
            },
            "processes_body_background_color" => {
                config_data.processes_body_background_color = value.to_string();
            },
            "processes_body_color" => {
                config_data.processes_body_color = value.to_string();
            },
            "processes_head_background_color" => {
                config_data.processes_head_background_color = value.to_string();
            },
            "processes_head_color" => {
                config_data.processes_head_color = value.to_string();
            },
            "processes_table_values" => {
                config_data.processes_table_values = value.split(',').map(|s| s.trim().to_string()).collect();
            },
            "performance_update_time" => {
                config_data.performance_update_time = value.parse().map_err(|e| io::Error::new(io::ErrorKind::InvalidData, e))?;
            },
            "performance_sidebar_background_color" => {
                config_data.performance_sidebar_background_color = value.to_string();
            },
            "performance_sidebar_color" => {
                config_data.performance_sidebar_color = value.to_string();
            },
            "performance_sidebar_selected_color" => {
                config_data.performance_sidebar_selected_color = value.to_string();
            },
            "performance_background_color" => {
                config_data.performance_background_color = value.to_string();
            },
            "performance_title_color" => {
                config_data.performance_title_color = value.to_string();
            },
            "performance_label_color" => {
                config_data.performance_label_color = value.to_string();
            },
            "performance_value_color" => {
                config_data.performance_value_color = value.to_string();
            },
            "performance_graph_color" => {
                config_data.performance_graph_color = value.to_string();
            },
            "performance_sec_graph_color" => {
                config_data.performance_sec_graph_color = value.to_string();
            },
            "sensors_update_time" => {
                config_data.sensors_update_time = value.parse().map_err(|e| io::Error::new(io::ErrorKind::InvalidData, e))?;
            },
            "sensors_background_color" => {
                config_data.sensors_background_color = value.to_string();
            },
            "sensors_foreground_color" => {
                config_data.sensors_foreground_color = value.to_string();
            },
            "sensors_boxes_background_color" => {
                config_data.sensors_boxes_background_color = value.to_string();
            },
            "sensors_boxes_foreground_color" => {
                config_data.sensors_boxes_foreground_color = value.to_string();
            },
            "sensors_battery_background_color" => {
                config_data.sensors_battery_background_color = value.to_string();
            },
            "sensors_battery_frame_color" => {
                config_data.sensors_battery_frame_color = value.to_string();
            },
            "sensors_boxes_title_foreground_color" => {
                config_data.sensors_boxes_title_foreground_color = value.to_string();
            },
            "disks_update_time" => {
                config_data.disks_update_time = value.parse().map_err(|e| io::Error::new(io::ErrorKind::InvalidData, e))?;
            },
            "disks_background_color" => {
                config_data.disks_background_color = value.to_string();
            },
            "disks_boxes_background_color" => {
                config_data.disks_boxes_background_color = value.to_string();
            },
            "disks_name_foreground_color" => {
                config_data.disks_name_foreground_color = value.to_string();
            },
            "disks_size_foreground_color" => {
                config_data.disks_size_foreground_color = value.to_string();
            },
            "disks_partition_background_color" => {
                config_data.disks_partition_background_color = value.to_string();
            },
            "disks_partition_usage_background_color" => {
                config_data.disks_partition_usage_background_color = value.to_string();
            },
            "disks_partition_name_foreground_color" => {
                config_data.disks_partition_name_foreground_color = value.to_string();
            },
            "disks_partition_type_foreground_color" => {
                config_data.disks_partition_type_foreground_color = value.to_string();
            },
            "disks_partition_usage_foreground_color" => {
                config_data.disks_partition_usage_foreground_color = value.to_string();
            },
            "navbar_background_color" => {
                config_data.navbar_background_color = value.to_string();
            },
            "navbar_buttons_background_color" => {
                config_data.navbar_buttons_background_color = value.to_string();
            },
            "navbar_buttons_foreground_color" => {
                config_data.navbar_buttons_foreground_color = value.to_string();
            },
            "navbar_search_background_color" => {
                config_data.navbar_search_background_color = value.to_string();
            },
            "navbar_search_foreground_color" => {
                config_data.navbar_search_foreground_color = value.to_string();
            },
            "heatbar_color_one" => {
                config_data.heatbar_color_one = value.to_string();
            },
            "heatbar_color_two" => {
                config_data.heatbar_color_two = value.to_string();
            },
            "heatbar_color_three" => {
                config_data.heatbar_color_three = value.to_string();
            },
            "heatbar_color_four" => {
                config_data.heatbar_color_four = value.to_string();
            },
            "heatbar_color_five" => {
                config_data.heatbar_color_five = value.to_string();
            },
            "heatbar_color_six" => {
                config_data.heatbar_color_six = value.to_string();
            },
            "heatbar_color_seven" => {
                config_data.heatbar_color_seven = value.to_string();
            },
            "heatbar_color_eight" => {
                config_data.heatbar_color_eight = value.to_string();
            },
            "heatbar_color_nine" => {
                config_data.heatbar_color_nine = value.to_string();
            },
            "heatbar_color_ten" => {
                config_data.heatbar_color_ten = value.to_string();
            },
            "language" => {
                config_data.language = value.to_string();
            },
            _ => {
                return Err(io::Error::new(io::ErrorKind::InvalidData, format!("Unknown key: {}", key)));
            }
        }
    }

    Ok(config_data)
}

// Function to write all configs
use std::fs::rename;

pub fn write_all_configs(config_data: &ConfigData) -> Result<(), io::Error> {
    let file_path = config_file()?;
    let temp_file_path = file_path.with_extension("tmp");

    // Create and write to the temporary file
    {
        let mut file = File::create(&temp_file_path)?;

        writeln!(file, "processes_update_time={}", config_data.processes_update_time)?;
        writeln!(file, "processes_body_background_color={}", config_data.processes_body_background_color)?;
        writeln!(file, "processes_body_color={}", config_data.processes_body_color)?;
        writeln!(file, "processes_head_background_color={}", config_data.processes_head_background_color)?;
        writeln!(file, "processes_head_color={}", config_data.processes_head_color)?;
        writeln!(file, "processes_table_values={}", config_data.processes_table_values.join(","))?;
        writeln!(file, "performance_update_time={}", config_data.performance_update_time)?;
        writeln!(file, "performance_sidebar_background_color={}", config_data.performance_sidebar_background_color)?;
        writeln!(file, "performance_sidebar_color={}", config_data.performance_sidebar_color)?;
        writeln!(file, "performance_sidebar_selected_color={}", config_data.performance_sidebar_selected_color)?;
        writeln!(file, "performance_background_color={}", config_data.performance_background_color)?;
        writeln!(file, "performance_title_color={}", config_data.performance_title_color)?;
        writeln!(file, "performance_label_color={}", config_data.performance_label_color)?;
        writeln!(file, "performance_value_color={}", config_data.performance_value_color)?;
        writeln!(file, "performance_graph_color={}", config_data.performance_graph_color)?;
        writeln!(file, "performance_sec_graph_color={}", config_data.performance_sec_graph_color)?;
        writeln!(file, "sensors_update_time={}", config_data.sensors_update_time)?;
        writeln!(file, "sensors_background_color={}", config_data.sensors_background_color)?;
        writeln!(file, "sensors_foreground_color={}", config_data.sensors_foreground_color)?;
        writeln!(file, "sensors_boxes_background_color={}", config_data.sensors_boxes_background_color)?;
        writeln!(file, "sensors_boxes_foreground_color={}", config_data.sensors_boxes_foreground_color)?;
        writeln!(file, "sensors_battery_background_color={}", config_data.sensors_battery_background_color)?;
        writeln!(file, "sensors_battery_frame_color={}", config_data.sensors_battery_frame_color)?;
        writeln!(file, "sensors_boxes_title_foreground_color={}", config_data.sensors_boxes_title_foreground_color)?;
        writeln!(file, "disks_update_time={}", config_data.disks_update_time)?;
        writeln!(file, "disks_background_color={}", config_data.disks_background_color)?;
        writeln!(file, "disks_boxes_background_color={}", config_data.disks_boxes_background_color)?;
        writeln!(file, "disks_name_foreground_color={}", config_data.disks_name_foreground_color)?;
        writeln!(file, "disks_size_foreground_color={}", config_data.disks_size_foreground_color)?;
        writeln!(file, "disks_partition_background_color={}", config_data.disks_partition_background_color)?;
        writeln!(file, "disks_partition_usage_background_color={}", config_data.disks_partition_usage_background_color)?;
        writeln!(file, "disks_partition_name_foreground_color={}", config_data.disks_partition_name_foreground_color)?;
        writeln!(file, "disks_partition_type_foreground_color={}", config_data.disks_partition_type_foreground_color)?;
        writeln!(file, "disks_partition_usage_foreground_color={}", config_data.disks_partition_usage_foreground_color)?;
        writeln!(file, "navbar_background_color={}", config_data.navbar_background_color)?;
        writeln!(file, "navbar_buttons_background_color={}", config_data.navbar_buttons_background_color)?;
        writeln!(file, "navbar_buttons_foreground_color={}", config_data.navbar_buttons_foreground_color)?;
        writeln!(file, "navbar_search_background_color={}", config_data.navbar_search_background_color)?;
        writeln!(file, "navbar_search_foreground_color={}", config_data.navbar_search_foreground_color)?;
        writeln!(file, "heatbar_color_one={}", config_data.heatbar_color_one)?;
        writeln!(file, "heatbar_color_two={}", config_data.heatbar_color_two)?;
        writeln!(file, "heatbar_color_three={}", config_data.heatbar_color_three)?;
        writeln!(file, "heatbar_color_four={}", config_data.heatbar_color_four)?;
        writeln!(file, "heatbar_color_five={}", config_data.heatbar_color_five)?;
        writeln!(file, "heatbar_color_six={}", config_data.heatbar_color_six)?;
        writeln!(file, "heatbar_color_seven={}", config_data.heatbar_color_seven)?;
        writeln!(file, "heatbar_color_eight={}", config_data.heatbar_color_eight)?;
        writeln!(file, "heatbar_color_nine={}", config_data.heatbar_color_nine)?;
        writeln!(file, "heatbar_color_ten={}", config_data.heatbar_color_ten)?;
        writeln!(file, "language={}", config_data.language)?;

        file.flush()?;
    }

    // Rename the temporary file to the actual config file
    rename(temp_file_path, file_path)?;

    Ok(())
}


#[tauri::command]
pub async fn get_configs() -> Result<ConfigData, InvokeError> {
    read_all_configs().map_err(|e| InvokeError::from(e.to_string()))
}


#[tauri::command]
pub async fn set_processes_configs(configs: PorcessesConfig) -> Result<(), InvokeError> {
    let mut config_data = read_all_configs().map_err(|e| InvokeError::from(e.to_string()))?;
    config_data.processes_update_time = configs.processes_update_time;
    config_data.processes_body_background_color = configs.processes_body_background_color;
    config_data.processes_body_color = configs.processes_body_color;
    config_data.processes_head_background_color = configs.processes_head_background_color;
    config_data.processes_head_color = configs.processes_head_color;
    config_data.processes_table_values = configs.processes_table_values;

    write_all_configs(&config_data).map_err(|e| InvokeError::from(e.to_string()))?;
    Ok(())
}

#[tauri::command]
pub async fn set_performance_configs(configs: PerformanceConfig) -> Result<(), InvokeError> {
    let mut config_data = read_all_configs().map_err(|e| InvokeError::from(e.to_string()))?;
    config_data.performance_update_time = configs.performance_update_time;
    config_data.performance_sidebar_background_color = configs.performance_sidebar_background_color;
    config_data.performance_sidebar_color = configs.performance_sidebar_color;
    config_data.performance_sidebar_selected_color = configs.performance_sidebar_selected_color;
    config_data.performance_background_color = configs.performance_background_color;
    config_data.performance_title_color = configs.performance_title_color;
    config_data.performance_label_color = configs.performance_label_color;
    config_data.performance_value_color = configs.performance_value_color;
    config_data.performance_graph_color = configs.performance_graph_color;
    config_data.performance_sec_graph_color = configs.performance_sec_graph_color;

    write_all_configs(&config_data).map_err(|e| InvokeError::from(e.to_string()))?;
    Ok(())
}


#[tauri::command]
pub async fn set_sensors_configs(configs: SensorsConfig) -> Result<(), InvokeError> {
    let mut config_data = read_all_configs().map_err(|e| InvokeError::from(e.to_string()))?;
    config_data.sensors_update_time = configs.sensors_update_time;
    config_data.sensors_background_color = configs.sensors_background_color;
    config_data.sensors_foreground_color = configs.sensors_foreground_color;
    config_data.sensors_boxes_background_color = configs.sensors_boxes_background_color;
    config_data.sensors_boxes_foreground_color = configs.sensors_boxes_foreground_color;
    config_data.sensors_battery_background_color = configs.sensors_battery_background_color;
    config_data.sensors_battery_frame_color = configs.sensors_battery_frame_color;
    config_data.sensors_boxes_title_foreground_color = configs.sensors_boxes_title_foreground_color;

    write_all_configs(&config_data).map_err(|e| InvokeError::from(e.to_string()))?;
    Ok(())
}

#[tauri::command]
pub async fn set_disks_configs(configs: DisksConfig) -> Result<(), InvokeError> {
    let mut config_data = read_all_configs().map_err(|e| InvokeError::from(e.to_string()))?;
    config_data.disks_update_time = configs.disks_update_time;
    config_data.disks_background_color = configs.disks_background_color;
    config_data.disks_boxes_background_color = configs.disks_boxes_background_color;
    config_data.disks_name_foreground_color = configs.disks_name_foreground_color;
    config_data.disks_size_foreground_color = configs.disks_size_foreground_color;
    config_data.disks_partition_background_color = configs.disks_partition_background_color;
    config_data.disks_partition_usage_background_color = configs.disks_partition_usage_background_color;
    config_data.disks_partition_name_foreground_color = configs.disks_partition_name_foreground_color;
    config_data.disks_partition_type_foreground_color = configs.disks_partition_type_foreground_color;
    config_data.disks_partition_usage_foreground_color = configs.disks_partition_usage_foreground_color;

    write_all_configs(&config_data).map_err(|e| InvokeError::from(e.to_string()))?;
    Ok(())
}

#[tauri::command]
pub async fn set_navbar_configs(configs: NavbarConfig) -> Result<(), InvokeError> {
    let mut config_data = read_all_configs().map_err(|e| InvokeError::from(e.to_string()))?;
    config_data.navbar_background_color = configs.navbar_background_color;
    config_data.navbar_buttons_background_color = configs.navbar_buttons_background_color;
    config_data.navbar_buttons_foreground_color = configs.navbar_buttons_foreground_color;
    config_data.navbar_search_background_color = configs.navbar_search_background_color;
    config_data.navbar_search_foreground_color = configs.navbar_search_foreground_color;

    write_all_configs(&config_data).map_err(|e| InvokeError::from(e.to_string()))?;
    Ok(())
}

#[tauri::command]
pub async fn set_heatbar_configs(configs: HeatbarConfig) -> Result<(), InvokeError> {
    let mut config_data = read_all_configs().map_err(|e| InvokeError::from(e.to_string()))?;
    config_data.heatbar_color_one = configs.heatbar_color_one;
    config_data.heatbar_color_two = configs.heatbar_color_two;
    config_data.heatbar_color_three = configs.heatbar_color_three;
    config_data.heatbar_color_four = configs.heatbar_color_four;
    config_data.heatbar_color_five = configs.heatbar_color_five;
    config_data.heatbar_color_six = configs.heatbar_color_six;
    config_data.heatbar_color_seven = configs.heatbar_color_seven;
    config_data.heatbar_color_eight = configs.heatbar_color_eight;
    config_data.heatbar_color_nine = configs.heatbar_color_nine;
    config_data.heatbar_color_ten = configs.heatbar_color_ten;

    write_all_configs(&config_data).map_err(|e| InvokeError::from(e.to_string()))?;
    Ok(())
}

#[tauri::command]
pub async fn set_language_config(configs: LanguageConfig) -> Result<(), InvokeError> {
    let mut config_data = read_all_configs().map_err(|e| InvokeError::from(e.to_string()))?;
    config_data.language = configs.language;
    write_all_configs(&config_data).map_err(|e| InvokeError::from(e.to_string()))?;
    Ok(())
}

// Function to get the configuration file path
fn config_file() -> Result<PathBuf, io::Error> {
    let config_dir = dirs::config_dir().ok_or_else(|| io::Error::new(io::ErrorKind::NotFound, "Unable to determine config directory"))?;
    let folder_path = config_dir.join("hw-monitor");
    let file_path = folder_path.join("hw-monitor.conf");
    Ok(file_path)
}

// Function to check if a folder exists
fn folder_exists(path: &PathBuf) -> bool {
    fs::metadata(path).map(|m| m.is_dir()).unwrap_or(false)
}

// Function to check if a file exists
fn file_exists(path: &PathBuf) -> bool {
    fs::metadata(path).map(|m| m.is_file()).unwrap_or(false)
}