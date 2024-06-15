use std::fs::{self, File};
use std::path::PathBuf;
use std::io::{self, prelude::*, BufRead, Write};


// Function to create the config file if not created
pub fn create_config() -> std::io::Result<()> {
    let config_dir = dirs::config_dir().expect("Unable to determine config directory");
    let folder_path = config_dir.join("hw-monitor");

    if !folder_exists(&folder_path) {
        fs::create_dir(&folder_path)?;
    }

    let file_path = folder_path.join("hw-monitor.conf");

    if file_exists(&file_path) {
        Ok(())
    } else {
        Ok(())
    }
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
