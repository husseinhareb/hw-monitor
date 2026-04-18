use hw_monitor::cpu;

#[test]
fn parse_static_fields_typical_cpuinfo() {
    let cpuinfo = "\
processor	: 0
vendor_id	: GenuineIntel
model name	: Intel(R) Core(TM) i7-10700K CPU @ 3.80GHz
cpu cores	: 8
siblings	: 16
flags		: fpu vme de pse tsc msr pae mce cx8 apic sep mtrr vmx avx
physical id	: 0

processor	: 1
vendor_id	: GenuineIntel
model name	: Intel(R) Core(TM) i7-10700K CPU @ 3.80GHz
cpu cores	: 8
siblings	: 16
flags		: fpu vme de pse tsc msr pae mce cx8 apic sep mtrr vmx avx
physical id	: 0
";
    let result = cpu::parse_static_fields(cpuinfo);
    assert!(result.is_some());
    let (name, cores, threads, virt, _vm, sockets) = result.unwrap();
    assert_eq!(name, "Intel(R) Core(TM) i7-10700K CPU @ 3.80GHz");
    assert_eq!(cores, "8");
    assert_eq!(threads, "16");
    assert_eq!(virt, "Enabled"); // vmx flag present
    assert_eq!(sockets, 1); // same physical id
}

#[test]
fn parse_static_fields_amd_svm() {
    let cpuinfo = "\
processor	: 0
model name	: AMD Ryzen 9 5900X
cpu cores	: 12
siblings	: 24
flags		: fpu vme de pse svm avx2
physical id	: 0
";
    let result = cpu::parse_static_fields(cpuinfo);
    assert!(result.is_some());
    let (name, cores, threads, virt, _vm, _sockets) = result.unwrap();
    assert_eq!(name, "AMD Ryzen 9 5900X");
    assert_eq!(cores, "12");
    assert_eq!(threads, "24");
    assert_eq!(virt, "Enabled"); // svm flag
}

#[test]
fn parse_static_fields_no_virtualization() {
    let cpuinfo = "\
processor	: 0
model name	: Some CPU
cpu cores	: 4
siblings	: 4
flags		: fpu vme de pse tsc msr pae mce
physical id	: 0
";
    let result = cpu::parse_static_fields(cpuinfo);
    assert!(result.is_some());
    let (_name, _cores, _threads, virt, _vm, _sockets) = result.unwrap();
    assert_eq!(virt, "Disabled");
}

#[test]
fn parse_static_fields_multi_socket() {
    let cpuinfo = "\
processor	: 0
model name	: Intel Xeon E5-2680 v4
cpu cores	: 14
siblings	: 28
flags		: fpu vmx avx
physical id	: 0

processor	: 14
model name	: Intel Xeon E5-2680 v4
cpu cores	: 14
siblings	: 28
flags		: fpu vmx avx
physical id	: 1
";
    let result = cpu::parse_static_fields(cpuinfo);
    assert!(result.is_some());
    let (_name, _cores, _threads, _virt, _vm, sockets) = result.unwrap();
    assert_eq!(sockets, 2);
}

#[test]
fn parse_static_fields_missing_model_name_returns_none() {
    let cpuinfo = "\
processor	: 0
cpu cores	: 4
siblings	: 8
flags		: fpu vmx
physical id	: 0
";
    assert!(cpu::parse_static_fields(cpuinfo).is_none());
}

#[test]
fn parse_static_fields_missing_cores_returns_none() {
    let cpuinfo = "\
processor	: 0
model name	: Test CPU
siblings	: 8
flags		: fpu vmx
physical id	: 0
";
    assert!(cpu::parse_static_fields(cpuinfo).is_none());
}

#[test]
fn parse_static_fields_missing_siblings_returns_none() {
    let cpuinfo = "\
processor	: 0
model name	: Test CPU
cpu cores	: 4
flags		: fpu vmx
physical id	: 0
";
    assert!(cpu::parse_static_fields(cpuinfo).is_none());
}

#[test]
fn parse_static_fields_empty_input() {
    assert!(cpu::parse_static_fields("").is_none());
}

#[test]
fn parse_static_fields_no_physical_id_defaults_to_1_socket() {
    let cpuinfo = "\
processor	: 0
model name	: Test CPU
cpu cores	: 2
siblings	: 4
flags		: fpu
";
    let result = cpu::parse_static_fields(cpuinfo);
    assert!(result.is_some());
    let (_name, _cores, _threads, _virt, _vm, sockets) = result.unwrap();
    assert_eq!(sockets, 1); // max(0, 1) = 1
}

// ── uptime_to_hms ──────────────────────────────────────────────────────

#[test]
fn uptime_to_hms_zero() {
    assert_eq!(cpu::uptime_to_hms(0.0), "00:00:00");
}

#[test]
fn uptime_to_hms_one_hour() {
    assert_eq!(cpu::uptime_to_hms(3600.0), "01:00:00");
}

#[test]
fn uptime_to_hms_mixed() {
    // 2h 30m 45s = 2*3600 + 30*60 + 45 = 9045
    assert_eq!(cpu::uptime_to_hms(9045.0), "02:30:45");
}

#[test]
fn uptime_to_hms_large_value() {
    // 100 hours = 360000 seconds
    assert_eq!(cpu::uptime_to_hms(360000.0), "100:00:00");
}

#[test]
fn uptime_to_hms_fractional_seconds() {
    // 1h 1m 1.9s
    assert_eq!(cpu::uptime_to_hms(3661.9), "01:01:01");
}

#[test]
fn uptime_to_hms_just_seconds() {
    assert_eq!(cpu::uptime_to_hms(59.0), "00:00:59");
}

#[test]
fn uptime_to_hms_just_minutes() {
    assert_eq!(cpu::uptime_to_hms(300.0), "00:05:00");
}
