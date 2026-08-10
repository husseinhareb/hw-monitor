use hw_monitor::total_usages;

#[test]
fn total_usage_struct_roundtrip() {
    let json = r#"{"memory":4500,"cpu":2300,"processes":312}"#;

    // Deserialize into the struct
    let parsed: total_usages::TotalUsage = serde_json::from_str(json).expect("deserialize");

    // Serialize back and compare — verifies Serialize + Deserialize impls
    let output = serde_json::to_string(&parsed).expect("serialize");
    let roundtripped: serde_json::Value = serde_json::from_str(&output).expect("parse output");

    assert_eq!(roundtripped["memory"], 4500);
    assert_eq!(roundtripped["cpu"], 2300);
    assert_eq!(roundtripped["processes"], 312);
}

#[test]
fn total_usage_with_nulls() {
    let json = r#"{"memory":null,"cpu":null,"processes":null}"#;
    let parsed: total_usages::TotalUsage = serde_json::from_str(json).expect("deserialize");

    let output = serde_json::to_string(&parsed).expect("serialize");
    let v: serde_json::Value = serde_json::from_str(&output).expect("parse");

    assert!(v["memory"].is_null());
    assert!(v["cpu"].is_null());
    assert!(v["processes"].is_null());
}

#[test]
fn total_usage_partial_fields() {
    // Backend may return partial data when some sources are unavailable
    let json = r#"{"memory":67,"cpu":null,"processes":280}"#;
    let parsed: total_usages::TotalUsage = serde_json::from_str(json).expect("deserialize");

    let output = serde_json::to_string(&parsed).expect("serialize");
    let v: serde_json::Value = serde_json::from_str(&output).expect("parse");

    assert_eq!(v["memory"], 67);
    assert!(v["cpu"].is_null());
    assert_eq!(v["processes"], 280);
}
