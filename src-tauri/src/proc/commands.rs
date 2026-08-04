use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs;
use std::io;
use std::os::fd::{AsRawFd, FromRawFd, OwnedFd};
use std::sync::Mutex;
use std::time::Instant;

#[derive(Serialize, Deserialize, Debug, Default)]
pub struct Process {
    pid: u32,
    start_time: u64,
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
    nice: Option<i32>,
}

#[derive(Serialize, Deserialize, Debug, Default)]
pub struct ProcessAffinity {
    available_cpus: Vec<usize>,
    allowed_cpus: Vec<usize>,
}

/// Scheduling priority bounds accepted by `setpriority(2)`; -20 is the most
/// favourable to the process and 19 the least.
const NICE_MIN: i32 = -20;
const NICE_MAX: i32 = 19;

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

pub fn build_uid_map() -> HashMap<u32, String> {
    let mut map = HashMap::new();
    if let Ok(passwd_content) = fs::read_to_string("/etc/passwd") {
        for line in passwd_content.lines() {
            let fields: Vec<&str> = line.split(':').collect();
            if let (Some(name), Some(uid_str)) = (fields.first(), fields.get(2)) {
                if let Ok(uid) = uid_str.parse::<u32>() {
                    map.insert(uid, name.to_string());
                }
            }
        }
    }
    map
}

fn read_proc_status_file(
    pid: &str,
    uid_map: &HashMap<u32, String>,
) -> Option<(String, String, String, String)> {
    let status = fs::read_to_string(format!("/proc/{pid}/status")).ok()?;
    parse_proc_status_content(&status, uid_map)
}

