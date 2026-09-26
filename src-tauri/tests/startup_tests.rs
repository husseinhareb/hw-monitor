use hw_monitor::startup;

const DISCORD: &str = "[Desktop Entry]\nType=Application\nName=Discord\nComment=Chat\nExec=env FOO=1 /usr/bin/discord --start-minimized\nX-GNOME-Autostart-enabled=true\n\n[Desktop Action New]\nName=New\nExec=discord --new\n";

#[test]
fn parses_an_enabled_entry() {
    let app = startup::parse_startup_entry("discord.desktop", DISCORD, "user", &[]).unwrap();
    assert_eq!(app.name, "Discord");
    assert_eq!(app.comment.as_deref(), Some("Chat"));
    assert_eq!(app.executable.as_deref(), Some("discord"));
    assert!(app.enabled);
    assert_eq!(app.scope, "user");
}

#[test]
fn hidden_or_gnome_disabled_entries_are_disabled() {
    let hidden = startup::set_desktop_key(DISCORD, "Hidden", "true");
    assert!(!startup::parse_startup_entry("d.desktop", &hidden, "user", &[]).unwrap().enabled);
    let gnome_off = startup::set_desktop_key(DISCORD, "X-GNOME-Autostart-enabled", "false");
    assert!(!startup::parse_startup_entry("d.desktop", &gnome_off, "user", &[]).unwrap().enabled);
}

#[test]
fn desktop_filters_apply_only_when_a_desktop_is_known() {
    let kde_only = "[Desktop Entry]\nType=Application\nName=K\nExec=k\nOnlyShowIn=KDE;\n";
    let gnome = vec!["GNOME".to_string()];
    let kde = vec!["KDE".to_string()];
    assert!(startup::parse_startup_entry("k.desktop", kde_only, "system", &gnome).is_none());
    assert!(startup::parse_startup_entry("k.desktop", kde_only, "system", &kde).is_some());
    assert!(startup::parse_startup_entry("k.desktop", kde_only, "system", &[]).is_some());
    let not_gnome = "[Desktop Entry]\nType=Application\nName=X\nExec=x\nNotShowIn=GNOME;\n";
    assert!(startup::parse_startup_entry("x.desktop", not_gnome, "system", &gnome).is_none());
}

#[test]
fn set_desktop_key_replaces_within_the_entry_group_only() {
    let out = startup::set_desktop_key(DISCORD, "Name", "Renamed");
    assert!(out.contains("[Desktop Entry]\nType=Application\nName=Renamed\n"));
    assert!(out.contains("[Desktop Action New]\nName=New\n"));
    assert_eq!(out.matches("Name=Renamed").count(), 1);
}

#[test]
fn set_desktop_key_appends_missing_key_before_next_group() {
    let out = startup::set_desktop_key(DISCORD, "Hidden", "true");
    let entry_group = out.split("[Desktop Action New]").next().unwrap();
    assert!(entry_group.contains("Hidden=true"));
    assert!(!out.split("[Desktop Action New]").nth(1).unwrap().contains("Hidden"));
}

#[test]
fn set_startup_app_enabled_rejects_path_traversal() {
    assert!(startup::set_startup_app_enabled("../../etc/passwd.desktop".into(), false).is_err());
    assert!(startup::set_startup_app_enabled("evil".into(), false).is_err());
}
