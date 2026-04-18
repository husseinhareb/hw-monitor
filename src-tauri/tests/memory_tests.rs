use hw_monitor::memory;

// ── parse_meminfo_line ─────────────────────────────────────────────────

#[test]
fn parse_meminfo_line_matching_keyword() {
    assert_eq!(
        memory::parse_meminfo_line("MemTotal:       16384000 kB", "MemTotal:"),
        Some(16384000)
    );
}

#[test]
fn parse_meminfo_line_non_matching_keyword() {
    assert_eq!(
        memory::parse_meminfo_line("MemFree:        8192000 kB", "MemTotal:"),
        None
    );
}

#[test]
fn parse_meminfo_line_empty_line() {
    assert_eq!(memory::parse_meminfo_line("", "MemTotal:"), None);
}

#[test]
fn parse_meminfo_line_mem_free() {
    assert_eq!(
        memory::parse_meminfo_line("MemFree:         2048000 kB", "MemFree:"),
        Some(2048000)
    );
}

#[test]
fn parse_meminfo_line_mem_available() {
    assert_eq!(
        memory::parse_meminfo_line("MemAvailable:   12000000 kB", "MemAvailable:"),
        Some(12000000)
    );
}

#[test]
fn parse_meminfo_line_cached() {
    assert_eq!(
        memory::parse_meminfo_line("Cached:          4096000 kB", "Cached:"),
        Some(4096000)
    );
}

#[test]
fn parse_meminfo_line_active() {
    assert_eq!(
        memory::parse_meminfo_line("Active:          6000000 kB", "Active:"),
        Some(6000000)
    );
}

#[test]
fn parse_meminfo_line_swap_total() {
    assert_eq!(
        memory::parse_meminfo_line("SwapTotal:       8388608 kB", "SwapTotal:"),
        Some(8388608)
    );
}

#[test]
fn parse_meminfo_line_swap_cached() {
    assert_eq!(
        memory::parse_meminfo_line("SwapCached:            0 kB", "SwapCached:"),
        Some(0)
    );
}

#[test]
fn parse_meminfo_line_invalid_value() {
    assert_eq!(
        memory::parse_meminfo_line("MemTotal:       notanumber kB", "MemTotal:"),
        None
    );
}

#[test]
fn parse_meminfo_line_similar_prefix_no_match() {
    // "Cached:" should not match "SwapCached:"
    assert_eq!(
        memory::parse_meminfo_line("SwapCached:     1000 kB", "Cached:"),
        None
    );
}

#[test]
fn parse_meminfo_line_large_value() {
    assert_eq!(
        memory::parse_meminfo_line("MemTotal:       65536000 kB", "MemTotal:"),
        Some(65536000)
    );
}

#[test]
fn parse_meminfo_line_zero_value() {
    assert_eq!(
        memory::parse_meminfo_line("SwapTotal:             0 kB", "SwapTotal:"),
        Some(0)
    );
}
