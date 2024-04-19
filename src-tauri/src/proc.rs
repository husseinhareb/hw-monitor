use std::fs;
use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize)]
pub struct Process {
    pub pid: String,
    pub name: Option<String>,
    pub ppid: Option<String>,
    pub state: Option<String>
}

pub fn list_proc_pid() -> Vec<String> {
    let entries = fs::read_dir("/proc").unwrap();

    let mut folders = Vec::new();
    for entry in entries {
        let entry = entry.unwrap();
        if entry.file_type().unwrap().is_dir() {
            if let Some(folder_name) = entry.file_name().to_str() {
                if folder_name.chars().all(|c| c.is_ascii_digit()) {
                    folders.push(folder_name.to_owned());
                }
            }
        }
    }
    folders
}

pub fn read_proc_status_file(pid: &str, keyword: &str) -> Option<String> {
    if let Ok(status) = fs::read_to_string(format!("/proc/{}/status", pid)) {
        for line in status.lines() {
            if line.starts_with(keyword) {
                if let Some(value) = line.split_whitespace().nth(1) {
                    return Some(value.to_string());
                }
            }
        }
    }
    None
}

pub fn get_name(pid: &str) -> Option<String> {
    read_proc_status_file(pid, "Name:").map(|name| name.to_string())
}

pub fn get_ppid(pid: &str) -> Option<String> {
   read_proc_status_file(pid, "PPid:").map(|name| name.to_string())
}


pub fn get_proc_state(pid: &str) -> Option<String> {
    if let Ok(file_content) = fs::read_to_string(format!("/proc/{}/stat", pid)) {
        if let Some(state_abbrev) = file_content.split_whitespace().nth(2) {
            match state_abbrev {
                "R" => Some("Running".to_string()),
                "S" => Some("Sleeping".to_string()),
                "D" => Some("Disk sleep".to_string()),
                "Z" => Some("Zombie".to_string()),
                "T" => Some("Stopped".to_string()),
                "t" => Some("Tracing stop".to_string()),
                "W" => Some("Paging".to_string()),
                "X" => Some("Dead".to_string()),
                "x" => Some("Dead".to_string()),
                "K" => Some("Wakekill".to_string()),
                "W" => Some("Waking".to_string()),
                "P" => Some("Parked".to_string()),
                "I" => Some("Idle".to_string()),
                _ => None,
            }
        } else {
            None
        }
    } else {
        None
    }
}


#[tauri::command]
pub fn get_processes() -> Vec<Process> {
    let mut processes = Vec::new();
    let pids = list_proc_pid();
    for pid in pids {
        if let Some(name) = get_name(&pid) {
            if let Some(ppid) = get_ppid(&pid) {
                if let Some(state) = get_proc_state(&pid){
                let process = Process {
                    pid: pid.clone(),
                    name: Some(name),
                    ppid: Some(ppid),
                    state: Some(state),
                };
                processes.push(process);
            }
        }
        }
    }
    processes
}
