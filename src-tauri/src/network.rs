use serde::{Serialize, Deserialize};
use std::thread::sleep;
use sysinfo::Networks;
use std::time::Duration;

#[derive(Serialize, Deserialize)]
pub struct Network {
    interface: String,
    upload: String, 
    download: String,
    total_upload: u64,
    total_download: u64,
}

#[tauri::command]
pub async fn get_interfaces() -> Vec<String> {
    let mut networks = Networks::new_with_refreshed_list();
    // Use tokio's sleep function
    tokio::time::sleep(Duration::from_millis(1000)).await;
    networks.refresh();
    let mut result: Vec<String> = Vec::new();

    // Sort the network interfaces by name
    let mut sorted_networks: Vec<_> = networks.iter().collect();
    sorted_networks.sort_by(|(name1, _), (name2, _)| name1.cmp(name2));

    for (interface_name, _) in sorted_networks {
        // Only consider interfaces starting with "wl", "en", or "eth"
        if interface_name.starts_with("wl") || interface_name.starts_with("en") || interface_name.starts_with("eth") {
            result.push(interface_name.clone());
        }
    }
    println!("{:?}",result);
    result
}

#[tauri::command]
pub async fn get_network() -> Vec<Network> {
    let mut networks = Networks::new_with_refreshed_list();
    // Use tokio's sleep function
    sleep(Duration::from_millis(1000));
    networks.refresh();
    let mut result: Vec<Network> = Vec::new();

    // Sort the network interfaces by name
    let mut sorted_networks: Vec<_> = networks.iter().collect();
    sorted_networks.sort_by(|(name1, _), (name2, _)| name1.cmp(name2));

    for (interface_name, data) in sorted_networks {
        // Only consider interfaces starting with "wl" or "en" or "eth"
        if interface_name.starts_with("wl") || interface_name.starts_with("en") || interface_name.starts_with("eth") {
            // Convert bytes to kilobytes
            let upload_kb = data.transmitted();
            let download_kb = data.received();
            // Calculate total network usages
            let total_received: u64 = networks.iter().map(|(_, network)| network.total_received()).sum();
            let total_transmitted: u64 = networks.iter().map(|(_, network)| network.total_transmitted()).sum();

            let network = Network {
                interface: interface_name.clone(),
                upload: format!("{:.1}", upload_kb),
                download: format!("{:.1}", download_kb),
                total_upload: total_transmitted, 
                total_download: total_received,
            };
            result.push(network);
        }
    }

    result
}
