use hw_monitor::system_info;

#[test]
fn parse_os_release_extracts_standard_keys() {
    let content = r#"NAME="Ubuntu"
VERSION="22.04.3 LTS (Jammy Jellyfish)"
ID=ubuntu
ID_LIKE=debian
PRETTY_NAME="Ubuntu 22.04.3 LTS"
VERSION_ID="22.04"
VERSION_CODENAME=jammy
UBUNTU_CODENAME=jammy
HOME_URL="https://www.ubuntu.com/"
"#;
    let info = system_info::parse_os_release(content);
    assert_eq!(info.get("NAME").map(String::as_str), Some("Ubuntu"));
    assert_eq!(
        info.get("VERSION").map(String::as_str),
        Some("22.04.3 LTS (Jammy Jellyfish)")
    );
    assert_eq!(info.get("ID").map(String::as_str), Some("ubuntu"));
    assert_eq!(
        info.get("PRETTY_NAME").map(String::as_str),
        Some("Ubuntu 22.04.3 LTS")
    );
    assert_eq!(info.get("VERSION_ID").map(String::as_str), Some("22.04"));
    assert_eq!(
        info.get("VERSION_CODENAME").map(String::as_str),
        Some("jammy")
    );
}

#[test]
fn parse_os_release_handles_empty_and_comments() {
    let content = r#"
# This is a comment
NAME=Fedora

VERSION="39 (Workstation Edition)"
"#;
    let info = system_info::parse_os_release(content);
    assert_eq!(info.get("NAME").map(String::as_str), Some("Fedora"));
    assert_eq!(info.len(), 2);
}

#[test]
fn chassis_type_label_known_codes() {
    assert_eq!(system_info::chassis_type_label(3), "Desktop");
    assert_eq!(system_info::chassis_type_label(9), "Laptop");
    assert_eq!(system_info::chassis_type_label(10), "Notebook");
    assert_eq!(system_info::chassis_type_label(17), "Main Server Chassis");
    assert_eq!(system_info::chassis_type_label(23), "Rack Mount Chassis");
    assert_eq!(system_info::chassis_type_label(28), "Blade");
    assert_eq!(system_info::chassis_type_label(30), "Tablet");
    assert_eq!(system_info::chassis_type_label(31), "Convertible");
    assert_eq!(system_info::chassis_type_label(35), "Mini PC");
}

#[test]
fn chassis_type_label_unknown_codes() {
    assert_eq!(system_info::chassis_type_label(1), "Other");
    assert_eq!(system_info::chassis_type_label(2), "Unknown");
    assert_eq!(system_info::chassis_type_label(0), "Unknown");
    assert_eq!(system_info::chassis_type_label(255), "Unknown");
}
