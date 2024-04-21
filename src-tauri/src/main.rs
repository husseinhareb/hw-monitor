use std::thread;
use std::time::Duration;

mod proc;
mod cpu;

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![proc::get_processes, proc::get_total_usages,cpu::get_cpu_informations])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
