use serde::{Serialize, Deserialize};
use tokio::time::sleep;
use tokio::time::Duration;
use sysinfo::Networks;

#[derive(Serialize, Deserialize)]
pub struct Network {
    interface: Option<String>,
    upload: Option<f64>, 
    download: Option<f64>,
    total_upload: Option<u64>,
    total_download: Option<u64>,
}


#[tauri::command]
pub async fn get_network() -> Option<Network>
{
    let mut networks = Networks::new_with_refreshed_list();

    // Use tokio's sleep function
    sleep(Duration::from_secs(1)).await;

    networks.refresh();
    let wifi_network = networks.iter()
        .find(|(interface_name, _)| interface_name.starts_with("wl") || interface_name.starts_with("en"));

    if let Some((interface_name, data)) = wifi_network {
        // Convert bytes to kilobytes
        let upload_kb = data.transmitted() as f64 / 1024.0;
        let download_kb = data.received() as f64 / 1024.0;

        // Calculate total network usages
        let total_received: u64 = networks.iter().map(|(_, network)| network.total_received()).sum();
        let total_transmitted: u64 = networks.iter().map(|(_, network)| network.total_transmitted()).sum();

        let network = Network {
            interface: Some(interface_name.clone()),
            upload: Some(upload_kb),
            download: Some(download_kb),
            total_upload: Some(total_transmitted), // Swapped total_transmitted and total_received according to your naming
            total_download: Some(total_received),
        };
        Some(network)
    } else {
        None
    }
}
