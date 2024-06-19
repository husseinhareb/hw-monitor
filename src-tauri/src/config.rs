use std::fs::{self, File};
use std::path::PathBuf;
use std::io::{self, BufRead, Write};
use tauri::InvokeError;
use serde::{Serialize, Deserialize};

// Struct for the configuration data
#[derive(Debug, Deserialize, Serialize)]
pub struct ConfigData {
    pub update_time: u32,
    pub body_background_color: String,
    pub body_color: String,
    pub head_background_color: String,
    pub head_color: String,
    pub table_values: Vec<String>,
}

// Struct for process-specific configuration data
#[derive(Debug, Deserialize, Serialize, Default)]
pub struct ProcessConfigData {
    pub update_time: u32,
    pub body_background_color: String,
    pub body_color: String,
    pub head_background_color: String,
    pub head_color: String,
    pub table_values: Vec<String>,
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
        body_background_color=#2d2d2d\n\
        body_color=#ffffff\n\
        head_background_color=#252526\n\
        head_color=#ffffff\n\
        table_values=[\"user\",\"pid\",\"ppid\",\"state\",\"cpu\",\"memory\"]\n\
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
    let process_config: ProcessConfigData = serde_json::from_str(&config_content)?;

    Ok(process_config)
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
    let table_values_str = data.table_values.join(",");

    let config_content = format!(
        "processes_update_time={}\n\
        body_background_color={}\n\
        body_color={}\n\
        head_background_color={}\n\
        head_color={}\n\
        table_values={}\n",
        data.update_time,
        data.body_background_color,
        data.body_color,
        data.head_background_color,
        data.head_color,
        table_values_str,
    );

    file.write_all(config_content.as_bytes())?;
    file.flush()?; // Ensure data is flushed to disk immediately
    Ok(())
}


#[tauri::command]
pub async fn set_proc_config(data: ConfigData) -> Result<(), InvokeError> {
    println!("Received config data: {:?}", data);
    save_config(&data).map_err(|e| InvokeError::from(e.to_string()))?;
    Ok(())
}

#[tauri::command]
pub async fn get_process_configs() -> Result<ProcessConfigData, InvokeError> {
    read_process_configs().map_err(|e| InvokeError::from(e.to_string()))
}
