use std::fs::{self, File};
use std::path::PathBuf;
use std::io::{self, BufRead, Write};
use tauri::InvokeError;
use serde::{Serialize, Deserialize};

// Struct for the configuration data
#[derive(Debug, Deserialize, Serialize)]
pub struct ConfigData {
    pub update_time: u32,
    pub background_color: String,
    pub color: String,
}

// Struct for process-specific configuration data
#[derive(Debug, Deserialize, Serialize, Default)]
pub struct ProcessConfigData {
    pub update_time: u32,
    pub background_color: String,
    pub color: String,
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
        processes_update_time=60\n\
        processes_bg_color=#FFFFFF\n\
        processes_color=#000000\n\
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

// Function to read process-specific configs
pub fn read_process_configs() -> Result<ProcessConfigData, io::Error> {
    let config_content = read_all_configs()?;
    let mut process_config = ProcessConfigData::default();

    for line in config_content.lines() {
        if let Some((key, value)) = parse_config_line(line) {
            match key {
                "processes_update_time" => process_config.update_time = value.parse().unwrap_or_default(),
                "processes_bg_color" => process_config.background_color = value.to_string(),
                "processes_color" => process_config.color = value.to_string(),
                _ => {}
            }
        }
    }

    Ok(process_config)
}

// Helper function to parse a single line from config content
fn parse_config_line(line: &str) -> Option<(&str, &str)> {
    let mut parts = line.split('=');
    let key = parts.next()?.trim();
    let value = parts.next()?.trim();
    Some((key, value))
}

// Function to check if a folder exists
fn folder_exists(folder_path: &PathBuf) -> bool {
    if let Ok(metadata) = std::fs::metadata(folder_path) {
        metadata.is_dir()
    } else {
        false
    }
}

// Function to check if a file exists
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
    
    let config_content = format!(
        "processes_update_time={}\nprocesses_bg_color={}\nprocesses_color={}\n",
        data.update_time,
        data.background_color,
        data.color
    );
    
    file.write_all(config_content.as_bytes())?;
    Ok(())
}

#[tauri::command]
pub async fn set_proc_config(data: ConfigData) {
    println!("Received config data: {:?}", data);
    if let Err(e) = save_config(&data) {
        println!("Failed to save config: {}", e);
    }
}

#[tauri::command]
pub async fn get_process_configs() -> Result<ProcessConfigData, InvokeError> {
    read_process_configs().map_err(|e| InvokeError::from(e.to_string()))
}
