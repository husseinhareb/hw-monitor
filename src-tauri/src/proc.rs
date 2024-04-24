use std::fs;
use serde::{Serialize, Deserialize};
use std::io::{BufReader,BufRead};
use std::fs::File;

use sysinfo::Pid;

static mut PREVIOUS_IDLE_TIME: usize = 0;
static mut PREVIOUS_TOTAL_TIME: usize = 0;

#[derive(Serialize, Deserialize)]
pub struct ProcessCpu {
    pid: Option<String>,
    cpu_usage: Option<String>,
}

fn calculate_cpu_usage(pid: usize) -> Result<f32, std::io::Error> {
    let mut sys = sysinfo::System::new_all();
    sys.refresh_all();

    if let Some(process) = sys.process(Pid::from(pid)) {
        println!("Process CPU Usage: {}%", process.cpu_usage());
        Ok(process.cpu_usage())
    } else {
        // Handle the case when the process is not found
        Err(std::io::Error::new(
            std::io::ErrorKind::NotFound,
            "Process not found",
        ))
    }
}

#[tauri::command]
pub fn get_cpu_usage_proccess() -> Vec<ProcessCpu> {
    let mut processes = Vec::new();
    let pids = list_proc_pid();
    for pid in pids {
        if let Ok(pid_num) = pid.parse::<usize>() {
            if let Ok(cpu_usage) = calculate_cpu_usage(pid_num) {
                let process = ProcessCpu {
                    pid: Some(pid.clone()),
                    cpu_usage: Some(cpu_usage.to_string()),
                };
                processes.push(process);
            } else {
                println!("Failed to retrieve CPU usage for process {}", pid);
            }
        } else {
            println!("Failed to parse PID: {}", pid);
        }
    }
    processes
}


#[derive(Serialize, Deserialize)]
pub struct Process {
    pid: String,
    name: Option<String>,
    ppid: Option<String>,
    state: Option<String>,
    user: Option<String>,
    memory: Option<String>,
}

#[derive(Serialize, Deserialize)]
pub struct TotalUsage {
    memory: Option<String>,
    cpu: Option<String>,
    processes: Option<String>
}



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


fn read_proc_status_file(pid: &str, keyword: &str) -> Option<String> {
    if let Ok(status) = fs::read_to_string(format!("/proc/{}/status", pid)) {
        for line in status.lines() {
            if line.starts_with(keyword) {
                let mut parts = line.split_whitespace();
                parts.next();
                if let Some(value) = parts.next() {
                    return Some(value.to_string());
                }
            }
        }
    }
    None
}

fn get_running_processes_count() -> Option<usize> {
    if let Ok(entries) = fs::read_dir("/proc") {
        let count = entries
            .filter_map(|entry| {
                entry.ok().and_then(|e| {
                    e.file_name().into_string().ok().and_then(|s| {
                        if s.chars().all(char::is_numeric) {
                            Some(())
                        } else {
                            None
                        }
                    })
                })
            })
            .count();
        Some(count)
    } else {
        None 
    }
}

fn get_name(pid: &str) -> Option<String> {
    read_proc_status_file(pid, "Name:").map(|name| name.to_string())
}

fn get_ppid(pid: &str) -> Option<String> {
    read_proc_status_file(pid, "PPid:").map(|name| name.to_string())
}

fn get_proc_state(pid: &str) -> Option<String> {
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
                "P" => Some("Parked".to_string()),
                "I" => Some("Idle".to_string()),
                _ => Some("N/A".to_string()),
            }
        } else {
            None
        }
    } else {
        None
    }
}


fn get_proc_mem(pid: &str) -> Option<String> {
    if let Ok(status) = fs::read_to_string(format!("/proc/{}/statm", pid)) {
        if let Some(resident_str) = status.split_whitespace().nth(1) {
            if let Ok(resident) = resident_str.parse::<u64>() {
                let mem = resident * 4;
                let mem_str = if mem > 1024 * 1024 {
                    format!("{:.2} Gb", mem as f64 / (1024.0 * 1024.0))
                } else if mem > 1024 {
                    format!("{:.2} Mb", mem as f64 / 1024.0)
                } else {
                    format!("{:.2} Kb", mem)
                };
                Some(mem_str)
            } else {
                None
            }
        } else {
            None
        }
    } else {
        None
    }
}

fn get_proc_user(pid: &str) -> Option<String> {
    if let Ok(status) = fs::read_to_string(format!("/proc/{}/status", pid)) {
        for line in status.lines() {
            if line.starts_with("Uid:") {
                let parts: Vec<&str> = line.split_whitespace().collect();
                if let Some(uid_str) = parts.get(1) {
                    if let Ok(uid) = uid_str.parse::<u32>() {
                        if let Some(username) = get_username(uid) {
                            return Some(username);
                        }
                    }
                }
            }
        }
    }
    None
}

