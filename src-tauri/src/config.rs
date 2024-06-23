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
}

// Struct for process-specific configuration data
#[derive(Debug, Deserialize, Serialize, Default)]
pub struct ProcessConfigData {
    pub processes_update_time: u32,
    pub processes_body_background_color: String,
    pub processes_body_color: String,
    pub processes_head_background_color: String,
    pub processes_head_color: String,
    pub processes_table_values: Vec<String>,
}

// Struct for performance-specific configuration data
#[derive(Debug, Deserialize, Serialize, Default)]
pub struct PerformanceConfigData {
    pub performance_update_time: u32,
    pub performance_body_background_color: String,
    pub performance_body_color: String,
    pub performance_head_background_color: String,
    pub performance_head_color: String,
}

// Function to create the initial configuration file if not exists
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
        processes_table_values=[\"user\",\"pid\",\"ppid\",\"state\",\"cpu\",\"memory\"]\n\
        performance_update_time=1000\n\
        performance_body_background_color=#2d2d2d\n\
        performance_body_color=#ffffff\n\
        performance_head_background_color=#252526\n\
        performance_head_color=#ffffff\n\
    ";

    file.write_all(default_values.as_bytes())?;
    Ok(())
}

// Function to read all configs
pub fn read_all_configs() -> io::Result<String> {
    let file_path = config_file()?;

    let file = File::open(&file_path)?;
    let reader = io::BufReader::new(file);

    let mut config_content = String::new();

    for line in reader.lines() {
        let line = line?;
        config_content.push_str(&line);
        config_content.push('\n');
        println!("{}", line);
    }

    if config_content.is_empty() {
        return Err(io::Error::new(io::ErrorKind::NotFound, "Config content not found"));
    }

    Ok(config_content)
}

// Define a function to read process-specific configs
pub fn read_process_configs() -> Result<ProcessConfigData, io::Error> {
    let config_content = read_all_configs()?;

    // Split config_content into lines
    let lines: Vec<&str> = config_content.lines().collect();

    // Initialize variables to store parsed values
    let mut processes_update_time: Option<u32> = None;
    let mut processes_body_background_color: Option<String> = None;
    let mut processes_body_color: Option<String> = None;
    let mut processes_head_background_color: Option<String> = None;
    let mut processes_head_color: Option<String> = None;
    let mut processes_table_values: Option<Vec<String>> = None;

    for line in lines {
        // Split each line into key-value pairs
        let parts: Vec<&str> = line.split('=').map(|s| s.trim()).collect();

        if parts.len() != 2 {
            return Err(io::Error::new(io::ErrorKind::InvalidData, "Invalid format in config file"));
        }

        let key = parts[0];
        let value = parts[1];

        match key {
            "processes_update_time" => {
                processes_update_time = Some(value.parse().map_err(|e| io::Error::new(io::ErrorKind::InvalidData, e))?);
            },
            "processes_body_background_color" => {
                processes_body_background_color = Some(value.to_string());
            },
            "processes_body_color" => {
                processes_body_color = Some(value.to_string());
            },
            "processes_head_background_color" => {
                processes_head_background_color = Some(value.to_string());
            },
            "processes_head_color" => {
                processes_head_color = Some(value.to_string());
            },
            "processes_table_values" => {
                processes_table_values = Some(value.split(',').map(|s| s.trim().to_string()).collect());
            },
            _ => {
                return Err(io::Error::new(io::ErrorKind::InvalidData, format!("Unknown key in config file: {}", key)));
            }
        }
    }

    // Construct the ProcessConfigData struct
    let config_data = ProcessConfigData {
        processes_update_time: processes_update_time.ok_or_else(|| io::Error::new(io::ErrorKind::InvalidData, "Missing processes_update_time"))?,
        processes_body_background_color: processes_body_background_color.ok_or_else(|| io::Error::new(io::ErrorKind::InvalidData, "Missing processes_body_background_color"))?,
        processes_body_color: processes_body_color.ok_or_else(|| io::Error::new(io::ErrorKind::InvalidData, "Missing processes_body_color"))?,
        processes_head_background_color: processes_head_background_color.ok_or_else(|| io::Error::new(io::ErrorKind::InvalidData, "Missing processes_head_background_color"))?,
        processes_head_color: processes_head_color.ok_or_else(|| io::Error::new(io::ErrorKind::InvalidData, "Missing processes_head_color"))?,
        processes_table_values: processes_table_values.ok_or_else(|| io::Error::new(io::ErrorKind::InvalidData, "Missing processes_table_values"))?,
    };

    Ok(config_data)
}

