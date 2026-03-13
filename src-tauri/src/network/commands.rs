use serde::{Serialize, Deserialize};
use sysinfo::Networks;
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

#[tauri::command]
pub async fn get_interfaces(show_virtual: bool) -> Vec<String> {
    let mut networks = Networks::new_with_refreshed_list();
    networks.refresh();
    let mut interfaces: Vec<String> = Vec::new();

    let mut sorted_networks: Vec<_> = networks.iter().collect();
    sorted_networks.sort_by(|(name1, _), (name2, _)| name1.cmp(name2));

    for (interface_name, _) in sorted_networks {
        if show_virtual || is_physical_interface(interface_name) {
            interfaces.push(interface_name.clone());
        }
    }
    interfaces
}

#[tauri::command]
pub async fn get_network(show_virtual: bool) -> Vec<Network> {
    let mut networks = Networks::new_with_refreshed_list();
    sleep(Duration::from_millis(1000)).await;
    networks.refresh();
    let mut result: Vec<Network> = Vec::new();

    let mut sorted_networks: Vec<_> = networks.iter().collect();
    sorted_networks.sort_by(|(name1, _), (name2, _)| name1.cmp(name2));

    for (interface_name, data) in sorted_networks {
        if show_virtual || is_physical_interface(interface_name) {
            let upload_bytes = data.transmitted();
            let download_bytes = data.received();
            let total_received: u64 = data.total_received();
            let total_transmitted: u64 = data.total_transmitted();

            let network = Network {
                interface: interface_name.clone(),
                upload: format!("{:.1}", upload_bytes),
                download: format!("{:.1}", download_bytes),
                total_upload: total_transmitted, 
                total_download: total_received,
            };
            result.push(network);
        }
    }

    result
}
