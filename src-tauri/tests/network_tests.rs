use hw_monitor::network;

// ── is_physical_interface ──────────────────────────────────────────────

#[test]
fn is_physical_interface_wifi() {
    assert!(network::is_physical_interface("wlan0"));
    assert!(network::is_physical_interface("wlp3s0"));
    assert!(network::is_physical_interface("wlx001122334455"));
}

#[test]
fn is_physical_interface_ethernet() {
    assert!(network::is_physical_interface("eth0"));
    assert!(network::is_physical_interface("eth1"));
    assert!(network::is_physical_interface("enp0s25"));
    assert!(network::is_physical_interface("eno1"));
    assert!(network::is_physical_interface("enx001122334455"));
}

#[test]
fn is_physical_interface_loopback_is_virtual() {
    assert!(!network::is_physical_interface("lo"));
}

#[test]
fn is_physical_interface_docker_is_virtual() {
    assert!(!network::is_physical_interface("docker0"));
    assert!(!network::is_physical_interface("docker_gwbridge"));
}

#[test]
fn is_physical_interface_bridge_is_virtual() {
    assert!(!network::is_physical_interface("br0"));
    assert!(!network::is_physical_interface("br-abc123"));
}

#[test]
fn is_physical_interface_veth_is_virtual() {
    assert!(!network::is_physical_interface("veth12345"));
    assert!(!network::is_physical_interface("vethABCDEF"));
}

#[test]
fn is_physical_interface_tun_tap_is_virtual() {
    assert!(!network::is_physical_interface("tun0"));
    assert!(!network::is_physical_interface("tap0"));
}

#[test]
fn is_physical_interface_virbr_is_virtual() {
    assert!(!network::is_physical_interface("virbr0"));
    assert!(!network::is_physical_interface("virbr0-nic"));
}

#[test]
fn is_physical_interface_empty_string() {
    assert!(!network::is_physical_interface(""));
}

#[test]
fn is_physical_interface_wireguard_is_virtual() {
    assert!(!network::is_physical_interface("wg0"));
}
