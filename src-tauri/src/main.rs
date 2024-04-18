#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod proc;

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![proc::get_processes])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
