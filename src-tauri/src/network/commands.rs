use libc::{AF_INET, AF_INET6};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::ffi::CStr;
use std::fs;
use std::net::{Ipv4Addr, Ipv6Addr};
use std::path::Path;
use std::sync::Mutex;
use std::time::Instant;

#[derive(Serialize, Deserialize)]
pub struct Network {
    interface: String,
    upload: f64,
    download: f64,
    total_upload: u64,
    total_download: u64,
    mac_address: Option<String>,
    ipv4_addresses: Vec<String>,
    ipv6_addresses: Vec<String>,
    link_speed_mbps: Option<u64>,
    connection_state: String,
    interface_type: String,
    wifi_signal_percent: Option<u8>,
    wifi_signal_dbm: Option<i32>,
    rx_errors: u64,
    tx_errors: u64,
    rx_dropped: u64,
    tx_dropped: u64,
}

#[derive(Serialize, Deserialize)]
pub struct NetworkInterface {
    interface: String,
    mac_address: Option<String>,
    ipv4_addresses: Vec<String>,
    ipv6_addresses: Vec<String>,
    link_speed_mbps: Option<u64>,
    connection_state: String,
    interface_type: String,
    wifi_signal_percent: Option<u8>,
    wifi_signal_dbm: Option<i32>,
    rx_errors: u64,
    tx_errors: u64,
    rx_dropped: u64,
    tx_dropped: u64,
}

pub fn is_physical_interface(name: &str) -> bool {
    name.starts_with("wl") || name.starts_with("en") || name.starts_with("eth")
}

struct NetDevStats {
    rx_bytes: u64,
    tx_bytes: u64,
    rx_errors: u64,
    tx_errors: u64,
    rx_dropped: u64,
    tx_dropped: u64,
}

fn read_proc_net_dev() -> HashMap<String, NetDevStats> {
    let mut map = HashMap::new();
    let content = match fs::read_to_string("/proc/net/dev") {
        Ok(c) => c,
        Err(_) => return map,
    };
    for line in content.lines().skip(2) {
        if let Some((name_part, stats_part)) = line.split_once(':') {
            let iface = name_part.trim().to_string();
            let fields: Vec<u64> = stats_part
                .split_whitespace()
                .filter_map(|s| s.parse().ok())
                .collect();
            if fields.len() >= 12 {
                map.insert(
                    iface,
                    NetDevStats {
                        rx_bytes: fields[0],
                        tx_bytes: fields[8],
                        rx_errors: fields[2],
                        tx_errors: fields[10],
                        rx_dropped: fields[3],
                        tx_dropped: fields[11],
                    },
                );
            }
        }
    }
    map
}

#[derive(Debug, Default)]
struct AddressInfo {
    ipv4_addresses: Vec<String>,
    ipv6_addresses: Vec<String>,
}

fn read_interface_addresses(interface: &str) -> AddressInfo {
    let mut info = AddressInfo::default();

    let mut ifap: *mut libc::ifaddrs = std::ptr::null_mut();
    if unsafe { libc::getifaddrs(&mut ifap) } != 0 || ifap.is_null() {
        return info;
    }

    let mut ifa = ifap;
    while !ifa.is_null() {
        let entry = unsafe { &*ifa };
        ifa = entry.ifa_next;

        if entry.ifa_addr.is_null() || entry.ifa_name.is_null() {
            continue;
        }

        let name = match unsafe { CStr::from_ptr(entry.ifa_name).to_str() } {
            Ok(n) => n,
            Err(_) => continue,
        };
        if name != interface {
            continue;
        }

        let family = unsafe { (*entry.ifa_addr).sa_family } as i32;

        if family == AF_INET {
            let addr = unsafe { &*(entry.ifa_addr as *const libc::sockaddr_in) };
            let ip = Ipv4Addr::from(addr.sin_addr.s_addr.to_ne_bytes());
            let prefix = if !entry.ifa_netmask.is_null() {
                let mask = unsafe { &*(entry.ifa_netmask as *const libc::sockaddr_in) };
                mask.sin_addr.s_addr.count_ones()
            } else {
                32
            };
            info.ipv4_addresses.push(format!("{}/{}", ip, prefix));
        } else if family == AF_INET6 {
            let addr = unsafe { &*(entry.ifa_addr as *const libc::sockaddr_in6) };
            let ip = Ipv6Addr::from(addr.sin6_addr.s6_addr);
            let prefix = if !entry.ifa_netmask.is_null() {
                let mask = unsafe { &*(entry.ifa_netmask as *const libc::sockaddr_in6) };
                mask.sin6_addr.s6_addr.iter().map(|b| b.count_ones()).sum::<u32>()
            } else {
                128
            };
            info.ipv6_addresses.push(format!("{}/{}", ip, prefix));
        }
    }

    unsafe { libc::freeifaddrs(ifap) };
    info
}

