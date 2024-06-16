use std::fs::{self, File};
use std::path::PathBuf;
use std::io::{self, BufRead, Write};
use tauri::InvokeError;
use serde::Deserialize;

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
        processes_color=value1\n\
        processes_bg_color=value2\n\
        processes_update_time=value3\n\
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

#[derive(Deserialize, Debug)]
pub struct ConfigData {
    pub update_time: u32,
    pub background_color: String,
    pub color: String,
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

pub fn read_process_configs() -> Result<ConfigData, io::Error> {
    let file_path = config_file()?;
    let file = File::open(&file_path)?;
    let reader = io::BufReader::new(file);

    let mut update_time: Option<u32> = None;
    let mut background_color: Option<String> = None;
    let mut color: Option<String> = None;

    for line in reader.lines() {
        let line = line?;
        if line.starts_with("processes_") {
            let parts: Vec<&str> = line.splitn(2, '=').collect();
            if parts.len() == 2 {
                match parts[0] {
                    "processes_update_time" => {
                        update_time = parts[1].parse::<u32>().ok();
                    }
                    "processes_bg_color" => {
                        background_color = Some(parts[1].to_string());
                    }
                    "processes_color" => {
                        color = Some(parts[1].to_string());
                    }
                    _ => {}
                }
            }
        }
    }

    // Ensure all values are found
    if let (Some(update_time), Some(background_color), Some(color)) = (update_time, background_color, color) {
        Ok(ConfigData {
            update_time,
            background_color,
            color,
        })
    } else {
        Err(io::Error::new(io::ErrorKind::NotFound, "Some process config values are missing"))
    }
}


#[tauri::command]
pub async fn set_proc_config(data: ConfigData) {
    println!("Received config data: {:?}", data);
    if let Err(e) = save_config(&data) {
        println!("Failed to save config: {}", e);
    }
}
