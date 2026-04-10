use hw_monitor::battery::sysfs::compute_time_estimates;

// ── compute_time_estimates ─────────────────────────────────────────────

#[test]
fn time_estimates_discharging_basic() {
    // 50 Wh remaining, 10 W draw → 5 hours = 300 min
    let (tte, ttf) = compute_time_estimates("Discharging", 50_000_000.0, 100_000_000.0, 10_000_000.0);
    assert_eq!(tte, Some(300));
    assert_eq!(ttf, None);
}

#[test]
fn time_estimates_charging_basic() {
    // 30 Wh current, 60 Wh full, 15 W power → 2 hours to full = 120 min
    let (tte, ttf) = compute_time_estimates("Charging", 30_000_000.0, 60_000_000.0, 15_000_000.0);
    assert_eq!(tte, None);
    assert_eq!(ttf, Some(120));
}

#[test]
fn time_estimates_full() {
    // Full battery, no power draw
    let (tte, ttf) = compute_time_estimates("Full", 50_000_000.0, 50_000_000.0, 0.0);
    assert_eq!(tte, None);
    assert_eq!(ttf, None);
}

#[test]
fn time_estimates_zero_power() {
    let (tte, ttf) = compute_time_estimates("Discharging", 50_000_000.0, 100_000_000.0, 0.0);
    assert_eq!(tte, None);
    assert_eq!(ttf, None);
}

#[test]
fn time_estimates_negative_power() {
    let (tte, ttf) = compute_time_estimates("Discharging", 50_000_000.0, 100_000_000.0, -5_000_000.0);
    assert_eq!(tte, None);
    assert_eq!(ttf, None);
}

#[test]
fn time_estimates_charging_already_full() {
    // energy == energy_full while charging → 0 remaining = None for ttf since energy_full <= energy
    let (tte, ttf) = compute_time_estimates("Charging", 60_000_000.0, 60_000_000.0, 10_000_000.0);
    assert_eq!(tte, None);
    assert_eq!(ttf, None); // energy_full is not > energy
}

#[test]
fn time_estimates_case_insensitive_charging() {
    let (tte, ttf) = compute_time_estimates("charging", 20_000_000.0, 60_000_000.0, 10_000_000.0);
    assert_eq!(tte, None);
    assert_eq!(ttf, Some(240)); // (60-20)/10 * 60 = 240 min
}

#[test]
fn time_estimates_case_insensitive_discharging() {
    let (tte, ttf) = compute_time_estimates("discharging", 30_000_000.0, 60_000_000.0, 10_000_000.0);
    assert_eq!(tte, Some(180)); // 30/10 * 60 = 180 min
    assert_eq!(ttf, None);
}

#[test]
fn time_estimates_unknown_state() {
    let (tte, ttf) = compute_time_estimates("Unknown", 50_000_000.0, 100_000_000.0, 10_000_000.0);
    assert_eq!(tte, None);
    assert_eq!(ttf, None);
}

#[test]
fn time_estimates_not_charging_state() {
    let (tte, ttf) = compute_time_estimates("Not charging", 50_000_000.0, 100_000_000.0, 10_000_000.0);
    assert_eq!(tte, None);
    assert_eq!(ttf, None);
}

#[test]
fn time_estimates_discharging_low_battery() {
    // 1 Wh remaining, 10 W → 6 min
    let (tte, _) = compute_time_estimates("Discharging", 1_000_000.0, 50_000_000.0, 10_000_000.0);
    assert_eq!(tte, Some(6));
}

#[test]
fn time_estimates_charging_near_full() {
    // 99 Wh, 100 Wh full, 50 W → 0.02h = ~1.2 min → rounds to 1
    let (_, ttf) = compute_time_estimates("Charging", 99_000_000.0, 100_000_000.0, 50_000_000.0);
    assert_eq!(ttf, Some(1));
}

#[test]
fn time_estimates_high_power_draw() {
    // 50 Wh, 100 W draw → 30 min
    let (tte, _) = compute_time_estimates("Discharging", 50_000_000.0, 100_000_000.0, 100_000_000.0);
    assert_eq!(tte, Some(30));
}
