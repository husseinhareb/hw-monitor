use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize)]
pub struct CpuInformations {
    name: Option<String>,
}

fn get_cpu_name() -> Option<String> {
    Some(std::env::consts::ARCH.to_string())
}

#[tauri::command]
pub fn get_cpu_informations() -> Option<CpuInformations> {
    if let Some(cpu_name) = get_cpu_name() {
        let cpu_info = CpuInformations {
            name: Some(cpu_name),
        };
        Some(cpu_info)
    } else {
        None
    }
}