fn get_username(uid: u32) -> Option<String> {
    if let Ok(passwd_content) = fs::read_to_string("/etc/passwd") {
        for line in passwd_content.lines() {
            let fields: Vec<&str> = line.split(':').collect();
            if let (Some(name), Some(passwd_uid)) = (fields.get(0), fields.get(2)) {
                if let Ok(uid_from_file) = passwd_uid.parse::<u32>() {
                    if uid_from_file == uid {
                        return Some(name.to_string());
                    }
                }
            }
        }
    }
    None
}



fn get_memory_usage_percentage() -> Option<u64> {
    let mut total_memory = 0;
    let mut used_memory = 0;

    if let Ok(meminfo) = fs::read_to_string("/proc/meminfo") {
        for line in meminfo.lines() {
            let parts: Vec<&str> = line.split_whitespace().collect();
            if parts.len() >= 2 && parts[0] == "MemTotal:" {
                if let Ok(mem_total) = parts[1].parse::<u64>() {
                    total_memory = mem_total;
                }
            }
            if parts.len() >= 2 && parts[0] == "MemAvailable:" {
                if let Ok(memory_used) = parts[1].parse::<u64>() {
                    used_memory = memory_used;
                }
            }
        }
        if total_memory != 0 {
            let memory_usage_percentage = ((total_memory - used_memory) * 100) / total_memory;
            return Some(memory_usage_percentage);
        }
    }
    None
}


fn get_cpu_times() -> Vec<usize> {
    let file = File::open("/proc/stat").expect("Failed to open /proc/stat");
    let mut buf_reader = BufReader::new(file);
    let mut line = String::new();
    buf_reader.read_line(&mut line).expect("Failed to read /proc/stat");

    line.split_whitespace()
        .skip(1)
        .filter_map(|x| x.parse().ok())
        .collect()
}

fn get_cpu_times_diff(idle_time: &mut usize, total_time: &mut usize) -> bool {
    let cpu_times = get_cpu_times();
    if cpu_times.len() < 4 {
        return false;
    }

    *idle_time = cpu_times[3];
    *total_time = cpu_times.iter().sum();
    true
}



fn get_cpu_usage_percentage() -> Option<u64> {
    let mut idle_time = 0;
    let mut total_time = 0;

    unsafe {
        if get_cpu_times_diff(&mut idle_time, &mut total_time) {
            let idle_time_delta = idle_time as isize - PREVIOUS_IDLE_TIME as isize;
            let total_time_delta = total_time as isize - PREVIOUS_TOTAL_TIME as isize;
            if total_time_delta != 0 {
                let utilization = 100 - ((100 * idle_time_delta) / total_time_delta);
                PREVIOUS_IDLE_TIME = idle_time;
                PREVIOUS_TOTAL_TIME = total_time;
                Some(utilization as u64)
            } else {
                None
            }
        } else {
            None
        }
    }
}


#[tauri::command]
pub fn get_total_usages() -> Option<TotalUsage> {
    if let Some(memory) = get_memory_usage_percentage() {
        if let Some(cpu) = get_cpu_usage_percentage() {
            if let Some(processes) = get_running_processes_count() {

            let total_usage = TotalUsage {
                memory: Some(memory.to_string()),
                cpu: Some(cpu.to_string()),
                processes: Some(processes.to_string()),
            };
            return Some(total_usage);
        };
    }
    }
    None
}



#[tauri::command]
pub fn get_processes() -> Vec<Process> {
    let mut processes = Vec::new();
    let pids = list_proc_pid();
    for pid in pids {
        if let Some(name) = get_name(&pid) {
            if let Some(ppid) = get_ppid(&pid) {
                if let Some(state) = get_proc_state(&pid) {
                    if let Some(user) = get_proc_user(&pid) {
                        if let Some(memory) = get_proc_mem(&pid) {
                                let process = Process {
                                    pid: pid.clone(),
                                    name: Some(name),
                                    ppid: Some(ppid),
                                    state: Some(state),
                                    user: Some(user),
                                    memory: Some(memory),
                                };
                                processes.push(process);
                        } else {
                            println!("Failed to retrieve memory info for process {}", pid);
                        }
                    } else {
                        println!("Failed to retrieve user info for process {}", pid);
                    }
                } else {
                    println!("Failed to retrieve state info for process {}", pid);
                }
            } else {
                println!("Failed to retrieve PPID info for process {}", pid);
            }
        } else {
            println!("Failed to retrieve name info for process {}", pid);
        }
    }
    processes
}