fn read_trimmed(path: impl AsRef<Path>) -> Option<String> {
    fs::read_to_string(path)
        .ok()
        .map(|value| value.trim().to_string())
        .filter(|value| !value.is_empty())
}

fn sysfs_interface_path(interface: &str) -> String {
    format!("/sys/class/net/{interface}")
}

fn read_mac_address(interface: &str) -> Option<String> {
    read_trimmed(format!("{}/address", sysfs_interface_path(interface)))
        .filter(|value| value != "00:00:00:00:00:00")
}

fn read_link_speed(interface: &str) -> Option<u64> {
    read_trimmed(format!("{}/speed", sysfs_interface_path(interface)))
        .and_then(|value| value.parse::<i64>().ok())
        .and_then(|value| u64::try_from(value).ok())
        .filter(|value| *value > 0)
}

fn read_connection_state(interface: &str) -> String {
    let operstate = read_trimmed(format!("{}/operstate", sysfs_interface_path(interface)))
        .unwrap_or_else(|| "unknown".to_string());
    let carrier = read_trimmed(format!("{}/carrier", sysfs_interface_path(interface)));

    match (operstate.as_str(), carrier.as_deref()) {
        ("up", Some("1")) => "connected".to_string(),
        ("up", Some("0")) => "disconnected".to_string(),
        ("down", _) => "down".to_string(),
        ("dormant", _) => "dormant".to_string(),
        ("unknown", _) => "unknown".to_string(),
        _ => operstate,
    }
}

fn infer_interface_type(interface: &str) -> String {
    let base_path = sysfs_interface_path(interface);

    if Path::new(&format!("{base_path}/wireless")).exists() || interface.starts_with("wl") {
        return "wifi".to_string();
    }
    if interface == "lo" {
        return "loopback".to_string();
    }
    if interface.starts_with("br")
        || interface.starts_with("docker")
        || interface.starts_with("virbr")
    {
        return "bridge".to_string();
    }
    if interface.starts_with("tun") || interface.starts_with("tap") || interface.starts_with("wg") {
        return "vpn".to_string();
    }
    if interface.starts_with("veth") {
        return "virtual".to_string();
    }
    if interface.starts_with("en") || interface.starts_with("eth") {
        return "ethernet".to_string();
    }

    match fs::canonicalize(&base_path) {
        Ok(path) if path.to_string_lossy().contains("/devices/virtual/net/") => {
            "virtual".to_string()
        }
        _ => "unknown".to_string(),
    }
}

fn parse_wireless_number(value: &str) -> Option<f64> {
    value.trim_end_matches('.').parse::<f64>().ok()
}

fn parse_wifi_signal_line(line: &str, interface: &str) -> Option<(Option<u8>, Option<i32>)> {
    let (name, stats) = line.split_once(':')?;
    if name.trim() != interface {
        return None;
    }

    let fields: Vec<&str> = stats.split_whitespace().collect();
    if fields.len() < 4 {
        return Some((None, None));
    }

    let quality = parse_wireless_number(fields[1])
        .map(|value| ((value / 70.0) * 100.0).clamp(0.0, 100.0).round() as u8);
    let dbm = parse_wireless_number(fields[2])
        .filter(|value| *value <= 0.0)
        .map(|value| value.round() as i32);

    Some((quality, dbm))
}

fn read_wifi_signal(interface: &str) -> (Option<u8>, Option<i32>) {
    let content = match fs::read_to_string("/proc/net/wireless") {
        Ok(content) => content,
        Err(_) => return (None, None),
    };

    content
        .lines()
        .find_map(|line| parse_wifi_signal_line(line, interface))
        .unwrap_or((None, None))
}

fn network_interface_from_parts(interface: &str, stats: Option<&NetDevStats>) -> NetworkInterface {
    let addresses = read_interface_addresses(interface);
    let (wifi_signal_percent, wifi_signal_dbm) = read_wifi_signal(interface);
    let zero_stats = NetDevStats {
        rx_bytes: 0,
        tx_bytes: 0,
        rx_errors: 0,
        tx_errors: 0,
        rx_dropped: 0,
        tx_dropped: 0,
    };
    let stats = stats.unwrap_or(&zero_stats);

    NetworkInterface {
        interface: interface.to_string(),
        mac_address: read_mac_address(interface),
        ipv4_addresses: addresses.ipv4_addresses,
        ipv6_addresses: addresses.ipv6_addresses,
        link_speed_mbps: read_link_speed(interface),
        connection_state: read_connection_state(interface),
        interface_type: infer_interface_type(interface),
        wifi_signal_percent,
        wifi_signal_dbm,
        rx_errors: stats.rx_errors,
        tx_errors: stats.tx_errors,
        rx_dropped: stats.rx_dropped,
        tx_dropped: stats.tx_dropped,
    }
}

