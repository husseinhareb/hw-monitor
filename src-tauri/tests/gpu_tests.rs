use hw_monitor::gpu;

// ── add_memory_unit ────────────────────────────────────────────────────

#[test]
fn add_memory_unit_bytes() {
    // Less than 1 MB → raw "MB" (fallback: just shows the value as MB)
    assert_eq!(gpu::add_memory_unit(500), "500 MB");
}

#[test]
fn add_memory_unit_megabytes() {
    // 256 MB = 256 * 1024 * 1024 = 268435456
    assert_eq!(gpu::add_memory_unit(268435456), "256 MB");
}

#[test]
fn add_memory_unit_gigabytes() {
    // 4 GB = 4 * 1024 * 1024 * 1024 = 4294967296
    assert_eq!(gpu::add_memory_unit(4294967296), "4 GB");
}

#[test]
fn add_memory_unit_8gb() {
    // 8 GB
    let eight_gb: u64 = 8 * 1024 * 1024 * 1024;
    assert_eq!(gpu::add_memory_unit(eight_gb), "8 GB");
}

#[test]
fn add_memory_unit_zero() {
    assert_eq!(gpu::add_memory_unit(0), "0 MB");
}

#[test]
fn add_memory_unit_exactly_1gb() {
    let one_gb: u64 = 1024 * 1024 * 1024;
    assert_eq!(gpu::add_memory_unit(one_gb), "1 GB");
}

#[test]
fn add_memory_unit_exactly_1mb() {
    let one_mb: u64 = 1024 * 1024;
    assert_eq!(gpu::add_memory_unit(one_mb), "1 MB");
}

#[test]
fn add_memory_unit_12gb() {
    let twelve_gb: u64 = 12 * 1024 * 1024 * 1024;
    assert_eq!(gpu::add_memory_unit(twelve_gb), "12 GB");
}

// ── add_clock_speed_unit ───────────────────────────────────────────────

#[test]
fn add_clock_speed_mhz() {
    assert_eq!(gpu::add_clock_speed_unit(500), "500 MHz");
}

#[test]
fn add_clock_speed_ghz() {
    assert_eq!(gpu::add_clock_speed_unit(1500), "1.50 GHz");
}

#[test]
fn add_clock_speed_exactly_1ghz() {
    assert_eq!(gpu::add_clock_speed_unit(1000), "1.00 GHz");
}

#[test]
fn add_clock_speed_2100mhz() {
    assert_eq!(gpu::add_clock_speed_unit(2100), "2.10 GHz");
}

#[test]
fn add_clock_speed_zero() {
    assert_eq!(gpu::add_clock_speed_unit(0), "0 MHz");
}

#[test]
fn add_clock_speed_999mhz() {
    assert_eq!(gpu::add_clock_speed_unit(999), "999 MHz");
}

#[test]
fn add_clock_speed_high_value() {
    assert_eq!(gpu::add_clock_speed_unit(3000), "3.00 GHz");
}

// ── lookup_pci_name ────────────────────────────────────────────────────
// This function reads from /usr/share/misc/pci.ids or /usr/share/hwdata/pci.ids
// It may not be available in all environments, so we test it gracefully

#[test]
fn lookup_pci_name_nonexistent_vendor() {
    // A vendor that doesn't exist in pci.ids
    let result = gpu::lookup_pci_name("ffff", "ffff");
    assert!(result.is_none());
}
