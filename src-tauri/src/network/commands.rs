use serde::{Serialize, Deserialize};
use std::fs;
use std::collections::HashMap;
use tokio::time::{sleep, Duration};

#[derive(Serialize, Deserialize)]
pub struct Network {
    interface: String,
    upload: String, 
    download: String,
    total_upload: u64,
    total_download: u64,
}

fn is_physical_interface(name: &str) -> bool {
    name.starts_with("wl") || name.starts_with("en") || name.starts_with("eth")
}

struct NetDevStats {
    rx_bytes: u64,
    tx_bytes: u64,
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
            if fields.len() >= 10 {
                map.insert(iface, NetDevStats {
                    rx_bytes: fields[0],
                    tx_bytes: fields[8],
                });
            }
        }
    }
    map
}

#[tauri::command]
pub async fn get_interfaces(show_virtual: bool) -> Vec<String> {
    let stats = read_proc_net_dev();
    let mut interfaces: Vec<String> = stats
        .keys()
        .filter(|name| show_virtual || is_physical_interface(name))
        .cloned()
        .collect();
    interfaces.sort();
    interfaces
}

#[tauri::command]
pub async fn get_network(show_virtual: bool) -> Vec<Network> {
    let stats1 = read_proc_net_dev();
    sleep(Duration::from_millis(1000)).await;
    let stats2 = read_proc_net_dev();

    let mut names: Vec<&String> = stats2.keys().collect();
    names.sort();

    let mut result: Vec<Network> = Vec::new();
    for iface in names {
        if !show_virtual && !is_physical_interface(iface) {
            continue;
        }
        let s2 = &stats2[iface];
        let (rx_delta, tx_delta) = if let Some(s1) = stats1.get(iface) {
            (
                s2.rx_bytes.saturating_sub(s1.rx_bytes),
                s2.tx_bytes.saturating_sub(s1.tx_bytes),
            )
        } else {
            (0, 0)
        };

        result.push(Network {
            interface: iface.clone(),
            download: format!("{:.1}", rx_delta),
            upload: format!("{:.1}", tx_delta),
            total_download: s2.rx_bytes,
            total_upload: s2.tx_bytes,
        });
    }

    result
}
