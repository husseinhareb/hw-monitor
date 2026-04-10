use hw_monitor::proc;

// ── format_bytes ───────────────────────────────────────────────────────

#[test]
fn format_bytes_zero() {
    assert_eq!(proc::format_bytes(0.0), "0.00 B");
}

#[test]
fn format_bytes_small() {
    assert_eq!(proc::format_bytes(512.0), "512.00 B");
}

#[test]
fn format_bytes_exactly_one_kb() {
    assert_eq!(proc::format_bytes(1024.0), "1024.00 B");
}

#[test]
fn format_bytes_above_one_kb() {
    // 1025 bytes > 1024 → Kb range
    assert_eq!(proc::format_bytes(1025.0), "1.00 Kb");
}

#[test]
fn format_bytes_kilobytes() {
    // 500 KB = 512000 bytes
    assert_eq!(proc::format_bytes(512000.0), "500.00 Kb");
}

#[test]
fn format_bytes_megabytes() {
    // 1 MB + a bit = 1048577 bytes (> 1024*1024)
    assert_eq!(proc::format_bytes(1048577.0), "1.00 Mb");
}

#[test]
fn format_bytes_large_megabytes() {
    // 500 MB = 524288000
    assert_eq!(proc::format_bytes(524288000.0), "500.00 Mb");
}

#[test]
fn format_bytes_gigabytes() {
    // 2 GB = 2147483648
    assert_eq!(proc::format_bytes(2147483648.0), "2.00 Gb");
}

#[test]
fn format_bytes_fractional() {
    // 1.5 KB = 1536 bytes
    assert_eq!(proc::format_bytes(1536.0), "1.50 Kb");
}

// ── format_bytes_per_sec ───────────────────────────────────────────────

#[test]
fn format_bytes_per_sec_zero() {
    assert_eq!(proc::format_bytes_per_sec(0.0), "0.00 B/s");
}

#[test]
fn format_bytes_per_sec_bytes() {
    assert_eq!(proc::format_bytes_per_sec(500.0), "500.00 B/s");
}

#[test]
fn format_bytes_per_sec_kilobytes() {
    // >= 1024 → Kb/s
    assert_eq!(proc::format_bytes_per_sec(1024.0), "1.00 Kb/s");
}

#[test]
fn format_bytes_per_sec_megabytes() {
    // 1 MB/s = 1048576
    assert_eq!(proc::format_bytes_per_sec(1048576.0), "1.00 Mb/s");
}

#[test]
fn format_bytes_per_sec_gigabytes() {
    // 1 GB/s = 1073741824
    assert_eq!(proc::format_bytes_per_sec(1073741824.0), "1.00 Gb/s");
}

#[test]
fn format_bytes_per_sec_fractional_kb() {
    // 1536 B/s = 1.50 Kb/s
    assert_eq!(proc::format_bytes_per_sec(1536.0), "1.50 Kb/s");
}

#[test]
fn format_bytes_per_sec_boundary_below_kb() {
    // < 1024 stays as B/s
    assert_eq!(proc::format_bytes_per_sec(1023.0), "1023.00 B/s");
}

#[test]
fn format_bytes_per_sec_large_value() {
    // 10 GB/s
    let ten_gb = 10.0 * 1024.0 * 1024.0 * 1024.0;
    assert_eq!(proc::format_bytes_per_sec(ten_gb), "10.00 Gb/s");
}
