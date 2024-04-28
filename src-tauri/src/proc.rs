use std::fs;
use serde::{Serialize, Deserialize};
use sysinfo::{System, RefreshKind, CpuRefreshKind,Pid};
use std::io;
use tokio::time::Duration;
use tokio::time;

#[derive(Serialize, Deserialize)]
pub struct Process {
    pid: String,
    name: Option<String>,
    ppid: Option<String>,
    state: Option<String>,
    user: Option<String>,
    memory: Option<String>,
    read_disk_usage: Option<i64>,
    write_disk_usage: Option<i64>,
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


async fn get_cpu_usage_percentage() -> Option<u64> {
    let mut s = System::new_with_specifics(
        RefreshKind::new().with_cpu(CpuRefreshKind::everything()),
    );
    
    // Wait a bit because CPU usage is based on diff.
    std::thread::sleep(sysinfo::MINIMUM_CPU_UPDATE_INTERVAL);
    // Refresh CPUs again.
    s.refresh_cpu();

    let mut total_usage = 0.0;
    let mut num_cpus = 0;

    for cpu in s.cpus() {
        total_usage += cpu.cpu_usage() as f64;
        num_cpus += 1;
    }

    if num_cpus > 0 {
        let average_usage = (total_usage / num_cpus as f64) as u64;
        Some(average_usage)
    } else {
        None
    }
}

fn get_proc_read_disk_usage(pid_str: &str,s: &sysinfo::System) -> Option<i64> {
    if let Ok(pid_usize) = pid_str.parse::<usize>() {
        let pid = Pid::from(pid_usize);
        if let Some(process) = s.process(pid) {
            let disk_usage = process.disk_usage();
            return Some(disk_usage.read_bytes as i64);
        } else {
            println!("Process with PID {} not found", pid);
        }
    } else {
        println!("Invalid PID: {}", pid_str);
    }
    // Return a default value in case of error
    None
}

fn get_proc_write_disk_usage(pid_str: &str,s: &sysinfo::System) -> Option<i64> {
    if let Ok(pid_usize) = pid_str.parse::<usize>() {
        let pid = Pid::from(pid_usize);
        if let Some(process) = s.process(pid) {
            let disk_usage = process.disk_usage();
            return Some(disk_usage.written_bytes as i64);
        } else {
            println!("Process with PID {} not found", pid);
        }
    } else {
        println!("Invalid PID: {}", pid_str);
    }
    // Return a default value in case of error
    None
}


async fn get_total_cpu_time() -> Result<u64, io::Error> {
    let stat_file = "/proc/stat";
    let stat_content = fs::read_to_string(stat_file)?;

    for line in stat_content.lines() {
        if line.starts_with("cpu ") {
            let fields: Vec<&str> = line.split_whitespace().collect();
            // Skip the "cpu" prefix and sum up the values
            let total_cpu_time: u64 = fields[1..].iter().map(|&x| x.parse::<u64>().unwrap_or(0)).sum();
            return Ok(total_cpu_time);
        }
    }

    Err(io::Error::new(
        io::ErrorKind::NotFound,
        "Total CPU time not found in /proc/stat",
    ))
}

async fn get_process_cpu_time(pid: i32) -> Result<(u64, u64), io::Error> {
    let stat_file = format!("/proc/{}/stat", pid);
    let stat_content = fs::read_to_string(&stat_file)?;

    let fields: Vec<&str> = stat_content.split_whitespace().collect();

    if fields.len() < 17 {
        return Err(io::Error::new(
            io::ErrorKind::InvalidData,
            "Invalid stat file format",
        ));
    }

    let utime: u64 = fields[13].parse().unwrap_or(0);
    let stime: u64 = fields[14].parse().unwrap_or(0);

    Ok((utime, stime))
}


async fn calculate_cpu_percentage(pid_str: &str, duration_secs: u64) -> Result<String, io::Error> {
    let pid = pid_str.parse::<i32>().map_err(|e| io::Error::new(io::ErrorKind::InvalidInput, e))?;
    let total_cpu_time_start = get_total_cpu_time().await?;
    let (utime_start, stime_start) = get_process_cpu_time(pid).await?;
    
    // Use tokio::time::sleep for waiting
    time::sleep(Duration::from_secs(duration_secs)).await;
    
    let total_cpu_time_end = get_total_cpu_time().await?;
    let (utime_end, stime_end) = get_process_cpu_time(pid).await?;

    let total_cpu_time_diff = total_cpu_time_end as f64 - total_cpu_time_start as f64;
    let cpu_time_start = utime_start + stime_start;
    let cpu_time_end = utime_end + stime_end;

    let cpu_time_diff = cpu_time_end as f64 - cpu_time_start as f64;
    let duration_secs_f64 = duration_secs as f64;

    let max_cpu_usage = 100.0 * (cpu_time_diff / duration_secs_f64) / total_cpu_time_diff;

    Ok(format!("{:.2}%", max_cpu_usage))
}




#[tauri::command]
pub async fn get_total_usages() -> Option<TotalUsage> {
    if let Some(memory) = get_memory_usage_percentage() {
        if let Some(cpu) = get_cpu_usage_percentage().await {
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
pub async fn get_processes() -> Vec<Process> {
    let mut processes = Vec::new();
    let s = System::new_all();
    let pids = list_proc_pid();
    for pid in pids {
        if let Some(name) = get_name(&pid) {
            if let Some(ppid) = get_ppid(&pid) {
                if let Some(state) = get_proc_state(&pid) {
                    if let Some(user) = get_proc_user(&pid) {
                        if let Some(memory) = get_proc_mem(&pid) {
                            if let Some(read_disk_usage) = get_proc_read_disk_usage(&pid, &s) {
                                if let Some(write_disk_usage) = get_proc_write_disk_usage(&pid, &s) {

                                    let process = Process {
                                        pid: pid.clone(),
                                        name: Some(name),
                                        ppid: Some(ppid),
                                        state: Some(state),
                                        user: Some(user),
                                        memory: Some(memory),
                                        read_disk_usage: Some(read_disk_usage),
                                        write_disk_usage: Some(write_disk_usage),
                                    };
                                    processes.push(process);
                                }else{
                                    println!("Failed to retrieve disk info for process {}", pid);

                                }
                            } else {
                                println!("Failed to retrieve disk info for process {}", pid);
                            }
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
