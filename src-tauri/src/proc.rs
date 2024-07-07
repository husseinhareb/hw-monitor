use serde::{Serialize, Deserialize};
use tokio::time::{sleep, Duration};
use sysinfo::{System, Pid};
use std::fs;
use std::io;

#[derive(Serialize, Deserialize)]
pub struct Process {
    pid: String,
    name: Option<String>,
    ppid: Option<String>,
    state: Option<String>,
    user: Option<String>,
    memory: Option<String>,
    cpu_usage: Option<String>,
    read_disk_usage: Option<String>,
    write_disk_usage: Option<String>,
    read_disk_speed: Option<String>,
    write_disk_speed: Option<String>,
}

fn list_proc_pid() -> Vec<String> {
    if let Ok(entries) = fs::read_dir("/proc") {
        entries
            .filter_map(|entry| {
                entry.ok().and_then(|entry| {
                    if entry.file_type().ok()?.is_dir() {
                        let folder_name = entry.file_name().to_str()?.to_string();
                        if folder_name.chars().all(|c| c.is_ascii_digit()) {
                            Some(folder_name)
                        } else {
                            None
                        }
                    } else {
                        None
                    }
                })
            })
            .collect()
    } else {
        Vec::new()
    }
}

fn read_proc_status_file(pid: &str) -> Option<(String, String, String)> {
    let status = fs::read_to_string(format!("/proc/{}/status", pid)).ok()?;
    let mut name = None;
    let mut ppid = None;
    let mut uid = None;

    for line in status.lines() {
        if line.starts_with("Name:") {
            name = line.split_whitespace().nth(1).map(String::from);
        } else if line.starts_with("PPid:") {
            ppid = line.split_whitespace().nth(1).map(String::from);
        } else if line.starts_with("Uid:") {
            if let Some(uid_str) = line.split_whitespace().nth(1) {
                if let Ok(parsed_uid) = uid_str.parse::<u32>() {
                    uid = get_username(parsed_uid);
                }
            }
        }
        if name.is_some() && ppid.is_some() && uid.is_some() {
            break;
        }
    }

    Some((name?, ppid?, uid?))
}

fn get_proc_state(pid: &str) -> Option<String> {
    let file_content = fs::read_to_string(format!("/proc/{}/stat", pid)).ok()?;
    file_content.split_whitespace().nth(2).map(|state_abbrev| match state_abbrev {
        "R" => "Running".to_string(),
        "S" => "Sleeping".to_string(),
        "D" => "Disk sleep".to_string(),
        "Z" => "Zombie".to_string(),
        "T" => "Stopped".to_string(),
        "t" => "Tracing stop".to_string(),
        "W" => "Paging".to_string(),
        "X" | "x" => "Dead".to_string(),
        "K" => "Wakekill".to_string(),
        "P" => "Parked".to_string(),
        "I" => "Idle".to_string(),
        _ => "N/A".to_string(),
    })
}

fn get_proc_mem(pid: &str) -> Option<String> {
    let status = fs::read_to_string(format!("/proc/{}/statm", pid)).ok()?;
    let resident_str = status.split_whitespace().nth(1)?;
    let resident = resident_str.parse::<u64>().ok()?;
    let mem = resident * 4;

    let mem_str = if mem > 1_000_000 {
        format!("{:.2} Gb", mem as f64 / 1_024.0 / 1_024.0)
    } else if mem > 1_000 {
        format!("{:.2} Mb", mem as f64 / 1_024.0)
    } else {
        format!("{:.2} Kb", mem)
    };

    Some(mem_str)
}

fn get_username(uid: u32) -> Option<String> {
    let passwd_content = fs::read_to_string("/etc/passwd").ok()?;
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
    None
}

fn get_total_proc_disk_usage(pid_str: &str, s: &System, read: bool) -> Option<String> {
    let pid_usize = pid_str.parse::<usize>().ok()?;
    let pid = Pid::from(pid_usize);
    let process = s.process(pid)?;

    let disk_usage = process.disk_usage();
    let usage_bytes = if read {
        disk_usage.total_read_bytes as f64
    } else {
        disk_usage.total_written_bytes as f64
    };

    let usage_str = if usage_bytes > 1_024.0 * 1_024.0 * 1_024.0 {
        format!("{:.2} Gb", usage_bytes / 1_024.0 / 1_024.0 / 1_024.0)
    } else if usage_bytes > 1_024.0 * 1_024.0 {
        format!("{:.2} Mb", usage_bytes / 1_024.0 / 1_024.0)
    } else if usage_bytes > 1_024.0 {
        format!("{:.2} Kb", usage_bytes / 1_024.0)
    } else {
        format!("{:.2} B", usage_bytes)
    };

    Some(usage_str)
}

async fn get_total_cpu_time() -> Result<u64, io::Error> {
    let stat_content = fs::read_to_string("/proc/stat")?;
    for line in stat_content.lines() {
        if line.starts_with("cpu ") {
            let total_cpu_time: u64 = line.split_whitespace().skip(1).filter_map(|x| x.parse::<u64>().ok()).sum();
            return Ok(total_cpu_time);
        }
    }
    Err(io::Error::new(io::ErrorKind::NotFound, "Total CPU time not found in /proc/stat"))
}

async fn get_process_cpu_time(pid: i32) -> Result<(u64, u64), io::Error> {
    let stat_content = fs::read_to_string(format!("/proc/{}/stat", pid))?;
    let fields: Vec<&str> = stat_content.split_whitespace().collect();
    let utime = fields.get(13).and_then(|s| s.parse::<u64>().ok()).unwrap_or(0);
    let stime = fields.get(14).and_then(|s| s.parse::<u64>().ok()).unwrap_or(0);
    Ok((utime, stime))
}

