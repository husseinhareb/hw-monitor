use std::fs;
use serde::{Serialize, Deserialize};
use sysinfo::{System,Pid};
use std::io;
use tokio::time::{sleep, Duration};

#[derive(Serialize, Deserialize)]
pub struct Process {
    pid: String,
    name: Option<String>,
    ppid: Option<String>,
    state: Option<String>,
    user: Option<String>,
    memory: Option<String>,
    read_disk_usage: Option<String>,
    write_disk_usage: Option<String>,
    cpu_usage: Option<String>,
    read_disk_speed: Option<String>,
    write_disk_speed:Option<String>,
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
                let mem_str = if mem > 1000 * 1000 {
                    format!("{:.2} Gb", mem as f64 / (1024.0 * 1024.0))
                } else if mem > 1000 {
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





fn get_total_proc_disk_usage(pid_str: &str, s: &sysinfo::System, read: bool) -> Option<String> {
    if let Ok(pid_usize) = pid_str.parse::<usize>() {
        let pid = Pid::from(pid_usize);
        if let Some(process) = s.process(pid) {
            let disk_usage = process.disk_usage();
            let usage_bytes = if read {
                disk_usage.total_read_bytes as f64
            } else {
                disk_usage.total_written_bytes as f64
                
            };
            let usage_str = if usage_bytes > 1024.0 * 1024.0 * 1024.0 {
                format!("{:.2} Gb", usage_bytes / (1024.0 * 1024.0 * 1024.0))
            } else if usage_bytes > 1024.0 * 1024.0 {
                format!("{:.2} Mb", usage_bytes / (1024.0 * 1024.0))
            } else if usage_bytes > 1024.0 {
                format!("{:.2} Kb", usage_bytes / 1024.0)
            } else {
                format!("{:.2} B", usage_bytes)
            };
            return Some(usage_str);
        } else {
            println!("Process with PID {} not found", pid);
        }
    } else {
        println!("Invalid PID: {}", pid_str);
    }
    // Return None in case of error
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

    // Split the string while considering parentheses
    let mut fields = Vec::new();
    let mut inside_parentheses = false;
    let mut current_field = String::new();

    for ch in stat_content.chars() {
        match ch {
            '(' => inside_parentheses = true,
            ')' => inside_parentheses = false,
            ' ' if !inside_parentheses => {
                fields.push(current_field.clone());
                current_field.clear();
            }
            _ => current_field.push(ch),
        }
    }
    if !current_field.is_empty() {
        fields.push(current_field);
    }

    if fields.len() < 17 {
        return Err(io::Error::new(
            io::ErrorKind::InvalidData,
            "Invalid stat file format",
        ));
    }

    // Indices for utime and stime fields
    let utime_index = 13;
    let stime_index = 14;

    let utime: u64 = fields[utime_index].parse().unwrap_or(0);
    let stime: u64 = fields[stime_index].parse().unwrap_or(0);

    Ok((utime, stime))
}

async fn calculate_cpu_percentage(duration_secs: u64) -> Result<Vec<(i32, f64)>, io::Error> {
    let total_cpu_time_start = get_total_cpu_time().await?;
    let pids = list_proc_pid();

    // Collect CPU times for all processes
    let mut process_cpu_times = Vec::new();
    for pid_str in pids {
        if let Ok(pid) = pid_str.parse::<i32>() {
            if let Ok(cpu_time) = get_process_cpu_time(pid).await {
                process_cpu_times.push((pid, cpu_time));
            }
        }
    }

    // Wait for the specified duration
    //sleep(Duration::from_secs(duration_secs)).await;

    let total_cpu_time_end = get_total_cpu_time().await?;

    // Calculate and store CPU usage for each process
    let mut cpu_usage_results = Vec::new();
    for (pid, (utime_start, stime_start)) in process_cpu_times {
        if let Ok((utime_end, stime_end)) = get_process_cpu_time(pid).await {
            let total_cpu_time_diff = total_cpu_time_end as f64 - total_cpu_time_start as f64;
            let cpu_time_start = utime_start + stime_start;
            let cpu_time_end = utime_end + stime_end;

            let cpu_time_diff = cpu_time_end as f64 - cpu_time_start as f64;
            let duration_secs_f64 = duration_secs as f64;

            let max_cpu_usage = 100.0 * (cpu_time_diff / duration_secs_f64) / total_cpu_time_diff;

            // Format the CPU usage to have only two digits after the decimal point
            let formatted_cpu_usage = format!("{:.2}", max_cpu_usage);

            cpu_usage_results.push((pid, formatted_cpu_usage.parse().unwrap_or(0.0)));
        }
    }

    Ok(cpu_usage_results)
}

async fn get_proc_disk_usage_speed(pids: Vec<String>, s: &mut System, read: bool) -> Vec<(i32, f64)> {
    // Capture initial disk usage for all processes
    let mut initial_disk_usages = Vec::new();
    for pid_str in &pids {
        if let Ok(pid_usize) = pid_str.parse::<usize>() {
            if let Some(process) = s.process(Pid::from(pid_usize)) {
                let disk_usage = process.disk_usage();
                let initial_bytes = if read {
                    disk_usage.total_read_bytes as f64
                } else {
                    disk_usage.total_written_bytes as f64
                };
                initial_disk_usages.push((pid_usize as i32, initial_bytes));
            }
        }
    }

    // Sleep for a specified duration
    //sleep(Duration::from_secs(1)).await;

    // Refresh processes information to get updated disk usage
    s.refresh_processes();

    // Capture final disk usage and calculate speeds
    let mut speeds = Vec::new();
    for (pid, initial_bytes) in initial_disk_usages {
        if let Some(process) = s.process(Pid::from(pid as usize)) {
            let disk_usage = process.disk_usage();
            let final_bytes = if read {
                disk_usage.total_read_bytes as f64
            } else {
                disk_usage.total_written_bytes as f64
            };

            let speed_bytes = final_bytes - initial_bytes;

            // Ensure speed_bytes is not negative
            speeds.push((pid, speed_bytes.max(0.0)));
        } else {
            // If the process is no longer available, push a speed of 0.0
            speeds.push((pid, 0.0));
        }
    }

    speeds
}



#[tauri::command]
pub async fn get_processes() -> Vec<Process> {
    let mut processes = Vec::new();
    let mut s = System::new_all();
    let pids = list_proc_pid();

    // Calculate CPU usage percentages for processes
    let cpu_usage_results = match calculate_cpu_percentage(1).await {
        Ok(results) => results,
        Err(e) => {
            eprintln!("Error calculating CPU usage: {}", e);
            Vec::new()
        }
    };

    // Calculate disk usage speed for all processes
    let read_disk_speeds = get_proc_disk_usage_speed(pids.clone(), &mut s, true).await;
    let write_disk_speeds = get_proc_disk_usage_speed(pids.clone(), &mut s, false).await;

    for pid in pids.iter() {
        // Fetch process information
        let name = match get_name(pid) {
            Some(name) => name,
            None => {
                println!("Failed to retrieve name info for process {}", pid);
                continue;
            }
        };

        let ppid = match get_ppid(pid) {
            Some(ppid) => ppid,
            None => {
                println!("Failed to retrieve PPID info for process {}", pid);
                continue;
            }
        };

        let state = match get_proc_state(pid) {
            Some(state) => state,
            None => {
                println!("Failed to retrieve state info for process {}", pid);
                continue;
            }
        };

        let user = match get_proc_user(pid) {
            Some(user) => user,
            None => {
                println!("Failed to retrieve user info for process {}", pid);
                continue;
            }
        };

        let memory = match get_proc_mem(pid) {
            Some(memory) => memory,
            None => {
                println!("Failed to retrieve memory info for process {}", pid);
                continue;
            }
        };

        let read_disk_usage = match get_total_proc_disk_usage(pid, &s, true) {
            Some(usage) => usage,
            None => {
                println!("Failed to retrieve disk info for process {}", pid);
                continue;
            }
        };

        let write_disk_usage = match get_total_proc_disk_usage(pid, &s, false) {
            Some(usage) => usage,
            None => {
                println!("Failed to retrieve disk info for process {}", pid);
                continue;
            }
        };

        // Match CPU usage result with PID
        let cpu_usage = cpu_usage_results.iter().find_map(|(pid_check, usage)| {
            if *pid_check == pid.parse::<i32>().unwrap_or_default() {
                Some(usage.clone())
            } else {
                None
            }
        });

        let process = Process {
            pid: pid.clone(),
            name: Some(name),
            ppid: Some(ppid.clone()),
            state: Some(state),
            user: Some(user),
            memory: Some(memory),
            read_disk_usage: Some(read_disk_usage),
            write_disk_usage: Some(write_disk_usage),
            cpu_usage: cpu_usage.map(|usage| usage.to_string()),
            read_disk_speed: read_disk_speeds.iter().find(|(id, _)| *id == pid.parse::<i32>().unwrap_or_default()).map(|(_, speed)| speed.to_string()),
            write_disk_speed: write_disk_speeds.iter().find(|(id, _)| *id == pid.parse::<i32>().unwrap_or_default()).map(|(_, speed)| speed.to_string()),
        };
        processes.push(process);
    }

    processes
}