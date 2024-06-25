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
    pub sensors_group_background_color: String,
    pub sensors_group_foreground_color: String,
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

// Function to write default values to the config file
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
        sensors_group_background_color=#252526\n\
        sensors_group_foreground_color=#ffffff\n\
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
        sensors_group_background_color: String::new(),
        sensors_group_foreground_color: String::new(),
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
            "sensors_group_background_color" => {
                config_data.sensors_group_background_color = value.to_string();
            },
            "sensors_group_foreground_color" => {
                config_data.sensors_group_foreground_color = value.to_string();
            },
            _ => {
                return Err(io::Error::new(io::ErrorKind::InvalidData, format!("Unknown key in config file: {}", key)));
            }
        }
    }

    Ok(config_data)
}

// Function to save config data to file
pub fn save_config(updated_data: &ConfigData) -> Result<(), io::Error> {
    let existing_data = read_all_configs().unwrap_or(ConfigData {
        processes_update_time: 1000,
        processes_body_background_color: String::from("#2d2d2d"),
        processes_body_color: String::from("#ffffff"),
        processes_head_background_color: String::from("#252526"),
        processes_head_color: String::from("#ffffff"),
        processes_table_values: vec![String::from("user"), String::from("pid"), String::from("ppid"), String::from("state"), String::from("cpu"), String::from("memory")],
        performance_update_time: 1000,
        performance_sidebar_background_color: String::from("#2d2d2d"),
        performance_sidebar_color: String::from("#ffffff"),
        performance_background_color: String::from("#2d2d2d"),
        performance_label_color: String::from("#ffffff"),
        performance_value_color: String::from("#ffffff"),
        performance_graph_color: String::from("#00ff00"),
        performance_sec_graph_color: String::from("#0000ff"),
        sensors_update_time: 1000,
        sensors_background_color: String::from("#2d2d2d"),
        sensors_foreground_color: String::from("#ffffff"),
        sensors_group_background_color: String::from("#252526"),
        sensors_group_foreground_color: String::from("#ffffff"),
    });

    let mut new_table_values = updated_data.processes_table_values.clone();
    if new_table_values.is_empty() {
        new_table_values = existing_data.processes_table_values.clone();
    }

    // Remove duplicates
    new_table_values.sort();
    new_table_values.dedup();

    let new_data = ConfigData {
        processes_update_time: updated_data.processes_update_time,
        processes_body_background_color: if !updated_data.processes_body_background_color.is_empty() { updated_data.processes_body_background_color.clone() } else { existing_data.processes_body_background_color },
        processes_body_color: if !updated_data.processes_body_color.is_empty() { updated_data.processes_body_color.clone() } else { existing_data.processes_body_color },
        processes_head_background_color: if !updated_data.processes_head_background_color.is_empty() { updated_data.processes_head_background_color.clone() } else { existing_data.processes_head_background_color },
        processes_head_color: if (!updated_data.processes_head_color.is_empty()) { updated_data.processes_head_color.clone() } else { existing_data.processes_head_color },
        processes_table_values: new_table_values.clone(),
        performance_update_time: updated_data.performance_update_time,
        performance_sidebar_background_color: if !updated_data.performance_sidebar_background_color.is_empty() { updated_data.performance_sidebar_background_color.clone() } else { existing_data.performance_sidebar_background_color },
        performance_sidebar_color: if !updated_data.performance_sidebar_color.is_empty() { updated_data.performance_sidebar_color.clone() } else { existing_data.performance_sidebar_color },
        performance_background_color: if !updated_data.performance_background_color.is_empty() { updated_data.performance_background_color.clone() } else { existing_data.performance_background_color },
        performance_label_color: if !updated_data.performance_label_color.is_empty() { updated_data.performance_label_color.clone() } else { existing_data.performance_label_color },
        performance_value_color: if !updated_data.performance_value_color.is_empty() { updated_data.performance_value_color.clone() } else { existing_data.performance_value_color },
        performance_graph_color: if !updated_data.performance_graph_color.is_empty() { updated_data.performance_graph_color.clone() } else { existing_data.performance_graph_color },
        performance_sec_graph_color: if !updated_data.performance_sec_graph_color.is_empty() { updated_data.performance_sec_graph_color.clone() } else { existing_data.performance_sec_graph_color },
        sensors_update_time: updated_data.sensors_update_time,
        sensors_background_color: if !updated_data.sensors_background_color.is_empty() { updated_data.sensors_background_color.clone() } else { existing_data.sensors_background_color },
        sensors_foreground_color: if !updated_data.sensors_foreground_color.is_empty() { updated_data.sensors_foreground_color.clone() } else { existing_data.sensors_foreground_color },
        sensors_group_background_color: if !updated_data.sensors_group_background_color.is_empty() { updated_data.sensors_group_background_color.clone() } else { existing_data.sensors_group_background_color },
        sensors_group_foreground_color: if !updated_data.sensors_group_foreground_color.is_empty() { updated_data.sensors_group_foreground_color.clone() } else { existing_data.sensors_group_foreground_color },
    };

    let processes_table_values_str = new_table_values.join(",");

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
        sensors_group_background_color={}\n\
        sensors_group_foreground_color={}\n\
        ",
        new_data.processes_update_time,
        new_data.processes_body_background_color,
        new_data.processes_body_color,
        new_data.processes_head_background_color,
        new_data.processes_head_color,
        processes_table_values_str,
        new_data.performance_update_time,
        new_data.performance_sidebar_background_color,
        new_data.performance_sidebar_color,
        new_data.performance_background_color,
        new_data.performance_label_color,
        new_data.performance_value_color,
        new_data.performance_graph_color,
        new_data.performance_sec_graph_color,
        new_data.sensors_update_time,
        new_data.sensors_background_color,
        new_data.sensors_foreground_color,
        new_data.sensors_group_background_color,
        new_data.sensors_group_foreground_color,
    );

    let file_path = config_file()?;
    let mut file = File::create(file_path)?;

    file.write_all(config_content.as_bytes())?;
    file.flush()?; // Ensure data is flushed to disk immediately
    Ok(())
}

