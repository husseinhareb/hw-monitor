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
    // 1025 bytes > 1024 → KB range
    assert_eq!(proc::format_bytes(1025.0), "1.00 KB");
}

#[test]
fn format_bytes_kilobytes() {
    // 500 KB = 512000 bytes
    assert_eq!(proc::format_bytes(512000.0), "500.00 KB");
}

#[test]
fn format_bytes_megabytes() {
    // 1 MB + a bit = 1048577 bytes (> 1024*1024)
    assert_eq!(proc::format_bytes(1048577.0), "1.00 MB");
}

#[test]
fn format_bytes_large_megabytes() {
    // 500 MB = 524288000
    assert_eq!(proc::format_bytes(524288000.0), "500.00 MB");
}

#[test]
fn format_bytes_gigabytes() {
    // 2 GB = 2147483648
    assert_eq!(proc::format_bytes(2147483648.0), "2.00 GB");
}

#[test]
fn format_bytes_fractional() {
    // 1.5 KB = 1536 bytes
    assert_eq!(proc::format_bytes(1536.0), "1.50 KB");
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
    // >= 1024 → KB/s
    assert_eq!(proc::format_bytes_per_sec(1024.0), "1.00 KB/s");
}

#[test]
fn format_bytes_per_sec_megabytes() {
    // 1 MB/s = 1048576
    assert_eq!(proc::format_bytes_per_sec(1048576.0), "1.00 MB/s");
}

#[test]
fn format_bytes_per_sec_gigabytes() {
    // 1 GB/s = 1073741824
    assert_eq!(proc::format_bytes_per_sec(1073741824.0), "1.00 GB/s");
}

#[test]
fn format_bytes_per_sec_fractional_kb() {
    // 1536 B/s = 1.50 KB/s
    assert_eq!(proc::format_bytes_per_sec(1536.0), "1.50 KB/s");
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
    assert_eq!(proc::format_bytes_per_sec(ten_gb), "10.00 GB/s");
}

// ── DRM fdinfo (per-process GPU) ───────────────────────────────────────

use hw_monitor::proc::drm;

const AMDGPU_FDINFO: &str = "pos:\t0\ndrm-driver:\tamdgpu\ndrm-client-id:\t8\ndrm-pdev:\t0000:03:00.0\ndrm-total-vram:\t232104 KiB\ndrm-resident-vram:\t232104 KiB\ndrm-resident-gtt:\t8204 KiB\ndrm-resident-cpu:\t0\ndrm-memory-vram:\t232104 KiB\ndrm-engine-gfx:\t1000000000 ns\ndrm-engine-compute:\t0 ns\n";

#[test]
fn drm_fdinfo_parses_amdgpu_client() {
    let (key, client) = drm::parse_drm_fdinfo(AMDGPU_FDINFO).unwrap();
    assert_eq!(key, "0000:03:00.0/8");
    assert_eq!(client.memory_bytes, 232104 * 1024);
    assert_eq!(client.engines["gfx"].busy, 1_000_000_000);
    assert_eq!(client.engines["gfx"].capacity, 1);
}

#[test]
fn drm_fdinfo_ignores_non_drm_fds() {
    assert!(drm::parse_drm_fdinfo("pos:\t0\nflags:\t02\nmnt_id:\t12\n").is_none());
}

#[test]
fn drm_fdinfo_without_vram_sums_resident_regions() {
    let (_, client) = drm::parse_drm_fdinfo(
        "drm-client-id:\t3\ndrm-resident-system0:\t2 MiB\ndrm-resident-stolen-system0:\t1 MiB\ndrm-resident-cpu:\t5 MiB\n",
    )
    .unwrap();
    assert_eq!(client.memory_bytes, 3 * 1024 * 1024);
}

#[test]
fn gpu_usage_is_busiest_engine_over_elapsed_time() {
    let (key, prev) = drm::parse_drm_fdinfo(AMDGPU_FDINFO).unwrap();
    let mut cur = prev.clone();
    cur.engines.get_mut("gfx").unwrap().busy += 250_000_000; // 0.25 s busy
    cur.engines.get_mut("compute").unwrap().busy += 100_000_000;
    let prev = drm::DrmClients::from([(key.clone(), prev)]);
    let cur = drm::DrmClients::from([(key, cur)]);
    let usage = drm::gpu_usage_percent(&prev, &cur, 1e9); // over 1 s
    assert!((usage - 25.0).abs() < 1e-9, "{usage}");
}

#[test]
fn gpu_usage_uses_cycles_when_reported() {
    let sample = |busy: u64, total: u64| {
        drm::parse_drm_fdinfo(&format!(
            "drm-client-id:\t1\ndrm-cycles-rcs:\t{busy}\ndrm-total-cycles-rcs:\t{total}\n"
        ))
        .unwrap()
    };
    let (key, prev) = sample(100, 1000);
    let (_, cur) = sample(600, 2000);
    let usage = drm::gpu_usage_percent(
        &drm::DrmClients::from([(key.clone(), prev)]),
        &drm::DrmClients::from([(key, cur)]),
        1e9,
    );
    assert!((usage - 50.0).abs() < 1e-9, "{usage}");
}