// Define a function to read performance-specific configs
pub fn read_performance_configs() -> Result<PerformanceConfigData, io::Error> {
    let config_content = read_all_configs()?;

    // Split config_content into lines
    let lines: Vec<&str> = config_content.lines().collect();

    // Initialize variables to store parsed values
    let mut performance_update_time: Option<u32> = None;
    let mut performance_body_background_color: Option<String> = None;
    let mut performance_body_color: Option<String> = None;
    let mut performance_head_background_color: Option<String> = None;
    let mut performance_head_color: Option<String> = None;

    for line in lines {
        // Split each line into key-value pairs
        let parts: Vec<&str> = line.split('=').map(|s| s.trim()).collect();

        if parts.len() != 2 {
            return Err(io::Error::new(io::ErrorKind::InvalidData, "Invalid format in config file"));
        }

        let key = parts[0];
        let value = parts[1];

        match key {
            "performance_update_time" => {
                performance_update_time = Some(value.parse().map_err(|e| io::Error::new(io::ErrorKind::InvalidData, e))?);
            },
            "performance_body_background_color" => {
                performance_body_background_color = Some(value.to_string());
            },
            "performance_body_color" => {
                performance_body_color = Some(value.to_string());
            },
            "performance_head_background_color" => {
                performance_head_background_color = Some(value.to_string());
            },
            "performance_head_color" => {
                performance_head_color = Some(value.to_string());
            },
            _ => {
                return Err(io::Error::new(io::ErrorKind::InvalidData, format!("Unknown key in config file: {}", key)));
            }
        }
    }

    // Construct the PerformanceConfigData struct
    let config_data = PerformanceConfigData {
        performance_update_time: performance_update_time.ok_or_else(|| io::Error::new(io::ErrorKind::InvalidData, "Missing performance_update_time"))?,
        performance_body_background_color: performance_body_background_color.ok_or_else(|| io::Error::new(io::ErrorKind::InvalidData, "Missing performance_body_background_color"))?,
        performance_body_color: performance_body_color.ok_or_else(|| io::Error::new(io::ErrorKind::InvalidData, "Missing performance_body_color"))?,
        performance_head_background_color: performance_head_background_color.ok_or_else(|| io::Error::new(io::ErrorKind::InvalidData, "Missing performance_head_background_color"))?,
        performance_head_color: performance_head_color.ok_or_else(|| io::Error::new(io::ErrorKind::InvalidData, "Missing performance_head_color"))?,
    };

    Ok(config_data)
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

// Function to save config data to file
pub fn save_config(data: &ConfigData) -> Result<(), io::Error> {
    let file_path = config_file()?;
    let mut file = File::create(&file_path)?;

    // Serialize table_values as a comma-separated string
    let table_values_str = data.processes_table_values.join(",");

    let config_content = format!(
        "processes_update_time={}\n\
        processes_body_background_color={}\n\
        processes_body_color={}\n\
        processes_head_background_color={}\n\
        processes_head_color={}\n\
        processes_table_values={}\n",
        data.processes_update_time,
        data.processes_body_background_color,
        data.processes_body_color,
        data.processes_head_background_color,
        data.processes_head_color,
        table_values_str,
    );

    file.write_all(config_content.as_bytes())?;
    file.flush()?; // Ensure data is flushed to disk immediately
    Ok(())
}

// Function to save performance config data to file
pub fn save_performance_config(data: &PerformanceConfigData) -> Result<(), io::Error> {
    let file_path = config_file()?;
    let mut file = File::create(&file_path)?;

    let config_content = format!(
        "performance_update_time={}\n\
        performance_body_background_color={}\n\
        performance_body_color={}\n\
        performance_head_background_color={}\n\
        performance_head_color={}\n",
        data.performance_update_time,
        data.performance_body_background_color,
        data.performance_body_color,
        data.performance_head_background_color,
        data.performance_head_color,
    );

    file.write_all(config_content.as_bytes())?;
    file.flush()?; // Ensure data is flushed to disk immediately
    Ok(())
}

// Tauri command to set process-specific config
#[tauri::command]
pub async fn set_proc_config(data: ConfigData) -> Result<(), InvokeError> {
    println!("Received config data: {:?}", data);
    save_config(&data).map_err(|e| InvokeError::from(e.to_string()))?;
    Ok(())
}

// Tauri command to get process-specific config
#[tauri::command]
pub async fn get_process_configs() -> Result<ProcessConfigData, InvokeError> {
    read_process_configs().map_err(|e| InvokeError::from(e.to_string()))
}

// Tauri command to get performance-specific config
#[tauri::command]
pub async fn get_performance_configs() -> Result<PerformanceConfigData, InvokeError> {
    read_performance_configs().map_err(|e| InvokeError::from(e.to_string()))
}

// Tauri command to set performance-specific config
#[tauri::command]
pub async fn set_performance_config(data: PerformanceConfigData) -> Result<(), InvokeError> {
    println!("Received performance config data: {:?}", data);
    save_performance_config(&data).map_err(|e| InvokeError::from(e.to_string()))?;
    Ok(())
}
