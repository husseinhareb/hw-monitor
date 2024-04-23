use serde::{Serialize, Deserialize}; // Import serde macros

use sysinfo::{Networks, System};

#[derive(Serialize, Deserialize)]
pub struct Network {
    interface: Option<String>,
    upload: Option<String>,
    download: Option<String>,
}

#[tauri::command]
pub fn get_network() -> Option<Network> {
    let mut sys = System::new_all();
    sys.refresh_all();
    let networks = Networks::new_with_refreshed_list();

    // Assuming you want information for the Wi-Fi interface
    let wifi_network = networks.iter()
        .find(|(interface_name, _)| interface_name.starts_with("wl"));

    if let Some((interface_name, data)) = wifi_network {
        let network = Network {
            interface: Some(interface_name.clone()),
            upload: Some(data.total_received().to_string()),
            download: Some(data.total_transmitted().to_string()),
        };
        Some(network)
    } else {
        None
    }
}
