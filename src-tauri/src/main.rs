mod battery;
mod config;
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
mod total_usages;

use std::sync::Mutex;

fn main() {
    //let devtools = devtools::init();
    if let Err(err) = config::create_config() {
        panic!("failed to initialize config: {err}");
    }
    tauri::Builder::default()
        .manage(cpu_utils::PerfCpuState(Mutex::new(None)))
        .manage(cpu_utils::TotalCpuState(Mutex::new(None)))
        .manage(cpu_utils::PerCoreCpuState(Mutex::new(Vec::new())))
        .manage(Mutex::new(None::<network::NetSnapshot>))
        .manage(Mutex::new(None::<disk::DiskSnapshot>))
        .manage(Mutex::new(None::<proc::ProcSnapshot>))
        .invoke_handler(tauri::generate_handler![
            proc::get_processes,
            proc::kill_process,
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
            services::start_service,
            services::stop_service,
            services::restart_service,
        ])
        //.plugin(devtools)
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