fn parse_proc_status_content(
    status: &str,
    uid_map: &HashMap<u32, String>,
) -> Option<(String, String, String, String)> {
    let mut name = None;
    let mut ppid = None;
    let mut user = None;
    let mut vm_rss_kb: Option<u64> = None;

    for line in status.lines() {
        if let Some(value) = line.strip_prefix("Name:") {
            let value = value.trim();
            if !value.is_empty() {
                name = Some(value.to_string());
            }
        } else if let Some(value) = line.strip_prefix("PPid:") {
            ppid = value.split_whitespace().next().map(String::from);
        } else if let Some(value) = line.strip_prefix("Uid:") {
            if let Some(uid_str) = value.split_whitespace().next() {
                if let Ok(parsed_uid) = uid_str.parse::<u32>() {
                    user = Some(
                        uid_map
                            .get(&parsed_uid)
                            .cloned()
                            .unwrap_or_else(|| uid_str.to_string()),
                    );
                }
            }
        } else if let Some(value) = line.strip_prefix("VmRSS:") {
            vm_rss_kb = value
                .split_whitespace()
                .next()
                .and_then(|value| value.parse::<u64>().ok());
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

/// Parse /proc/[pid]/stat and return (state, utime, stime, nice, starttime).
fn parse_proc_stat_content(content: &str) -> Option<(String, u64, u64, i32, u64)> {
    let after_comm = &content[content.rfind(')')? + 2..];
    let fields: Vec<&str> = after_comm.split_whitespace().collect();

    let state = fields.first().map(|s| {
        match *s {
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
        }
        .to_string()
    })?;

    // fields[11] = utime, fields[12] = stime, fields[16] = nice (0-indexed after state)
    let utime = fields
        .get(11)
        .and_then(|s| s.parse::<u64>().ok())
        .unwrap_or(0);
    let stime = fields
        .get(12)
        .and_then(|s| s.parse::<u64>().ok())
        .unwrap_or(0);
    let nice = fields
        .get(16)
        .and_then(|s| s.parse::<i32>().ok())
        .unwrap_or(0);
    let start_time = fields.get(19)?.parse::<u64>().ok()?;

    Some((state, utime, stime, nice, start_time))
}

fn parse_proc_stat(pid: &str) -> Option<(String, u64, u64, i32, u64)> {
    let content = fs::read_to_string(format!("/proc/{pid}/stat")).ok()?;
    parse_proc_stat_content(&content)
}

fn get_process_start_time(pid: &str) -> Option<u64> {
    parse_proc_stat(pid).map(|stat| stat.4)
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
            let total_cpu_time: u64 = line
                .split_whitespace()
                .skip(1)
                .filter_map(|x| x.parse::<u64>().ok())
                .sum();
            return Ok(total_cpu_time);
        }
    }
    Err(io::Error::new(
        io::ErrorKind::NotFound,
        "Total CPU time not found in /proc/stat",
    ))
}

pub struct ProcSnapshot {
    pub total_cpu_time: u64,
    pub process_cpu_times: HashMap<i32, (u64, u64)>,
    pub process_io: HashMap<i32, (u64, u64)>,
    pub time: Instant,
}

/// Pre-parsed data from /proc/[pid]/stat, collected once per tick for each process.
struct ProcStatData {
    state: String,
    utime: u64,
    stime: u64,
    nice: i32,
    start_time: u64,
}

type CpuUsageMap = HashMap<i32, f64>;
type DiskSpeedMap = HashMap<i32, DiskSpeedEntry>;
type ProcessIoMap = HashMap<i32, (u64, u64)>;

fn calculate_cpu_percentage(
    prev: &Mutex<Option<ProcSnapshot>>,
    pids: &[String],
    stat_cache: &HashMap<i32, ProcStatData>,
) -> (CpuUsageMap, DiskSpeedMap, ProcessIoMap) {
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

    // Collect I/O (still requires its own file read: /proc/[pid]/io)
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
                    let cpu_time_diff =
                        (utime + stime).saturating_sub(prev_utime + prev_stime) as f64;
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
                    disk_results.insert(
                        pid,
                        DiskSpeedEntry {
                            read_speed: format_bytes_per_sec(delta_read),
                            write_speed: format_bytes_per_sec(delta_write),
                        },
                    );
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
pub async fn get_processes(
    prev_proc: tauri::State<'_, Mutex<Option<ProcSnapshot>>>,
) -> Result<Vec<Process>, String> {
    let pids = list_proc_pid();

    // Phase 1: Parse /proc/[pid]/stat ONCE per process → state + CPU times.
    let mut stat_cache: HashMap<i32, ProcStatData> = HashMap::with_capacity(pids.len());
    for pid_str in &pids {
        if let Ok(pid) = pid_str.parse::<i32>() {
            if let Some((state, utime, stime, nice, start_time)) = parse_proc_stat(pid_str) {
                stat_cache.insert(
                    pid,
                    ProcStatData {
                        state,
                        utime,
                        stime,
                        nice,
                        start_time,
                    },
                );
            }
        }
    }

    // Phase 2: Compute CPU% and disk speed deltas (reuses stat_cache, reads /proc/[pid]/io).
    let (cpu_results, disk_speed_results, cur_io) =
        calculate_cpu_percentage(&prev_proc, &pids, &stat_cache);

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
        let Some(stat_data) = stat_cache.get(&pid_i32) else {
            continue;
        };
        if get_process_start_time(pid) != Some(stat_data.start_time) {
            continue;
        }
        let ppid_u32: Option<u32> = ppid.parse().ok();

        let state = stat_data.state.clone();

        let cpu_usage = cpu_results.get(&pid_i32).map(|u| format!("{:.2}", u));

        let (read_disk_usage, write_disk_usage) =
            if let Some(&(read_bytes, write_bytes)) = cur_io.get(&pid_i32) {
                (
                    format_bytes(read_bytes as f64),
                    format_bytes(write_bytes as f64),
                )
            } else {
                ("N/A".to_string(), "N/A".to_string())
            };

        let (read_disk_speed, write_disk_speed) =
            if let Some(entry) = disk_speed_results.get(&pid_i32) {
                (
                    Some(entry.read_speed.clone()),
                    Some(entry.write_speed.clone()),
                )
            } else {
                (None, None)
            };

        processes.push(Process {
            pid: pid_u32,
            start_time: stat_data.start_time,
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
            nice: Some(stat_data.nice),
        });
    }

    Ok(processes)
}

fn pidfd_open(pid: i32) -> io::Result<OwnedFd> {
    let raw_fd = unsafe { libc::syscall(libc::SYS_pidfd_open, pid, 0) };
    if raw_fd < 0 {
        Err(io::Error::last_os_error())
    } else {
        Ok(unsafe { OwnedFd::from_raw_fd(raw_fd as i32) })
    }
}

fn pidfd_send_signal(pidfd: &OwnedFd, signal: i32) -> io::Result<()> {
    let result = unsafe {
        libc::syscall(
            libc::SYS_pidfd_send_signal,
            pidfd.as_raw_fd(),
            signal,
            std::ptr::null::<libc::siginfo_t>(),
            0,
        )
    };
    if result < 0 {
        Err(io::Error::last_os_error())
    } else {
        Ok(())
    }
}

/// Bounds-checks a PID before it is handed to the kernel, without inspecting
/// the process itself.
fn checked_pid(process: &Process) -> Result<i32, String> {
    if process.pid == 0 || process.pid > i32::MAX as u32 {
        return Err(format!("Process ID {} out of valid range", process.pid));
    }
    Ok(process.pid as i32)
}

/// Confirms that `pid` still refers to the same process the frontend listed,
/// by comparing the kernel's start time against the one captured in the
/// snapshot. This is what stops a PID recycled between the poll and the user's
/// click from being acted on by mistake.
fn verify_identity(process: &Process, pid: i32) -> Result<(), String> {
    let current_start_time = get_process_start_time(&process.pid.to_string())
        .ok_or_else(|| format!("Process with PID {pid} no longer exists"))?;
    if current_start_time != process.start_time {
        return Err(format!(
            "Process with PID {pid} has changed; refusing to act on it"
        ));
    }
    Ok(())
}

/// Bounds-check and identity-check in one step, for commands that address a
/// PID directly rather than through a pidfd.
fn validate_identity(process: &Process) -> Result<i32, String> {
    let pid = checked_pid(process)?;
    verify_identity(process, pid)?;
    Ok(pid)
}

/// Parses a Linux CPU list such as `0-3,8,10-11` into sorted, deduplicated
/// CPU indices. This is the format used by both `/sys/devices/system/cpu/online`
/// and the `Cpus_allowed_list` field of `/proc/[pid]/status`.
fn parse_cpu_list(list: &str) -> Vec<usize> {
    let mut cpus: Vec<usize> = Vec::new();

    for part in list.trim().split(',') {
        let part = part.trim();
        if part.is_empty() {
            continue;
        }

        match part.split_once('-') {
            Some((start, end)) => {
                if let (Ok(start), Ok(end)) =
                    (start.trim().parse::<usize>(), end.trim().parse::<usize>())
                {
                    if start <= end {
                        cpus.extend(start..=end);
                    }
                }
            }
            None => {
                if let Ok(cpu) = part.parse::<usize>() {
                    cpus.push(cpu);
                }
            }
        }
    }

    cpus.sort_unstable();
    cpus.dedup();
    cpus
}

/// Extracts the per-CPU ids from the `cpuN` lines of `/proc/stat`, skipping the
/// leading aggregate `cpu` line. Used as a fallback when
/// `/sys/devices/system/cpu/online` is unavailable.
fn parse_cpu_ids_from_stat(content: &str) -> Vec<usize> {
    let mut cpus: Vec<usize> = content
        .lines()
        .filter_map(|line| line.strip_prefix("cpu"))
        .filter_map(|rest| {
            let id: String = rest.chars().take_while(char::is_ascii_digit).collect();
            id.parse::<usize>().ok()
        })
        .collect();

    cpus.sort_unstable();
    cpus.dedup();
    cpus
}

/// The ids of every CPU currently online. Returned as explicit ids rather than
/// a count, because offline CPUs leave gaps and `0..count` would then address
/// the wrong cores.
fn online_cpus() -> Vec<usize> {
    if let Ok(content) = fs::read_to_string("/sys/devices/system/cpu/online") {
        let cpus = parse_cpu_list(&content);
        if !cpus.is_empty() {
            return cpus;
        }
    }

    fs::read_to_string("/proc/stat")
        .map(|content| parse_cpu_ids_from_stat(&content))
        .unwrap_or_default()
}

/// Reads the CPUs a process is currently allowed to run on from
/// `/proc/[pid]/status`, which exposes the affinity mask without any syscall.
fn parse_cpus_allowed_list(status: &str) -> Option<Vec<usize>> {
    status
        .lines()
        .find_map(|line| line.strip_prefix("Cpus_allowed_list:"))
        .map(parse_cpu_list)
}

fn read_allowed_cpus(pid: &str) -> Option<Vec<usize>> {
    let status = fs::read_to_string(format!("/proc/{pid}/status")).ok()?;
    parse_cpus_allowed_list(&status)
}

#[tauri::command]
pub fn kill_process(process: Process, force: bool) -> Result<(), String> {
    let pid = checked_pid(&process)?;
    // Pin the process identity *before* validating it: once the pidfd is open
    // it refers to this exact process, so a PID recycled after the check below
    // can never end up receiving the signal.
    let pidfd = pidfd_open(pid)
        .map_err(|error| format!("Failed to open process with PID {pid}: {error}"))?;
    verify_identity(&process, pid)?;

    let signal = if force { libc::SIGKILL } else { libc::SIGTERM };
    pidfd_send_signal(&pidfd, signal)
        .map_err(|error| format!("Failed to terminate process with PID {pid}: {error}"))
}

#[tauri::command]
pub fn set_process_priority(process: Process, niceness: i32) -> Result<(), String> {
    if !(NICE_MIN..=NICE_MAX).contains(&niceness) {
        return Err(format!(
            "Niceness {niceness} out of valid range ({NICE_MIN} to {NICE_MAX})"
        ));
    }
    let pid = validate_identity(&process)?;

    // SAFETY: `setpriority` takes only scalars, no pointers or buffers, so
    // there is nothing for the kernel to read out of bounds. `pid` is bounds
    // checked by `validate_identity` and `niceness` by the guard above.
    let result = unsafe { libc::setpriority(libc::PRIO_PROCESS, pid as libc::id_t, niceness) };
    if result == -1 {
        return Err(format!(
            "Failed to set priority for PID {pid}: {}",
            io::Error::last_os_error()
        ));
    }
    Ok(())
}

#[tauri::command]
pub fn get_process_affinity(process: Process) -> Result<ProcessAffinity, String> {
    let pid = validate_identity(&process)?;

    let available_cpus = online_cpus();
    if available_cpus.is_empty() {
        return Err("Could not determine which CPUs are online".to_string());
    }

    let allowed_cpus = read_allowed_cpus(&process.pid.to_string())
        .ok_or_else(|| format!("Could not read the CPU affinity of PID {pid}"))?;

    Ok(ProcessAffinity {
        available_cpus,
        allowed_cpus,
    })
}

#[tauri::command]
pub fn set_process_affinity(process: Process, cpus: Vec<usize>) -> Result<(), String> {
    let pid = validate_identity(&process)?;

    if cpus.is_empty() {
        return Err("At least one CPU must remain selected".to_string());
    }

    let available_cpus = online_cpus();
    if let Some(offline) = cpus.iter().find(|cpu| !available_cpus.contains(cpu)) {
        return Err(format!("CPU {offline} is not online"));
    }
    // `CPU_SET` indexes a fixed-width bitmask; anything at or beyond
    // `CPU_SETSIZE` would write past it. Online CPUs never reach that bound in
    // practice, but the check is what makes the `unsafe` block below sound.
    if let Some(out_of_range) = cpus.iter().find(|&&cpu| cpu >= libc::CPU_SETSIZE as usize) {
        return Err(format!(
            "CPU {out_of_range} exceeds the maximum addressable CPU index"
        ));
    }

    // SAFETY: `cpu_set_t` is a plain bitmask with no invalid bit patterns, so
    // an all-zero value is a valid (empty) set. Every index handed to `CPU_SET`
    // is bounds checked against `CPU_SETSIZE` above, and `sched_setaffinity`
    // receives the exact size of `set`, which lives until the call returns.
    let result = unsafe {
        let mut set: libc::cpu_set_t = std::mem::zeroed();
        for cpu in cpus {
            libc::CPU_SET(cpu, &mut set);
        }
        libc::sched_setaffinity(pid, std::mem::size_of::<libc::cpu_set_t>(), &set)
    };
    if result == -1 {
        return Err(format!(
            "Failed to set the CPU affinity of PID {pid}: {}",
            io::Error::last_os_error()
        ));
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::{
        get_process_affinity, kill_process, online_cpus, parse_cpu_ids_from_stat, parse_cpu_list,
        parse_cpus_allowed_list, parse_proc_stat, parse_proc_stat_content,
        parse_proc_status_content, set_process_affinity, set_process_priority, Process,
    };
    use std::collections::HashMap;

    /// Builds a `Process` that refers to the running test process itself.
    fn current_process() -> Process {
        let pid = std::process::id();
        let start_time = parse_proc_stat(&pid.to_string())
            .expect("test process must have a stat entry")
            .4;
        Process {
            pid,
            start_time,
            ..Process::default()
        }
    }

    /// Builds a `Process` whose start time no longer matches the running one,
    /// simulating a PID that was recycled after the frontend listed it.
    fn stale_process() -> Process {
        let process = current_process();
        Process {
            start_time: process.start_time.saturating_add(1),
            ..process
        }
    }

    #[test]
    fn proc_stat_parser_handles_parentheses_and_extracts_start_time() {
        let input =
            "1234 (worker (test) process) S 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 424242 20";
        let parsed = parse_proc_stat_content(input).expect("valid stat line");

        assert_eq!(parsed.0, "Sleeping");
        assert_eq!(parsed.1, 11);
        assert_eq!(parsed.2, 12);
        assert_eq!(parsed.3, 16);
        assert_eq!(parsed.4, 424242);
    }

    #[test]
    fn kill_rejects_a_stale_process_identity() {
        let error =
            kill_process(stale_process(), false).expect_err("stale identity must be refused");
        assert!(error.contains("has changed"));
    }

    #[test]
    fn force_kill_rejects_a_stale_process_identity() {
        let error =
            kill_process(stale_process(), true).expect_err("stale identity must be refused");
        assert!(error.contains("has changed"));
    }

    #[test]
    fn set_priority_rejects_niceness_above_the_maximum() {
        let error = set_process_priority(current_process(), 20)
            .expect_err("out-of-range niceness must be refused");
        assert!(error.contains("out of valid range"));
    }

    #[test]
    fn set_priority_rejects_niceness_below_the_minimum() {
        let error = set_process_priority(current_process(), -21)
            .expect_err("out-of-range niceness must be refused");
        assert!(error.contains("out of valid range"));
    }

    #[test]
    fn set_priority_rejects_a_stale_process_identity() {
        let error =
            set_process_priority(stale_process(), 0).expect_err("stale identity must be refused");
        assert!(error.contains("has changed"));
    }

    #[test]
    fn affinity_reports_online_and_allowed_cpus_for_the_current_process() {
        let affinity = get_process_affinity(current_process()).expect("affinity must be readable");

        assert!(!affinity.available_cpus.is_empty());
        assert!(!affinity.allowed_cpus.is_empty());
        // A process can only be allowed to run on CPUs that are actually online.
        for cpu in &affinity.allowed_cpus {
            assert!(
                affinity.available_cpus.contains(cpu),
                "allowed CPU {cpu} is not in the online set"
            );
        }
    }

    #[test]
    fn set_affinity_rejects_a_cpu_that_is_not_online() {
        let error = set_process_affinity(current_process(), vec![100_000])
            .expect_err("an offline CPU must be refused");
        assert!(error.contains("is not online"));
    }

    #[test]
    fn set_affinity_rejects_an_empty_selection() {
        let error = set_process_affinity(current_process(), vec![])
            .expect_err("empty selection must be refused");
        assert!(error.contains("At least one CPU"));
    }

    #[test]
    fn set_affinity_rejects_a_stale_process_identity() {
        let error = set_process_affinity(stale_process(), vec![0])
            .expect_err("stale identity must be refused");
        assert!(error.contains("has changed"));
    }

    #[test]
    fn cpu_list_parser_expands_ranges_and_singletons() {
        assert_eq!(parse_cpu_list("0-3,8,10-11"), vec![0, 1, 2, 3, 8, 10, 11]);
        assert_eq!(parse_cpu_list("0"), vec![0]);
        assert_eq!(parse_cpu_list("3-3"), vec![3]);
    }

    #[test]
    fn cpu_list_parser_sorts_deduplicates_and_ignores_malformed_input() {
        assert_eq!(parse_cpu_list("2,0,2,1\n"), vec![0, 1, 2]);
        // A reversed range describes nothing and must not panic or wrap around.
        assert_eq!(parse_cpu_list("5-2"), Vec::<usize>::new());
        assert_eq!(parse_cpu_list(""), Vec::<usize>::new());
        assert_eq!(parse_cpu_list("nonsense,,4"), vec![4]);
    }

    #[test]
    fn stat_cpu_id_parser_skips_the_aggregate_line() {
        let stat = "\
cpu  100 200 300
cpu0 1 2 3
cpu1 4 5 6
intr 999
";
        assert_eq!(parse_cpu_ids_from_stat(stat), vec![0, 1]);
    }

    #[test]
    fn cpus_allowed_parser_reads_the_affinity_mask_from_status() {
        let status = "\
Name:\tworker
Cpus_allowed:\tff
Cpus_allowed_list:\t0-3,6
";
        assert_eq!(
            parse_cpus_allowed_list(status).expect("field must be found"),
            vec![0, 1, 2, 3, 6]
        );
    }

    #[test]
    fn cpus_allowed_parser_reports_a_missing_field() {
        assert!(parse_cpus_allowed_list("Name:\tworker\n").is_none());
    }

    #[test]
    fn online_cpus_are_discovered_without_a_syscall() {
        assert!(
            !online_cpus().is_empty(),
            "every running system has at least one online CPU"
        );
    }

    #[test]
    fn proc_status_parser_preserves_spaces_in_process_names() {
        let status = "\
Name:\tworker process
PPid:\t1
Uid:\t1000\t1000\t1000\t1000
VmRSS:\t2048 kB
";
        let uid_map = HashMap::from([(1000, "alice".to_string())]);
        let parsed = parse_proc_status_content(status, &uid_map).expect("valid status");

        assert_eq!(parsed.0, "worker process");
        assert_eq!(parsed.1, "1");
        assert_eq!(parsed.2, "alice");
        assert_eq!(parsed.3, "2.00 Mb");
    }
}
