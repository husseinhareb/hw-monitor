use std::fs;
use std::sync::Mutex;

pub struct CpuSnapshot {
    pub idle: u64,
    pub total: u64,
}

/// Per-core snapshots (one per logical CPU).
pub struct PerCoreCpuState(pub Mutex<Vec<CpuSnapshot>>);

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

/// Read per-core (idle, total) from /proc/stat lines "cpu0", "cpu1", etc.
pub fn read_per_core_times() -> Vec<(u64, u64)> {
    let content = match fs::read_to_string("/proc/stat") {
        Ok(c) => c,
        Err(_) => return Vec::new(),
    };
    let mut cores = Vec::new();
    for line in content.lines() {
        // Match "cpu0 ", "cpu1 ", ... but not the aggregate "cpu "
        if line.starts_with("cpu") && !line.starts_with("cpu ") {
            let fields: Vec<u64> = line
                .split_whitespace()
                .skip(1)
                .filter_map(|s| s.parse().ok())
                .collect();
            if let Some(&idle) = fields.get(3) {
                let total: u64 = fields.iter().sum();
                cores.push((idle, total));
            }
        }
    }
    cores
}

/// Calculate per-core CPU usage percentages.
pub fn calc_per_core_usage(state: &PerCoreCpuState) -> Option<Vec<f64>> {
    let current = read_per_core_times();
    if current.is_empty() {
        return None;
    }

    let mut guard = state.0.lock().ok()?;
    let prev = std::mem::replace(&mut *guard, Vec::new());

    let result = if prev.len() == current.len() {
        let usages: Vec<f64> = current
            .iter()
            .zip(prev.iter())
            .map(|(&(idle2, total2), prev_snap)| {
                let total_diff = total2.saturating_sub(prev_snap.total);
                let idle_diff = idle2.saturating_sub(prev_snap.idle);
                if total_diff == 0 {
                    0.0
                } else {
                    100.0 * (1.0 - (idle_diff as f64 / total_diff as f64))
                }
            })
            .collect();
        Some(usages)
    } else {
        None // First call or core count changed — need one tick to establish delta
    };

    *guard = current
        .into_iter()
        .map(|(idle, total)| CpuSnapshot { idle, total })
        .collect();

    result
}
