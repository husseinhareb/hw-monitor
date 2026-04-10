use hw_monitor::config;
use std::io::Write;

// ── ConfigData defaults ────────────────────────────────────────────────

#[test]
fn config_default_values() {
    let cfg = config::ConfigData::default();
    assert_eq!(cfg.processes_update_time, 2000);
    assert_eq!(cfg.performance_update_time, 1000);
    assert_eq!(cfg.sensors_update_time, 2000);
    assert_eq!(cfg.disks_update_time, 5000);
    assert_eq!(cfg.language, "en");
    assert!(!cfg.show_virtual_interfaces);
}

#[test]
fn config_default_colors() {
    let cfg = config::ConfigData::default();
    assert_eq!(cfg.processes_body_background_color, "#2d2d2d");
    assert_eq!(cfg.processes_body_color, "#ffffff");
    assert_eq!(cfg.processes_head_background_color, "#252526");
    assert_eq!(cfg.navbar_background_color, "#222222");
    assert_eq!(cfg.heatbar_color_one, "#00FF00");
    assert_eq!(cfg.heatbar_color_ten, "#FF0000");
}

#[test]
fn config_default_table_values() {
    let cfg = config::ConfigData::default();
    assert_eq!(cfg.processes_table_values, vec![
        "user", "pid", "ppid", "name", "state", "cpu_usage", "memory"
    ]);
}

// ── ConfigData round-trip (write + read) ───────────────────────────────

#[test]
fn config_write_and_read_roundtrip() {
    let cfg = config::ConfigData::default();
    let dir = std::env::temp_dir().join(format!("hw_monitor_test_{}", std::process::id()));
    std::fs::create_dir_all(&dir).unwrap();
    let file_path = dir.join("test.conf");

    // Write
    {
        let mut file = std::fs::File::create(&file_path).unwrap();
        cfg.write_to(&mut file).unwrap();
        file.flush().unwrap();
    }

    // Read back by parsing key=value lines
    let content = std::fs::read_to_string(&file_path).unwrap();
    let mut cfg2 = config::ConfigData::default();
    for line in content.lines() {
        let trimmed = line.trim();
        if trimmed.is_empty() || trimmed.starts_with('#') {
            continue;
        }
        if let Some((key, value)) = trimmed.split_once('=') {
            cfg2.apply_kv(key.trim(), value.trim()).unwrap();
        }
    }

    // Verify key fields survived the round-trip
    assert_eq!(cfg2.processes_update_time, cfg.processes_update_time);
    assert_eq!(cfg2.language, cfg.language);
    assert_eq!(cfg2.show_virtual_interfaces, cfg.show_virtual_interfaces);
    assert_eq!(cfg2.heatbar_color_one, cfg.heatbar_color_one);
    assert_eq!(cfg2.processes_table_values, cfg.processes_table_values);
    assert_eq!(cfg2.navbar_background_color, cfg.navbar_background_color);
    assert_eq!(cfg2.performance_graph_color, cfg.performance_graph_color);

    // Cleanup
    std::fs::remove_dir_all(&dir).ok();
}

// ── apply_kv ───────────────────────────────────────────────────────────

#[test]
fn apply_kv_string_field() {
    let mut cfg = config::ConfigData::default();
    let applied = cfg.apply_kv("language", "fr").unwrap();
    assert!(applied);
    assert_eq!(cfg.language, "fr");
}

#[test]
fn apply_kv_u32_field() {
    let mut cfg = config::ConfigData::default();
    let applied = cfg.apply_kv("processes_update_time", "5000").unwrap();
    assert!(applied);
    assert_eq!(cfg.processes_update_time, 5000);
}

#[test]
fn apply_kv_bool_field_true() {
    let mut cfg = config::ConfigData::default();
    let applied = cfg.apply_kv("show_virtual_interfaces", "true").unwrap();
    assert!(applied);
    assert!(cfg.show_virtual_interfaces);
}

#[test]
fn apply_kv_bool_field_false() {
    let mut cfg = config::ConfigData::default();
    cfg.show_virtual_interfaces = true;
    let applied = cfg.apply_kv("show_virtual_interfaces", "false").unwrap();
    assert!(applied);
    assert!(!cfg.show_virtual_interfaces);
}

#[test]
fn apply_kv_vec_field() {
    let mut cfg = config::ConfigData::default();
    let applied = cfg.apply_kv("processes_table_values", "pid,name,cpu_usage").unwrap();
    assert!(applied);
    assert_eq!(cfg.processes_table_values, vec!["pid", "name", "cpu_usage"]);
}

#[test]
fn apply_kv_unknown_key() {
    let mut cfg = config::ConfigData::default();
    let applied = cfg.apply_kv("nonexistent_key", "value").unwrap();
    assert!(!applied);
}

#[test]
fn apply_kv_invalid_u32() {
    let mut cfg = config::ConfigData::default();
    let result = cfg.apply_kv("processes_update_time", "not_a_number");
    assert!(result.is_err());
}

#[test]
fn apply_kv_color_field() {
    let mut cfg = config::ConfigData::default();
    cfg.apply_kv("heatbar_color_one", "#FF00FF").unwrap();
    assert_eq!(cfg.heatbar_color_one, "#FF00FF");
}

// ── write_to format validation ─────────────────────────────────────────