fn network_from_stats(interface: &str, stats: &NetDevStats, download: f64, upload: f64) -> Network {
    let details = network_interface_from_parts(interface, Some(stats));

    Network {
        interface: details.interface,
        download,
        upload,
        total_download: stats.rx_bytes,
        total_upload: stats.tx_bytes,
        mac_address: details.mac_address,
        ipv4_addresses: details.ipv4_addresses,
        ipv6_addresses: details.ipv6_addresses,
        link_speed_mbps: details.link_speed_mbps,
        connection_state: details.connection_state,
        interface_type: details.interface_type,
        wifi_signal_percent: details.wifi_signal_percent,
        wifi_signal_dbm: details.wifi_signal_dbm,
        rx_errors: details.rx_errors,
        tx_errors: details.tx_errors,
        rx_dropped: details.rx_dropped,
        tx_dropped: details.tx_dropped,
    }
}

pub struct NetSnapshot {
    pub stats: HashMap<String, (u64, u64)>,
    pub time: Instant,
}

#[tauri::command]
pub async fn get_interfaces(show_virtual: bool) -> Vec<NetworkInterface> {
    let stats = read_proc_net_dev();
    let mut interfaces: Vec<String> = stats
        .keys()
        .filter(|name| show_virtual || is_physical_interface(name))
        .cloned()
        .collect();
    interfaces.sort();
    interfaces
        .into_iter()
        .map(|interface| network_interface_from_parts(&interface, stats.get(&interface)))
        .collect()
}

#[tauri::command]
pub async fn get_network(
    show_virtual: bool,
    prev_net: tauri::State<'_, Mutex<Option<NetSnapshot>>>,
) -> Result<Vec<Network>, String> {
    let stats2 = read_proc_net_dev();
    let now = Instant::now();

    let mut guard = prev_net.lock().map_err(|e| e.to_string())?;

    let mut names: Vec<&String> = stats2.keys().collect();
    names.sort();

    let mut result: Vec<Network> = Vec::new();
    for iface in names {
        if !show_virtual && !is_physical_interface(iface) {
            continue;
        }
        let s2 = &stats2[iface];
        let (rx_per_sec, tx_per_sec) = if let Some(ref snap) = *guard {
            let elapsed = now.duration_since(snap.time).as_secs_f64();
            if elapsed > 0.0 {
                if let Some(&(prev_rx, prev_tx)) = snap.stats.get(iface) {
                    let rx_delta = s2.rx_bytes.saturating_sub(prev_rx) as f64;
                    let tx_delta = s2.tx_bytes.saturating_sub(prev_tx) as f64;
                    (rx_delta / elapsed, tx_delta / elapsed)
                } else {
                    (0.0, 0.0)
                }
            } else {
                (0.0, 0.0)
            }
        } else {
            (0.0, 0.0)
        };

        result.push(network_from_stats(iface, s2, rx_per_sec, tx_per_sec));
    }

    *guard = Some(NetSnapshot {
        stats: stats2
            .into_iter()
            .map(|(k, v)| (k, (v.rx_bytes, v.tx_bytes)))
            .collect(),
        time: now,
    });

    Ok(result)
}

#[cfg(test)]
mod tests {
    use super::{infer_interface_type, parse_wifi_signal_line};

    #[test]
    fn infers_common_interface_types() {
        assert_eq!(infer_interface_type("wlan0"), "wifi");
        assert_eq!(infer_interface_type("wlp3s0"), "wifi");
        assert_eq!(infer_interface_type("eth0"), "ethernet");
        assert_eq!(infer_interface_type("enp0s25"), "ethernet");
        assert_eq!(infer_interface_type("lo"), "loopback");
        assert_eq!(infer_interface_type("docker0"), "bridge");
        assert_eq!(infer_interface_type("br-abc123"), "bridge");
        assert_eq!(infer_interface_type("veth1234"), "virtual");
        assert_eq!(infer_interface_type("wg0"), "vpn");
    }

    #[test]
    fn parses_wifi_signal_from_proc_net_wireless_line() {
        let line = "wlan0: 0000   49.  -61.  -256        0      0      0      0      0        0";
        let (quality, dbm) = parse_wifi_signal_line(line, "wlan0").unwrap();
        assert_eq!(quality, Some(70));
        assert_eq!(dbm, Some(-61));
        assert!(parse_wifi_signal_line(line, "wlan1").is_none());
    }
}
