use std::fs;

fn list_proc_pid() -> Vec<String> {
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

fn read_proc_file(pid: &str, keyword: &str) -> Option<String> {
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

fn get_name(pid: &str) -> Option<String> {
    read_proc_file(pid, "Name:").map(|name| name.to_string())
}

fn get_ppid(pid: &str) -> Option<String> {
    read_proc_file(pid, "PPid:").map(|name| name.to_string())
}

pub fn print_names() {
    let pids = list_proc_pid();
    for pid in pids {
        if let Some(name) = get_name(&pid) {
            if let Some(ppid) = get_ppid(&pid) {
                println!("PID: {}, Name: {}, PPID: {}", pid, name, ppid);
            }
        }
    }
}

