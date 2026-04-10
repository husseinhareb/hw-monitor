use serde::{Serialize, Deserialize};
use std::collections::HashMap;
use std::fs;
use std::io;
use std::sync::Mutex;
use std::time::Instant;

#[derive(Serialize, Deserialize, Debug)]
pub struct Process {
    pid: u32,
    name: Option<String>,
    ppid: Option<u32>,
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

fn read_proc_status_file(pid: &str, uid_map: &HashMap<u32, String>) -> Option<(String, String, String, String)> {
    let status = fs::read_to_string(format!("/proc/{}/status", pid)).ok()?;
    let mut name = None;
    let mut ppid = None;
    let mut user = None;
    let mut vm_rss_kb: Option<u64> = None;

    for line in status.lines() {
        if line.starts_with("Name:") {
            name = line.split_whitespace().nth(1).map(String::from);
        } else if line.starts_with("PPid:") {
            ppid = line.split_whitespace().nth(1).map(String::from);
        } else if line.starts_with("Uid:") {
            if let Some(uid_str) = line.split_whitespace().nth(1) {
                if let Ok(parsed_uid) = uid_str.parse::<u32>() {
                    user = Some(uid_map.get(&parsed_uid).cloned().unwrap_or_else(|| uid_str.to_string()));
                }
            }
        } else if line.starts_with("VmRSS:") {
            vm_rss_kb = line.split_whitespace().nth(1).and_then(|s| s.parse::<u64>().ok());
        }
        if name.is_some() && ppid.is_some() && user.is_some() && vm_rss_kb.is_some() {
            break;
        }
    }

    let mem_kb = vm_rss_kb.unwrap_or(0);
    let mem_str = if mem_kb > 1_024 * 1_024 {
        format!("{:.2} Gb", mem_kb as f64 / 1_024.0 / 1_024.0)
    } else if mem_kb > 1_024 {
        format!("{:.2} Mb", mem_kb as f64 / 1_024.0)
    } else {
        format!("{:.2} Kb", mem_kb)
    };

    Some((name?, ppid?, user?, mem_str))
}

/// Parse /proc/[pid]/stat ONCE and return (state, utime, stime).
fn parse_proc_stat(pid: &str) -> Option<(String, u64, u64)> {
    let content = fs::read_to_string(format!("/proc/{}/stat", pid)).ok()?;
    let after_comm = &content[content.rfind(')')? + 2..];
    let fields: Vec<&str> = after_comm.split_whitespace().collect();

    let state = fields.first().map(|s| match *s {
        "R" => "Running",
        "S" => "Sleeping",
        "D" => "Disk sleep",
        "Z" => "Zombie",
        "T" => "Stopped",
        "t" => "Tracing stop",
        "W" => "Paging",
        "X" | "x" => "Dead",
        "K" => "Wakekill",
        "P" => "Parked",
        "I" => "Idle",
        _ => "N/A",
    }.to_string())?;

    // fields[11] = utime, fields[12] = stime (0-indexed after state)
    let utime = fields.get(11).and_then(|s| s.parse::<u64>().ok()).unwrap_or(0);
    let stime = fields.get(12).and_then(|s| s.parse::<u64>().ok()).unwrap_or(0);

    Some((state, utime, stime))
}

pub fn format_bytes(bytes: f64) -> String {
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

pub fn format_bytes_per_sec(bytes: f64) -> String {
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

pub struct ProcSnapshot {
    pub total_cpu_time: u64,
    pub process_cpu_times: HashMap<i32, (u64, u64)>,
    pub process_io: HashMap<i32, (u64, u64)>,
    pub time: Instant,
}

/// Pre-parsed data from /proc/[pid]/stat — collected once per tick for each process.
struct ProcStatData {
    state: String,
    utime: u64,
    stime: u64,
}

fn calculate_cpu_percentage(
    prev: &Mutex<Option<ProcSnapshot>>,
    pids: &[String],
    stat_cache: &HashMap<i32, ProcStatData>,
) -> (HashMap<i32, f64>, HashMap<i32, DiskSpeedEntry>, HashMap<i32, (u64, u64)>) {
    let total_cpu_time_now = match get_total_cpu_time() {
        Ok(t) => t,
        Err(_) => return (HashMap::new(), HashMap::new(), HashMap::new()),
    };
    let now = Instant::now();

    // Build current CPU time map from the already-parsed stat_cache
    let mut cur_cpu: HashMap<i32, (u64, u64)> = HashMap::with_capacity(stat_cache.len());
    for (&pid, data) in stat_cache {
        cur_cpu.insert(pid, (data.utime, data.stime));
    }

    // Collect I/O (still requires its own file read — /proc/[pid]/io)
    let mut cur_io: HashMap<i32, (u64, u64)> = HashMap::with_capacity(pids.len());
    for pid_str in pids {
        if let Ok(pid) = pid_str.parse::<i32>() {
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
        process_io: cur_io.clone(),
        time: now,
    });

    (cpu_results, disk_results, cur_io)
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

    // Phase 1: Parse /proc/[pid]/stat ONCE per process → state + CPU times.
    let mut stat_cache: HashMap<i32, ProcStatData> = HashMap::with_capacity(pids.len());
    for pid_str in &pids {
        if let Ok(pid) = pid_str.parse::<i32>() {
            if let Some((state, utime, stime)) = parse_proc_stat(pid_str) {
                stat_cache.insert(pid, ProcStatData { state, utime, stime });
            }
        }
    }

    // Phase 2: Compute CPU% and disk speed deltas (reuses stat_cache, reads /proc/[pid]/io).
    let (cpu_results, disk_speed_results, cur_io) = calculate_cpu_percentage(&prev_proc, &pids, &stat_cache);

    // Phase 3: Read /proc/[pid]/status ONCE per process → name, ppid, user, memory (VmRSS).
    let uid_map = build_uid_map();

    let mut processes = Vec::with_capacity(pids.len());
    for pid in &pids {
        let pid_u32 = match pid.parse::<u32>() {
            Ok(v) => v,
            Err(_) => continue,
        };
        let pid_i32 = pid_u32 as i32;

        let (name, ppid, user, memory) = match read_proc_status_file(pid, &uid_map) {
            Some(info) => info,
            None => continue,
        };
        let ppid_u32: Option<u32> = ppid.parse().ok();

        let state = stat_cache.get(&pid_i32)
            .map(|s| s.state.clone())
            .unwrap_or_else(|| "N/A".to_string());

        let cpu_usage = cpu_results.get(&pid_i32).map(|u| format!("{:.2}", u));

        let (read_disk_usage, write_disk_usage) = if let Some(&(read_bytes, write_bytes)) = cur_io.get(&pid_i32) {
            (format_bytes(read_bytes as f64), format_bytes(write_bytes as f64))
        } else {
            ("N/A".to_string(), "N/A".to_string())
        };

        let (read_disk_speed, write_disk_speed) = if let Some(entry) = disk_speed_results.get(&pid_i32) {
            (Some(entry.read_speed.clone()), Some(entry.write_speed.clone()))
        } else {
            (None, None)
        };

        processes.push(Process {
            pid: pid_u32,
            name: Some(name),
            ppid: ppid_u32,
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
    if process.pid > i32::MAX as u32 {
        return Err(format!("Process ID {} out of valid range", process.pid));
    }
    let pid = process.pid as i32;
    let ret = unsafe { libc::kill(pid, libc::SIGTERM) };
    if ret == 0 {
        Ok(())
    } else {
        let err = std::io::Error::last_os_error();
        Err(format!("Failed to kill process with PID {}: {}", pid, err))
    }
}
