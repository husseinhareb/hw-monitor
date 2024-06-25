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
    pub performance_background_color: String,
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
    pub sensors_boxes_title_foreground_color: String,

    pub disks_update_time: u32,
    pub disks_background_color: String,
    pub disks_foreground_color: String,
    pub disks_group_background_color: String,
    pub disks_group_foreground_color: String,
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
        processes_update_time=1000\n\
        processes_body_background_color=#2d2d2d\n\
        processes_body_color=#ffffff\n\
        processes_head_background_color=#252526\n\
        processes_head_color=#ffffff\n\
        processes_table_values=user,pid,ppid,state,cpu,memory\n\
        performance_update_time=1000\n\
        performance_sidebar_background_color=#2d2d2d\n\
        performance_sidebar_color=#ffffff\n\
        performance_background_color=#2d2d2d\n\
        performance_label_color=#ffffff\n\
        performance_value_color=#ffffff\n\
        performance_graph_color=#09ffff33\n\
        performance_sec_graph_color=#ff638433\n\
        sensors_update_time=1000\n\
        sensors_background_color=#2d2d2d\n\
        sensors_foreground_color=#ffffff\n\
        sensors_boxes_background_color=#252526\n\
        sensors_boxes_foreground_color=#ffffff\n\
        sensors_battery_background_color=#1E1E1E\n\
        sensors_boxes_title_foreground_color=#9A9A9A\n\
        disks_update_time=1000\n\
        disks_background_color=#2d2d2d\n\
        disks_foreground_color=#ffffff\n\
        disks_group_background_color=#252526\n\
        disks_group_foreground_color=#ffffff\n\
    ";

    file.write_all(default_values.as_bytes())?;
    Ok(())
}

// Function to read all configs
pub fn read_all_configs() -> Result<ConfigData, io::Error> {
    let file_path = config_file()?;

    let file = File::open(&file_path)?;
    let reader = io::BufReader::new(file);

    let mut config_content = String::new();
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
        performance_background_color: String::new(),
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
        sensors_boxes_title_foreground_color: String::new(),
        disks_update_time: 1000,
        disks_background_color: String::new(),
        disks_foreground_color: String::new(),
        disks_group_background_color: String::new(),
        disks_group_foreground_color: String::new(),
    };

    for line in reader.lines() {
        let line = line?;
        config_content.push_str(&line);
        config_content.push('\n');

        let parts: Vec<&str> = line.split('=').map(|s| s.trim()).collect();
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
            "performance_background_color" => {
                config_data.performance_background_color = value.to_string();
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
            "sensors_boxes_title_foreground_color" => {
                config_data.sensors_boxes_title_foreground_color = value.to_string();
            },
            "disks_update_time" => {
                config_data.disks_update_time = value.parse().map_err(|e| io::Error::new(io::ErrorKind::InvalidData, e))?;
            },
            "disks_background_color" => {
                config_data.disks_background_color = value.to_string();
            },
            "disks_foreground_color" => {
                config_data.disks_foreground_color = value.to_string();
            },
            "disks_group_background_color" => {
                config_data.disks_group_background_color = value.to_string();
            },
            "disks_group_foreground_color" => {
                config_data.disks_group_foreground_color = value.to_string();
            },
            _ => {},
        }
    }

    Ok(config_data)
}

pub fn save_config(config: ConfigData) -> Result<(), io::Error> {
    let file_path = config_file()?;
    let mut file = File::create(&file_path)?;

    let config_content = format!(
        "\
        processes_update_time={}\n\
        processes_body_background_color={}\n\
        processes_body_color={}\n\
        processes_head_background_color={}\n\
        processes_head_color={}\n\
        processes_table_values={}\n\
        performance_update_time={}\n\
        performance_sidebar_background_color={}\n\
        performance_sidebar_color={}\n\
        performance_background_color={}\n\
        performance_label_color={}\n\
        performance_value_color={}\n\
        performance_graph_color={}\n\
        performance_sec_graph_color={}\n\
        sensors_update_time={}\n\
        sensors_background_color={}\n\
        sensors_foreground_color={}\n\
        sensors_boxes_background_color={}\n\
        sensors_boxes_foreground_color={}\n\
        sensors_battery_background_color={}\n\
        sensors_boxes_title_foreground_color={}\n\
        disks_update_time={}\n\
        disks_background_color={}\n\
        disks_foreground_color={}\n\
        disks_group_background_color={}\n\
        disks_group_foreground_color={}\n\
        ",
        config.processes_update_time,
        config.processes_body_background_color,
        config.processes_body_color,
        config.processes_head_background_color,
        config.processes_head_color,
        config.processes_table_values.join(","),
        config.performance_update_time,
        config.performance_sidebar_background_color,
        config.performance_sidebar_color,
        config.performance_background_color,
        config.performance_label_color,
        config.performance_value_color,
        config.performance_graph_color,
        config.performance_sec_graph_color,
        config.sensors_update_time,
        config.sensors_background_color,
        config.sensors_foreground_color,
        config.sensors_boxes_background_color,
        config.sensors_boxes_foreground_color,
        config.sensors_battery_background_color,
        config.sensors_boxes_title_foreground_color,
        config.disks_update_time,
        config.disks_background_color,
        config.disks_foreground_color,
        config.disks_group_background_color,
        config.disks_group_foreground_color,
    );

    file.write_all(config_content.as_bytes())?;
    Ok(())
}

#[tauri::command]
pub async fn set_config(config: ConfigData) -> Result<(), InvokeError> {
    match save_config(config) {
        Ok(_) => Ok(()),
        Err(e) => Err(InvokeError::from(e.to_string())),
    }
}

#[tauri::command]
pub async fn get_configs() -> Result<ConfigData, InvokeError> {
    read_all_configs().map_err(|e| InvokeError::from(e.to_string()))
}

// Helper function to get the configuration file path
fn config_file() -> Result<PathBuf, io::Error> {
    let config_dir = dirs::config_dir().ok_or_else(|| io::Error::new(io::ErrorKind::NotFound, "Unable to determine config directory"))?;
    let folder_path = config_dir.join("hw-monitor");
    let file_path = folder_path.join("hw-monitor.conf");
    Ok(file_path)
}

// Helper function to check if a folder exists
fn folder_exists(path: &PathBuf) -> bool {
    fs::metadata(path).map(|metadata| metadata.is_dir()).unwrap_or(false)
}

// Helper function to check if a file exists
fn file_exists(path: &PathBuf) -> bool {
    fs::metadata(path).map(|metadata| metadata.is_file()).unwrap_or(false)
}