#[test]
fn write_to_produces_key_value_lines() {
    let cfg = config::ConfigData::default();
    let dir = std::env::temp_dir().join(format!("hw_monitor_write_{}", std::process::id()));
    std::fs::create_dir_all(&dir).unwrap();
    let file_path = dir.join("format_test.conf");

    {
        let mut file = std::fs::File::create(&file_path).unwrap();
        cfg.write_to(&mut file).unwrap();
    }

    let content = std::fs::read_to_string(&file_path).unwrap();

    // Every non-empty line must contain '='
    for line in content.lines() {
        let trimmed = line.trim();
        if !trimmed.is_empty() {
            assert!(trimmed.contains('='), "Line missing '=': {}", trimmed);
        }
    }

    // Must contain key fields
    assert!(content.contains("processes_update_time=2000"));
    assert!(content.contains("language=en"));
    assert!(content.contains("show_virtual_interfaces=false"));
    assert!(content.contains("heatbar_color_one=#00FF00"));

    // Vec should be comma-separated
    assert!(content.contains("processes_table_values=user,pid,ppid,name,state,cpu_usage,memory"));

    std::fs::remove_dir_all(&dir).ok();
}

#[test]
fn config_modified_roundtrip() {
    let mut cfg = config::ConfigData::default();
    cfg.language = "de".to_string();
    cfg.processes_update_time = 3000;
    cfg.show_virtual_interfaces = true;
    cfg.heatbar_color_five = "#ABCDEF".to_string();
    cfg.processes_table_values = vec!["pid".into(), "name".into()];

    let dir = std::env::temp_dir().join(format!("hw_monitor_mod_{}", std::process::id()));
    std::fs::create_dir_all(&dir).unwrap();
    let file_path = dir.join("modified.conf");

    {
        let mut file = std::fs::File::create(&file_path).unwrap();
        cfg.write_to(&mut file).unwrap();
    }

    let content = std::fs::read_to_string(&file_path).unwrap();
    let mut cfg2 = config::ConfigData::default();
    for line in content.lines() {
        if let Some((k, v)) = line.split_once('=') {
            cfg2.apply_kv(k.trim(), v.trim()).unwrap();
        }
    }

    assert_eq!(cfg2.language, "de");
    assert_eq!(cfg2.processes_update_time, 3000);
    assert!(cfg2.show_virtual_interfaces);
    assert_eq!(cfg2.heatbar_color_five, "#ABCDEF");
    assert_eq!(cfg2.processes_table_values, vec!["pid", "name"]);

    std::fs::remove_dir_all(&dir).ok();
}

// ── All config keys are written ────────────────────────────────────────

#[test]
fn config_writes_all_expected_keys() {
    let cfg = config::ConfigData::default();
    let dir = std::env::temp_dir().join(format!("hw_monitor_keys_{}", std::process::id()));
    std::fs::create_dir_all(&dir).unwrap();
    let file_path = dir.join("keys.conf");

    {
        let mut file = std::fs::File::create(&file_path).unwrap();
        cfg.write_to(&mut file).unwrap();
    }

    let content = std::fs::read_to_string(&file_path).unwrap();

    let expected_keys = [
        "processes_update_time",
        "processes_body_background_color",
        "processes_body_color",
        "processes_head_background_color",
        "processes_head_color",
        "processes_table_values",
        "processes_border_color",
        "processes_tree_toggle_color",
        "processes_monitor_border_color",
        "performance_update_time",
        "performance_sidebar_background_color",
        "performance_sidebar_color",
        "performance_sidebar_selected_color",
        "performance_background_color",
        "performance_title_color",
        "performance_label_color",
        "performance_value_color",
        "performance_graph_color",
        "performance_sec_graph_color",
        "performance_scrollbar_color",
        "sensors_update_time",
        "sensors_background_color",
        "sensors_foreground_color",
        "sensors_boxes_background_color",
        "sensors_boxes_foreground_color",
        "sensors_battery_background_color",
        "sensors_battery_frame_color",
        "sensors_boxes_title_foreground_color",
        "sensors_battery_case_color",
        "disks_update_time",
        "disks_background_color",
        "disks_boxes_background_color",
        "disks_name_foreground_color",
        "disks_size_foreground_color",
        "disks_partition_background_color",
        "disks_partition_usage_background_color",
        "disks_partition_name_foreground_color",
        "disks_partition_type_foreground_color",
        "disks_partition_usage_foreground_color",
        "navbar_background_color",
        "navbar_buttons_background_color",
        "navbar_buttons_foreground_color",
        "navbar_search_background_color",
        "navbar_search_foreground_color",
        "heatbar_color_one",
        "heatbar_color_two",
        "heatbar_color_three",
        "heatbar_color_four",
        "heatbar_color_five",
        "heatbar_color_six",
        "heatbar_color_seven",
        "heatbar_color_eight",
        "heatbar_color_nine",
        "heatbar_color_ten",
        "heatbar_background_color",
        "config_background_color",
        "config_container_background_color",
        "config_input_background_color",
        "config_input_border_color",
        "config_button_background_color",
        "config_button_foreground_color",
        "config_text_color",
        "language",
        "show_virtual_interfaces",
    ];

    for key in &expected_keys {
        assert!(content.contains(&format!("{}=", key)), "Missing key in output: {}", key);
    }

    std::fs::remove_dir_all(&dir).ok();
}
