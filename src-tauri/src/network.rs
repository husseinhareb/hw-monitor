use serde::{Serialize, Deserialize};
use tokio::time::sleep;
use tokio::time::Duration;
use sysinfo::Networks;

#[derive(Serialize, Deserialize)]
pub struct Network {
    interface: Option<String>,
    upload: Option<f64>, // Changed type to f64 for kilobytes
    download: Option<f64>, // Changed type to f64 for kilobytes
}

#[tauri::command]
pub async fn get_network() -> Option<Network> {
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

        let network = Network {
            interface: Some(interface_name.clone()),
            upload: Some(upload_kb),
            download: Some(download_kb),
        };
        Some(network)
    } else {
        None
    }
}