async fn calculate_cpu_percentage(duration_secs: u64) -> Result<Vec<(i32, f64)>, io::Error> {
    let total_cpu_time_start = get_total_cpu_time().await?;
    let pids = list_proc_pid();

    let mut process_cpu_times = Vec::new();
    for pid_str in pids {
        if let Ok(pid) = pid_str.parse::<i32>() {
            if let Ok(cpu_time) = get_process_cpu_time(pid).await {
                process_cpu_times.push((pid, cpu_time));
            }
        }
    }

    sleep(Duration::from_secs(duration_secs)).await;

    let total_cpu_time_end = get_total_cpu_time().await?;
    let mut cpu_usage_results = Vec::new();

    for (pid, (utime_start, stime_start)) in process_cpu_times {
        if let Ok((utime_end, stime_end)) = get_process_cpu_time(pid).await {
            let total_cpu_time_diff = (total_cpu_time_end - total_cpu_time_start) as f64;
            let cpu_time_diff = (utime_end + stime_end - utime_start - stime_start) as f64;
            let max_cpu_usage = 100.0 * cpu_time_diff / total_cpu_time_diff;

            cpu_usage_results.push((pid, max_cpu_usage));
        }
    }

    Ok(cpu_usage_results)
}

async fn get_proc_disk_usage_speed(pids: Vec<String>, read: bool) -> Vec<(i32, String)> {
    let mut s = System::new_all();
    let mut initial_disk_usages = Vec::new();

    // Collect initial disk usage for each process
    for pid_str in &pids {
        if let Ok(pid_usize) = pid_str.parse::<usize>() {
            if let Some(process) = s.process(Pid::from(pid_usize)) {
                let initial_bytes = if read {
                    process.disk_usage().total_read_bytes as f64
                } else {
                    process.disk_usage().total_written_bytes as f64
                };
                initial_disk_usages.push((pid_usize as i32, initial_bytes));
            }
        }
    }

    sleep(Duration::from_secs(1)).await;

    // Calculate and format disk usage speed for each process
    initial_disk_usages.into_iter().filter_map(|(pid, initial_bytes)| {
        s.process(Pid::from(pid as usize)).map(|process| {
            let final_bytes = if read {
                process.disk_usage().total_read_bytes as f64
            } else {
                process.disk_usage().total_written_bytes as f64
            };
            let usage_bytes = (final_bytes - initial_bytes).max(0.0);
            
            // Format the disk usage into human-readable form
            let usage_str = if usage_bytes > 1_024.0 * 1_024.0 * 1_024.0 {
                format!("{:.2} Gb/s", usage_bytes / 1_024.0 / 1_024.0 / 1_024.0)
            } else if usage_bytes > 1_024.0 * 1_024.0 {
                format!("{:.2} Mb/s", usage_bytes / 1_024.0 / 1_024.0)
            } else if usage_bytes > 1_024.0 {
                format!("{:.2} Kb/s", usage_bytes / 1_024.0)
            } else {
                format!("{:.2} B/s", usage_bytes)
            };
            
            (pid, usage_str)
        })
    }).collect()
}

#[tauri::command]
pub async fn get_processes() -> Vec<Process> {
    let mut processes = Vec::new();
    let pids = list_proc_pid();

    let cpu_usage_results = tokio::spawn(async move {
        calculate_cpu_percentage(1).await.unwrap_or_default()
    });

    let read_disk_speeds = tokio::spawn({
        let pids_clone = pids.clone();
        async move {
            get_proc_disk_usage_speed(pids_clone, true).await
        }
    });

    let write_disk_speeds = tokio::spawn({
        let pids_clone = pids.clone();
        async move {
            get_proc_disk_usage_speed(pids_clone, false).await
        }
    });

    let (cpu_usage_results, read_disk_speeds, write_disk_speeds) = tokio::try_join!(
        cpu_usage_results,
        read_disk_speeds,
        write_disk_speeds
    ).unwrap();

    let mut s = System::new_all();
    for pid in pids {
        let (name, ppid, user) = match read_proc_status_file(&pid) {
            Some(info) => info,
            None => continue,
        };

        let state = get_proc_state(&pid).unwrap_or_else(|| "N/A".to_string());
        let memory = get_proc_mem(&pid).unwrap_or_else(|| "N/A".to_string());
        let read_disk_usage = get_total_proc_disk_usage(&pid, &s, true).unwrap_or_else(|| "N/A".to_string());
        let write_disk_usage = get_total_proc_disk_usage(&pid, &s, false).unwrap_or_else(|| "N/A".to_string());

        let cpu_usage = cpu_usage_results.iter().find_map(|(pid_check, usage)| {
            if *pid_check == pid.parse::<i32>().unwrap_or_default() {
                Some(format!("{:.2}", usage))
            } else {
                None
            }
        });

        let read_disk_speed = read_disk_speeds.iter().find_map(|(id, speed)| {
            if *id == pid.parse::<i32>().unwrap_or_default() {
                Some(format!("{:.2}", speed))
            } else {
                None
            }
        });

        let write_disk_speed = write_disk_speeds.iter().find_map(|(id, speed)| {
            if *id == pid.parse::<i32>().unwrap_or_default() {
                Some(format!("{:.2}", speed))
            } else {
                None
            }
        });

        processes.push(Process {
            pid: pid.clone(),
            name: Some(name),
            ppid: Some(ppid),
            state: Some(state),
            user: Some(user),
            memory: Some(memory),
            cpu_usage,
            read_disk_usage: Some(read_disk_usage),
            write_disk_usage: Some(write_disk_usage),
            read_disk_speed,
            write_disk_speed,
        });
    }

    processes
}
