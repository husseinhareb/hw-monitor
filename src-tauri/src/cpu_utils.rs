use std::fs;
use std::sync::Mutex;

pub struct CpuSnapshot {
    pub idle: u64,
    pub total: u64,
}

/// Separate state for the Performance CPU panel
pub struct PerfCpuState(pub Mutex<Option<CpuSnapshot>>);

/// Separate state for the Total Usages dashboard
pub struct TotalCpuState(pub Mutex<Option<CpuSnapshot>>);

pub fn read_cpu_times() -> Option<(u64, u64)> {
    let content = fs::read_to_string("/proc/stat").ok()?;
    let line = content.lines().find(|l| l.starts_with("cpu "))?;
    let fields: Vec<u64> = line.split_whitespace()
        .skip(1)
        .filter_map(|s| s.parse().ok())
        .collect();
    let idle = *fields.get(3)?;
    let total: u64 = fields.iter().sum();
    Some((idle, total))
}

pub fn calc_cpu_usage(prev: &Mutex<Option<CpuSnapshot>>) -> Option<f64> {
    let (idle2, total2) = read_cpu_times()?;

    let mut guard = prev.lock().ok()?;
    let result = if let Some(ref snap) = *guard {
        let total_diff = total2.saturating_sub(snap.total);
        let idle_diff = idle2.saturating_sub(snap.idle);
        if total_diff == 0 {
            None
        } else {
            Some(100.0 * (1.0 - (idle_diff as f64 / total_diff as f64)))
        }
    } else {
        None
    };
    *guard = Some(CpuSnapshot { idle: idle2, total: total2 });
    result
}
