use serde::{Serialize, Deserialize};
use std::collections::HashMap;
use std::fs;
use std::io;
use std::sync::Mutex;
use std::time::Instant;

#[derive(Serialize, Deserialize, Debug)]
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

fn build_uid_map() -> HashMap<u32, String> {
    let mut map = HashMap::new();
    if let Ok(passwd_content) = fs::read_to_string("/etc/passwd") {
        for line in passwd_content.lines() {
            let fields: Vec<&str> = line.split(':').collect();
            if let (Some(name), Some(uid_str)) = (fields.get(0), fields.get(2)) {
                if let Ok(uid) = uid_str.parse::<u32>() {
                    map.insert(uid, name.to_string());
                }
            }
        }
    }
    map
}

fn read_proc_status_file(pid: &str, uid_map: &HashMap<u32, String>) -> Option<(String, String, String)> {
    let status = fs::read_to_string(format!("/proc/{}/status", pid)).ok()?;
    let mut name = None;
    let mut ppid = None;
    let mut user = None;

    for line in status.lines() {
        if line.starts_with("Name:") {
            name = line.split_whitespace().nth(1).map(String::from);
        } else if line.starts_with("PPid:") {
            ppid = line.split_whitespace().nth(1).map(String::from);
        } else if line.starts_with("Uid:") {
            if let Some(uid_str) = line.split_whitespace().nth(1) {
                if let Ok(parsed_uid) = uid_str.parse::<u32>() {
                    user = uid_map.get(&parsed_uid).cloned();
                }
            }
        }
        if name.is_some() && ppid.is_some() && user.is_some() {
            break;
        }
    }

    Some((name?, ppid?, user?))
}

