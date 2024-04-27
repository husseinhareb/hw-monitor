use serde::{Serialize, Deserialize};
use std::thread::sleep;
use sysinfo::Networks;
use std::time::Duration;
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
    sleep(Duration::from_millis(1000));
    networks.refresh();
    let wifi_network = networks.iter()
        .find(|(interface_name, _)| interface_name.starts_with("wl"));

    if let Some((interface_name, data)) = wifi_network {
        // Convert bytes to kilobytes
        let upload_kb = data.transmitted();
        let download_kb = data.received();
        // Calculate total network usages
        let total_received: u64 = networks.iter().map(|(_, network)| network.total_received()).sum();
        let total_transmitted: u64 = networks.iter().map(|(_, network)| network.total_transmitted()).sum();

        let network = Network {
            interface: Some(interface_name.clone()),
            upload: Some(upload_kb as f64),
            download: Some(download_kb as f64),
            total_upload: Some(total_transmitted), 
            total_download: Some(total_received),
        };
        Some(network)
    } else {
        None
    }
}
