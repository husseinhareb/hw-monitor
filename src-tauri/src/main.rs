mod proc;
mod cpu;
mod network;
mod memory;
mod disk;
mod total_usages;
mod sensors;
mod battery;
mod config;
mod gpu;
mod cpu_utils;
mod proc_icon;
mod services;

use std::sync::Mutex;

fn main() {
    //let devtools = devtools::init();
    let _ = config::create_config();
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
            disk::get_disks,
            sensors::get_sensors,
            battery::get_batteries,
            config::get_configs,
            config::set_default_config,
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