// Tauri command to set process-specific config
#[tauri::command]
pub async fn set_proc_config(data: ConfigData) -> Result<(), InvokeError> {
    println!("Received process config data: {:?}", data);
    let existing_data = read_all_configs().map_err(|e| InvokeError::from(e.to_string()))?;
    let updated_data = ConfigData {
        processes_update_time: data.processes_update_time,
        processes_body_background_color: if !data.processes_body_background_color.is_empty() { data.processes_body_background_color } else { existing_data.processes_body_background_color },
        processes_body_color: if !data.processes_body_color.is_empty() { data.processes_body_color } else { existing_data.processes_body_color },
        processes_head_background_color: if !data.processes_head_background_color.is_empty() { data.processes_head_background_color } else { existing_data.processes_head_background_color },
        processes_head_color: if !data.processes_head_color.is_empty() { data.processes_head_color } else { existing_data.processes_head_color },
        processes_table_values: if !data.processes_table_values.is_empty() { data.processes_table_values } else { existing_data.processes_table_values },
        ..existing_data
    };
    save_config(&updated_data).map_err(|e| InvokeError::from(e.to_string()))?;
    Ok(())
}

// Tauri command to set performance-specific config
#[tauri::command]
pub async fn set_performance_config(data: ConfigData) -> Result<(), InvokeError> {
    println!("Received performance config data: {:?}", data);
    let existing_data = read_all_configs().map_err(|e| InvokeError::from(e.to_string()))?;
    let updated_data = ConfigData {
        performance_update_time: data.performance_update_time,
        performance_sidebar_background_color: if !data.performance_sidebar_background_color.is_empty() { data.performance_sidebar_background_color } else { existing_data.performance_sidebar_background_color },
        performance_sidebar_color: if !data.performance_sidebar_color.is_empty() { data.performance_sidebar_color } else { existing_data.performance_sidebar_color },
        performance_background_color: if (!data.performance_background_color.is_empty()) { data.performance_background_color } else { existing_data.performance_background_color },
        performance_label_color: if !data.performance_label_color.is_empty() { data.performance_label_color } else { existing_data.performance_label_color },
        performance_value_color: if !data.performance_value_color.is_empty() { data.performance_value_color } else { existing_data.performance_value_color },
        performance_graph_color: if !data.performance_graph_color.is_empty() { data.performance_graph_color } else { existing_data.performance_graph_color },
        performance_sec_graph_color: if !data.performance_sec_graph_color.is_empty() { data.performance_sec_graph_color } else { existing_data.performance_sec_graph_color },
        ..existing_data
    };
    save_config(&updated_data).map_err(|e| InvokeError::from(e.to_string()))?;
    Ok(())
}

// Tauri command to set sensor-specific config
#[tauri::command]
pub async fn set_sensors_config(data: ConfigData) -> Result<(), InvokeError> {
    println!("Received sensors config data: {:?}", data);
    let existing_data = read_all_configs().map_err(|e| InvokeError::from(e.to_string()))?;
    let updated_data = ConfigData {
        sensors_update_time: data.sensors_update_time,
        sensors_background_color: if !data.sensors_background_color.is_empty() { data.sensors_background_color } else { existing_data.sensors_background_color },
        sensors_foreground_color: if !data.sensors_foreground_color.is_empty() { data.sensors_foreground_color } else { existing_data.sensors_foreground_color },
        sensors_group_background_color: if !data.sensors_group_background_color.is_empty() { data.sensors_group_background_color } else { existing_data.sensors_group_background_color },
        sensors_group_foreground_color: if !data.sensors_group_foreground_color.is_empty() { data.sensors_group_foreground_color } else { existing_data.sensors_group_foreground_color },
        ..existing_data
    };
    save_config(&updated_data).map_err(|e| InvokeError::from(e.to_string()))?;
    Ok(())
}

// Tauri command to get process-specific config
#[tauri::command]
pub async fn get_process_configs() -> Result<ConfigData, InvokeError> {
    read_all_configs().map_err(|e| InvokeError::from(e.to_string()))
}

// Tauri command to get performance-specific config
#[tauri::command]
pub async fn get_performance_configs() -> Result<ConfigData, InvokeError> {
    read_all_configs().map_err(|e| InvokeError::from(e.to_string()))
}

// Tauri command to get sensors-specific config
#[tauri::command]
pub async fn get_sensors_configs() -> Result<ConfigData, InvokeError> {
    read_all_configs().map_err(|e| InvokeError::from(e.to_string()))
}

// Helper function to check if a folder exists
fn folder_exists(folder_path: &PathBuf) -> bool {
    if let Ok(metadata) = std::fs::metadata(folder_path) {
        metadata.is_dir()
    } else {
        false
    }
}

// Helper function to check if a file exists
fn file_exists(file_path: &PathBuf) -> bool {
    if let Ok(metadata) = std::fs::metadata(file_path) {
        metadata.is_file()
    } else {
        false
    }
}

// Function to get the path of the config file
fn config_file() -> Result<PathBuf, io::Error> {
    let config_dir = match dirs::config_dir() {
        Some(path) => path,
        None => return Err(io::Error::new(io::ErrorKind::NotFound, "Config directory not found")),
    };

    let file_path = config_dir.join("hw-monitor").join("hw-monitor.conf");
    Ok(file_path)
}