fn get_proc_state(pid: &str) -> Option<String> {
    let file_content = fs::read_to_string(format!("/proc/{}/stat", pid)).ok()?;
    let after_comm = &file_content[file_content.rfind(')')? + 2..];
    after_comm.split_whitespace().next().map(|state_abbrev| match state_abbrev {
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

fn format_bytes(bytes: f64) -> String {
    if bytes > 1_024.0 * 1_024.0 * 1_024.0 {
        format!("{:.2} Gb", bytes / 1_024.0 / 1_024.0 / 1_024.0)
    } else if bytes > 1_024.0 * 1_024.0 {
        format!("{:.2} Mb", bytes / 1_024.0 / 1_024.0)
    } else if bytes > 1_024.0 {
        format!("{:.2} Kb", bytes / 1_024.0)
    } else {
        format!("{:.2} B", bytes)
    }
}

fn format_bytes_per_sec(bytes: f64) -> String {
    if bytes >= 1_024.0 * 1_024.0 * 1_024.0 {
        format!("{:.2} Gb/s", bytes / 1_024.0 / 1_024.0 / 1_024.0)
    } else if bytes >= 1_024.0 * 1_024.0 {
        format!("{:.2} Mb/s", bytes / 1_024.0 / 1_024.0)
    } else if bytes >= 1_024.0 {
        format!("{:.2} Kb/s", bytes / 1_024.0)
    } else {
        format!("{:.2} B/s", bytes)
    }
}

fn get_total_cpu_time() -> Result<u64, io::Error> {
    let stat_content = fs::read_to_string("/proc/stat")?;
    for line in stat_content.lines() {
        if line.starts_with("cpu ") {
            let total_cpu_time: u64 = line.split_whitespace().skip(1).filter_map(|x| x.parse::<u64>().ok()).sum();
            return Ok(total_cpu_time);
        }
    }
    Err(io::Error::new(io::ErrorKind::NotFound, "Total CPU time not found in /proc/stat"))
}

fn get_process_cpu_time(pid: i32) -> Option<(u64, u64)> {
    let stat_content = fs::read_to_string(format!("/proc/{}/stat", pid)).ok()?;
    let after_comm = &stat_content[stat_content.rfind(')')? + 2..];
    let fields: Vec<&str> = after_comm.split_whitespace().collect();
    let utime = fields.get(11).and_then(|s| s.parse::<u64>().ok()).unwrap_or(0);
    let stime = fields.get(12).and_then(|s| s.parse::<u64>().ok()).unwrap_or(0);
    Some((utime, stime))
}

pub struct ProcSnapshot {
    pub total_cpu_time: u64,
    pub process_cpu_times: HashMap<i32, (u64, u64)>,
    pub process_io: HashMap<i32, (u64, u64)>,
    pub time: Instant,
}

fn calculate_cpu_percentage(prev: &Mutex<Option<ProcSnapshot>>, pids: &[String]) -> (HashMap<i32, f64>, HashMap<i32, DiskSpeedEntry>) {
    let total_cpu_time_now = match get_total_cpu_time() {
        Ok(t) => t,
        Err(_) => return (HashMap::new(), HashMap::new()),
    };
    let now = Instant::now();

    // Collect current per-process CPU times and I/O
    let mut cur_cpu: HashMap<i32, (u64, u64)> = HashMap::with_capacity(pids.len());
    let mut cur_io: HashMap<i32, (u64, u64)> = HashMap::with_capacity(pids.len());
    for pid_str in pids {
        if let Ok(pid) = pid_str.parse::<i32>() {
            if let Some(cpu_time) = get_process_cpu_time(pid) {
                cur_cpu.insert(pid, cpu_time);
            }
            if let Some(io_data) = read_proc_io(pid) {
                cur_io.insert(pid, io_data);
            }
        }
    }

    let mut guard = prev.lock().unwrap_or_else(|e| e.into_inner());

    let mut cpu_results = HashMap::new();
    let mut disk_results = HashMap::new();

    if let Some(ref snap) = *guard {
        let total_cpu_diff = total_cpu_time_now.saturating_sub(snap.total_cpu_time) as f64;
        let elapsed = now.duration_since(snap.time).as_secs_f64();

        if total_cpu_diff > 0.0 {
            for (&pid, &(utime, stime)) in &cur_cpu {
                if let Some(&(prev_utime, prev_stime)) = snap.process_cpu_times.get(&pid) {
                    let cpu_time_diff = (utime + stime).saturating_sub(prev_utime + prev_stime) as f64;
                    let usage = 100.0 * cpu_time_diff / total_cpu_diff;
                    cpu_results.insert(pid, usage);
                }
            }
        }

        if elapsed > 0.0 {
            for (&pid, &(read_now, write_now)) in &cur_io {
                if let Some(&(prev_read, prev_write)) = snap.process_io.get(&pid) {
                    let delta_read = read_now.saturating_sub(prev_read) as f64 / elapsed;
                    let delta_write = write_now.saturating_sub(prev_write) as f64 / elapsed;
                    disk_results.insert(pid, DiskSpeedEntry {
                        read_speed: format_bytes_per_sec(delta_read),
                        write_speed: format_bytes_per_sec(delta_write),
                    });
                }
            }
        }
    }

    *guard = Some(ProcSnapshot {
        total_cpu_time: total_cpu_time_now,
        process_cpu_times: cur_cpu,
        process_io: cur_io,
        time: now,
    });

    (cpu_results, disk_results)
}

struct DiskSpeedEntry {
    read_speed: String,
    write_speed: String,
}

fn read_proc_io(pid: i32) -> Option<(u64, u64)> {
    let content = fs::read_to_string(format!("/proc/{}/io", pid)).ok()?;
    let mut read_bytes = 0u64;
    let mut write_bytes = 0u64;
    for line in content.lines() {
        if let Some(val) = line.strip_prefix("read_bytes: ") {
            read_bytes = val.trim().parse().unwrap_or(0);
        } else if let Some(val) = line.strip_prefix("write_bytes: ") {
            write_bytes = val.trim().parse().unwrap_or(0);
        }
    }
    Some((read_bytes, write_bytes))
}

#[tauri::command]
pub async fn get_processes(prev_proc: tauri::State<'_, Mutex<Option<ProcSnapshot>>>) -> Result<Vec<Process>, String> {
    let pids = list_proc_pid();

    let (cpu_results, disk_speed_results) = calculate_cpu_percentage(&prev_proc, &pids);

    let uid_map = build_uid_map();

    let mut processes = Vec::with_capacity(pids.len());
    for pid in &pids {
        let (name, ppid, user) = match read_proc_status_file(pid, &uid_map) {
            Some(info) => info,
            None => continue,
        };

        let state = get_proc_state(pid).unwrap_or_else(|| "N/A".to_string());
        let memory = get_proc_mem(pid).unwrap_or_else(|| "N/A".to_string());

        let pid_i32 = pid.parse::<i32>().unwrap_or_default();

        let cpu_usage = cpu_results.get(&pid_i32).map(|u| format!("{:.2}", u));

        let (read_disk_usage, write_disk_usage) = {
            let io_path = format!("/proc/{}/io", pid);
            if let Ok(io_content) = fs::read_to_string(&io_path) {
                let mut read_bytes: u64 = 0;
                let mut write_bytes: u64 = 0;
                for line in io_content.lines() {
                    if let Some(val) = line.strip_prefix("read_bytes: ") {
                        read_bytes = val.trim().parse().unwrap_or(0);
                    } else if let Some(val) = line.strip_prefix("write_bytes: ") {
                        write_bytes = val.trim().parse().unwrap_or(0);
                    }
                }
                (format_bytes(read_bytes as f64), format_bytes(write_bytes as f64))
            } else {
                ("N/A".to_string(), "N/A".to_string())
            }
        };

        let (read_disk_speed, write_disk_speed) = if let Some(entry) = disk_speed_results.get(&pid_i32) {
            (Some(entry.read_speed.clone()), Some(entry.write_speed.clone()))
        } else {
            (None, None)
        };

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

    Ok(processes)
}

#[tauri::command]
pub fn kill_process(process: Process) -> Result<(), String> {
    let pid_str = process.pid;
    let _pid: u32 = pid_str.parse().map_err(|_| format!("Invalid PID: {}", pid_str))?;

    let output = std::process::Command::new("kill")
        .arg(&pid_str)
        .output()
        .map_err(|e| format!("Failed to execute kill: {}", e))?;

    if output.status.success() {
        Ok(())
    } else {
        Err(format!("Failed to kill process with PID {}", pid_str))
    }
}
