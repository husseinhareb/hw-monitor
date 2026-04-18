use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs;
use std::sync::Mutex;
use std::time::Instant;

#[derive(Serialize, Deserialize)]
pub struct Network {
    interface: String,
    upload: f64,
    download: f64,
    total_upload: u64,
    total_download: u64,
}

pub fn is_physical_interface(name: &str) -> bool {
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
                map.insert(
                    iface,
                    NetDevStats {
                        rx_bytes: fields[0],
                        tx_bytes: fields[8],
                    },
                );
            }
        }
    }
    map
}

pub struct NetSnapshot {
    pub stats: HashMap<String, (u64, u64)>,
    pub time: Instant,
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

        result.push(Network {
            interface: iface.clone(),
            download: rx_per_sec,
            upload: tx_per_sec,
            total_download: s2.rx_bytes,
            total_upload: s2.tx_bytes,
        });
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
