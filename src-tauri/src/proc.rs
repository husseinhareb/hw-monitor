use std::fs;
use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize)]
pub struct Process {
    pub pid: String,
    pub name: Option<String>,
    pub ppid: Option<String>,
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

pub fn read_proc_file(pid: &str, keyword: &str) -> Option<String> {
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
    read_proc_file(pid, "Name:").map(|name| name.to_string())
}

pub fn get_ppid(pid: &str) -> Option<String> {
    read_proc_file(pid, "PPid:").map(|name| name.to_string())
}

#[tauri::command]
pub fn get_processes() -> Vec<Process> {
    let mut processes = Vec::new();
    let pids = list_proc_pid();
    for pid in pids {
        if let Some(name) = get_name(&pid) {
            if let Some(ppid) = get_ppid(&pid) {
                let process = Process {
                    pid: pid.clone(),
                    name: Some(name),
                    ppid: Some(ppid),
                };
                processes.push(process);
            }
        }
    }
    processes
}
