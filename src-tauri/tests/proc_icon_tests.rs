use hw_monitor::proc_icon;

// ── exec_matches_process ───────────────────────────────────────────────

#[test]
fn exec_matches_exact_name() {
    let desktop = "\
[Desktop Entry]
Name=Firefox
Exec=firefox %u
Icon=firefox
Type=Application
";
    assert!(proc_icon::exec_matches_process(desktop, "firefox"));
}

#[test]
fn exec_matches_path_basename() {
    let desktop = "\
[Desktop Entry]
Name=Visual Studio Code
Exec=/usr/bin/code --unity-launch %F
Icon=code
";
    assert!(proc_icon::exec_matches_process(desktop, "code"));
}

#[test]
fn exec_no_match_different_name() {
    let desktop = "\
[Desktop Entry]
Exec=firefox %u
Icon=firefox
";
    assert!(!proc_icon::exec_matches_process(desktop, "chromium"));
}

#[test]
fn exec_matches_case_insensitive() {
    let desktop = "\
[Desktop Entry]
Exec=Firefox %u
";
    assert!(proc_icon::exec_matches_process(desktop, "firefox"));
}

#[test]
fn exec_ignores_non_desktop_entry_section() {
    let desktop = "\
[Desktop Entry]
Name=App
Exec=app-launcher
Icon=app

[Desktop Action NewWindow]
Exec=firefox --new-window
";
    // The Exec=firefox is in a different section, not [Desktop Entry]
    assert!(!proc_icon::exec_matches_process(desktop, "firefox"));
    assert!(proc_icon::exec_matches_process(desktop, "app-launcher"));
}

#[test]
fn exec_matches_empty_content() {
    assert!(!proc_icon::exec_matches_process("", "firefox"));
}

#[test]
fn exec_matches_no_exec_line() {
    let desktop = "\
[Desktop Entry]
Name=App
Icon=app
";
    assert!(!proc_icon::exec_matches_process(desktop, "app"));
}

#[test]
fn exec_matches_env_prefix_path() {
    let desktop = "\
[Desktop Entry]
Exec=/usr/lib/electron/electron --app=/path/to/code
";
    assert!(proc_icon::exec_matches_process(desktop, "electron"));
}

#[test]
fn exec_matches_flatpak_style_path() {
    let desktop = "\
[Desktop Entry]
Exec=/usr/bin/flatpak run org.mozilla.firefox
";
    assert!(proc_icon::exec_matches_process(desktop, "flatpak"));
    assert!(!proc_icon::exec_matches_process(desktop, "firefox"));
}

// ── extract_desktop_field ──────────────────────────────────────────────

#[test]
fn extract_field_icon() {
    let desktop = "\
[Desktop Entry]
Name=Firefox
Exec=firefox %u
Icon=firefox
Type=Application
";
    assert_eq!(
        proc_icon::extract_desktop_field(desktop, "Icon"),
        Some("firefox".into())
    );
}

#[test]
fn extract_field_name() {
    let desktop = "\
[Desktop Entry]
Name=Terminal Emulator
Exec=xterm
Icon=terminal
";
    assert_eq!(
        proc_icon::extract_desktop_field(desktop, "Name"),
        Some("Terminal Emulator".into())
    );
}

#[test]
fn extract_field_type() {
    let desktop = "\
[Desktop Entry]
Name=App
Type=Application
";
    assert_eq!(
        proc_icon::extract_desktop_field(desktop, "Type"),
        Some("Application".into())
    );
}

#[test]
fn extract_field_not_found() {
    let desktop = "\
[Desktop Entry]
Name=App
";
    assert_eq!(proc_icon::extract_desktop_field(desktop, "Icon"), None);
}

#[test]
fn extract_field_empty_value() {
    let desktop = "\
[Desktop Entry]
Icon=
Name=App
";
    // Empty value should return None
    assert_eq!(proc_icon::extract_desktop_field(desktop, "Icon"), None);
}

#[test]
fn extract_field_ignores_other_sections() {
    let desktop = "\
[Other Section]
Icon=wrong-icon

[Desktop Entry]
Icon=correct-icon
";
    assert_eq!(
        proc_icon::extract_desktop_field(desktop, "Icon"),
        Some("correct-icon".into())
    );
}

#[test]
fn extract_field_no_desktop_entry_section() {
    let desktop = "\
[Other Section]
Icon=some-icon
";
    assert_eq!(proc_icon::extract_desktop_field(desktop, "Icon"), None);
}

#[test]
fn extract_field_with_spaces() {
    let desktop = "\
[Desktop Entry]
Icon=  spaced-icon  
";
    assert_eq!(
        proc_icon::extract_desktop_field(desktop, "Icon"),
        Some("spaced-icon".into())
    );
}

#[test]
fn extract_field_empty_input() {
    assert_eq!(proc_icon::extract_desktop_field("", "Icon"), None);
}

#[test]
fn extract_field_absolute_path_icon() {
    let desktop = "\
[Desktop Entry]
Icon=/usr/share/icons/hicolor/48x48/apps/firefox.png
";
    assert_eq!(
        proc_icon::extract_desktop_field(desktop, "Icon"),
        Some("/usr/share/icons/hicolor/48x48/apps/firefox.png".into())
    );
}
