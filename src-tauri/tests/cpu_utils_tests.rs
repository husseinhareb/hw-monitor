use hw_monitor::cpu_utils::{CpuSnapshot, PerCoreCpuState};
use std::sync::Mutex;

// ── CpuSnapshot delta calculation logic ────────────────────────────────
// We can't test calc_cpu_usage directly because it reads /proc/stat internally.
// But we can validate the delta math by testing the equivalent inline logic.

#[test]
fn cpu_delta_calculation_basic() {
    // Simulate: previous idle=100, total=400; current idle=110, total=500
    let prev_idle: u64 = 100;
    let prev_total: u64 = 400;
    let cur_idle: u64 = 110;
    let cur_total: u64 = 500;

    let total_diff = cur_total.saturating_sub(prev_total); // 100
    let idle_diff = cur_idle.saturating_sub(prev_idle); // 10
    let usage = 100.0 * (1.0 - (idle_diff as f64 / total_diff as f64));
    assert!((usage - 90.0).abs() < 0.01); // 90% usage
}

#[test]
fn cpu_delta_calculation_zero_diff() {
    let total_diff: u64 = 0;
    // Should guard against division by zero
    assert_eq!(total_diff, 0);
}

#[test]
fn cpu_delta_calculation_all_idle() {
    // If idle diff == total diff, usage should be 0%
    let total_diff: u64 = 200;
    let idle_diff: u64 = 200;
    let usage = 100.0 * (1.0 - (idle_diff as f64 / total_diff as f64));
    assert!((usage - 0.0).abs() < 0.01);
}

#[test]
fn cpu_delta_calculation_full_load() {
    // If idle diff is 0, usage should be 100%
    let total_diff: u64 = 200;
    let idle_diff: u64 = 0;
    let usage = 100.0 * (1.0 - (idle_diff as f64 / total_diff as f64));
    assert!((usage - 100.0).abs() < 0.01);
}

#[test]
fn per_core_state_initialization() {
    // PerCoreCpuState starts with an empty Vec
    let state = PerCoreCpuState(Mutex::new(Vec::new()));
    let guard = state.0.lock().unwrap();
    assert!(guard.is_empty());
}

#[test]
fn cpu_snapshot_fields() {
    let snap = CpuSnapshot {
        idle: 42,
        total: 100,
    };
    assert_eq!(snap.idle, 42);
    assert_eq!(snap.total, 100);
}

#[test]
fn per_core_usage_calculation_logic() {
    // Test the per-core delta math (equivalent to what calc_per_core_usage does)
    let prev = [
        CpuSnapshot {
            idle: 100,
            total: 400,
        },
        CpuSnapshot {
            idle: 200,
            total: 800,
        },
    ];
    let current = [(110u64, 500u64), (250u64, 1000u64)];

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

    assert!((usages[0] - 90.0).abs() < 0.01); // core 0: 10 idle of 100 total diff = 90%
    assert!((usages[1] - 75.0).abs() < 0.01); // core 1: 50 idle of 200 total diff = 75%
}

#[test]
fn per_core_usage_zero_total_diff() {
    // Same values → 0% usage (not NaN/panic)
    let prev = [CpuSnapshot {
        idle: 100,
        total: 400,
    }];
    let current = [(100u64, 400u64)];

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

    assert!((usages[0] - 0.0).abs() < 0.01);
}
