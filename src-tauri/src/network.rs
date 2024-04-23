use serde::{Serialize, Deserialize}; // Import serde macros
use tokio::time::sleep;
use std::time::Duration;
use sysinfo::Networks;

#[derive(Serialize, Deserialize)]
pub struct Network {
    interface: Option<String>,
    upload: Option<String>,
    download: Option<String>,
}

#[tauri::command]
pub async fn get_network() -> Option<Network> {
    let mut networks = Networks::new_with_refreshed_list();

    // Use tokio's sleep function
    sleep(Duration::from_secs(1)).await;

    networks.refresh();
    let wifi_network = networks.iter()
        .find(|(interface_name, _)| interface_name.starts_with("wl"));

    if let Some((interface_name, data)) = wifi_network {
        let network = Network {
            interface: Some(interface_name.clone()),
            upload: Some(data.received().to_string()),
            download: Some(data.transmitted().to_string()),
        };
        println!("{:?}", network.download);
        Some(network)
    } else {
        None
    }
}
