mod battery;
mod config;
mod connections;
mod cpu;
mod cpu_utils;
mod disk;
mod gpu;
mod memory;
mod network;
mod proc;
mod proc_icon;
mod sensors;
mod services;
mod smart;
mod total_usages;

use std::sync::{
    atomic::{AtomicBool, Ordering},
    Mutex,
};
use tauri::{
    image::Image,
    menu::{Menu, MenuEvent, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIcon, TrayIconBuilder, TrayIconEvent},
    Manager, WindowEvent,
};

const MAIN_WINDOW_LABEL: &str = "main";
const OPEN_MENU_ID: &str = "open";
const QUIT_MENU_ID: &str = "quit";
const TRAY_ID: &str = "main-tray";
const TRAY_ICON: Image<'_> = tauri::include_image!("./icons/32x32.png");

#[derive(Default)]
struct AppLifecycleState {
    is_quitting: AtomicBool,
}

fn show_main_window<R: tauri::Runtime>(app: &tauri::AppHandle<R>) {
    let Some(window) = app.get_webview_window(MAIN_WINDOW_LABEL) else {
        eprintln!("failed to show main window: window '{MAIN_WINDOW_LABEL}' was not found");
        return;
    };

    if let Err(error) = window.unminimize() {
        eprintln!("failed to unminimize main window: {error}");
    }

    if let Err(error) = window.show() {
        eprintln!("failed to show main window: {error}");
    }

    if let Err(error) = window.set_focus() {
        eprintln!("failed to focus main window: {error}");
    }
}

fn build_tray<R: tauri::Runtime>(app: &tauri::AppHandle<R>) -> tauri::Result<()> {
    let open_item = MenuItem::with_id(app, OPEN_MENU_ID, "Open", true, None::<&str>)?;
    let quit_item = MenuItem::with_id(app, QUIT_MENU_ID, "Quit", true, None::<&str>)?;
    let tray_menu = Menu::with_items(app, &[&open_item, &quit_item])?;

    TrayIconBuilder::with_id(TRAY_ID)
        .menu(&tray_menu)
        .icon(TRAY_ICON)
        .show_menu_on_left_click(false)
        .on_menu_event(handle_tray_menu_event)
        .on_tray_icon_event(handle_tray_icon_event)
        .build(app)?;

    Ok(())
}

fn handle_tray_menu_event<R: tauri::Runtime>(app: &tauri::AppHandle<R>, event: MenuEvent) {
    match event.id().as_ref() {
        OPEN_MENU_ID => show_main_window(app),
        QUIT_MENU_ID => {
            app.state::<AppLifecycleState>()
                .is_quitting
                .store(true, Ordering::SeqCst);
            app.exit(0);
        }
        _ => {}
    }
}

fn handle_tray_icon_event<R: tauri::Runtime>(tray: &TrayIcon<R>, event: TrayIconEvent) {
    if let TrayIconEvent::Click {
        button: MouseButton::Left,
        button_state: MouseButtonState::Down,
        ..
    } = event
    {
        show_main_window(tray.app_handle());
    }
}

fn handle_window_event<R: tauri::Runtime>(window: &tauri::Window<R>, event: &WindowEvent) {
    if window.label() != MAIN_WINDOW_LABEL {
        return;
    }

    if let WindowEvent::CloseRequested { api, .. } = event {
        if window
            .state::<AppLifecycleState>()
            .is_quitting
            .load(Ordering::SeqCst)
        {
            return;
        }

        api.prevent_close();

        if let Err(error) = window.hide() {
            eprintln!("failed to hide main window on close request: {error}");
        }
    }
}

#[tauri::command]
fn restart_app(app: tauri::AppHandle) {
    app.exit(0);
}

fn main() {
    //let devtools = devtools::init();
    if let Err(err) = config::create_config() {
        panic!("failed to initialize config: {err}");
    }
    tauri::Builder::default()
        .manage(AppLifecycleState::default())
        .manage(cpu_utils::PerfCpuState(Mutex::new(None)))
        .manage(cpu_utils::TotalCpuState(Mutex::new(None)))
        .manage(cpu_utils::PerCoreCpuState(Mutex::new(Vec::new())))
        .manage(Mutex::new(None::<network::NetSnapshot>))
        .manage(Mutex::new(None::<disk::DiskSnapshot>))
        .manage(Mutex::new(None::<proc::ProcSnapshot>))
        .setup(|app| {
            build_tray(app.handle())?;
            Ok(())
        })
        .on_window_event(handle_window_event)
        .invoke_handler(tauri::generate_handler![
            proc::get_processes,
            proc::kill_process,
            proc::set_process_priority,
            proc::get_process_affinity,
            proc::set_process_affinity,
            total_usages::get_total_usages,
            cpu::get_cpu_informations,
            network::get_network,
            network::get_interfaces,
            memory::get_mem_info,
            memory::get_mem_hardware_info,
            disk::get_disks,
            sensors::get_sensors,
            battery::get_batteries,
            config::get_configs,
            config::set_default_config,
            config::set_all_configs,
            config::set_processes_configs,
            config::set_performance_configs,
            config::set_sensors_configs,
            config::set_heatbar_configs,
            config::set_disks_configs,
            config::set_navbar_configs,
            config::set_config_panel_configs,
            config::set_language_config,
            gpu::get_gpu_informations,
            proc_icon::get_process_icon,
            services::get_services,
            services::get_service_details,
            services::start_service,
            services::stop_service,
            services::restart_service,
            services::enable_service,
            services::disable_service,
            smart::get_smart_data,
            connections::get_connections,
            restart_app,
        ])
        //.plugin(devtools)
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
