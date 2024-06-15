mod proc;
mod cpu;
mod network;
mod memory;
mod disk;
mod total_usages;
mod sensors;
mod battery;

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            proc::get_processes,
            total_usages::get_total_usages,
            cpu::get_cpu_informations,
            network::get_network,
            network::get_interfaces,
            memory::get_mem_info,
            disk::get_disks,
            sensors::get_sensors,
            battery::get_batteries,
            ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
