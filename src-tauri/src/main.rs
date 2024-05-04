mod proc;
mod cpu;
mod network;
mod memory;
fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            proc::get_processes,
            proc::get_total_usages,
            cpu::get_cpu_informations,
            network::get_network,
            memory::get_mem_info,
            ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
