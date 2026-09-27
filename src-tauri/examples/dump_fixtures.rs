//! Dump real backend responses as JSON fixtures for scripts/screenshots.mjs.
//!
//! Usage: cargo run --example dump_fixtures -- <out.json> [samples]
//!
//! Output maps "<command>" or "<command>:<arg>" to a list of responses; the
//! screenshot mock replays them in a loop so graphs move. Errors are stored as
//! {"__error": "..."} so the mock can reject like the real IPC does.

use hw_monitor::{
    battery, config, connections, cpu, cpu_utils, disk, gpu, memory, network, proc, proc_icon,
    sensors, services, smart, startup, system_info, total_usages,
};
use serde::Serialize;
use serde_json::{json, Map, Value};
use std::collections::BTreeSet;
use std::sync::Mutex;
use std::time::Duration;
use tauri::{async_runtime::block_on, Manager};

fn val<T: Serialize>(result: Result<T, String>) -> Value {
    match result {
        Ok(v) => serde_json::to_value(v).unwrap_or(Value::Null),
        Err(e) => json!({ "__error": e }),
    }
}

fn push(out: &mut Map<String, Value>, key: &str, value: Value) {
    out.entry(key.to_string())
        .or_insert_with(|| Value::Array(vec![]))
        .as_array_mut()
        .unwrap()
        .push(value);
}

fn main() {
    let mut args = std::env::args().skip(1);
    let out_path = args
        .next()
        .expect("usage: dump_fixtures <out.json> [samples]");
    let samples: usize = args.next().and_then(|s| s.parse().ok()).unwrap_or(12);

    let app = tauri::test::mock_app();
    app.manage(cpu_utils::PerfCpuState(Mutex::new(None)));
    app.manage(cpu_utils::TotalCpuState(Mutex::new(None)));
    app.manage(cpu_utils::PerCoreCpuState(Mutex::new(Vec::new())));
    app.manage(Mutex::new(None::<network::NetSnapshot>));
    app.manage(Mutex::new(None::<disk::DiskSnapshot>));
    app.manage(Mutex::new(None::<proc::ProcSnapshot>));

    let cfg = block_on(config::get_configs()).expect("read config");
    let show_virtual = cfg.show_virtual_interfaces;
    let mut out = Map::new();

    // The first call of each stateful command only primes its delta snapshot.
    for i in 0..=samples {
        let record = i > 0;
        let procs = val(block_on(proc::get_processes(app.state())));
        let cpu = val(block_on(cpu::get_cpu_informations(
            app.state(),
            app.state(),
        )));
        let totals = val(block_on(total_usages::get_total_usages(app.state())));
        let net = val(block_on(network::get_network(show_virtual, app.state())));
        let disks = val(block_on(disk::get_disks(app.state())));
        if record {
            push(&mut out, "get_processes", procs);
            push(&mut out, "get_cpu_informations", cpu);
            push(&mut out, "get_total_usages", totals);
            push(&mut out, "get_network", net);
            push(&mut out, "get_disks", disks);
            push(&mut out, "get_mem_info", val(Ok(memory::get_mem_info())));
            push(
                &mut out,
                "get_gpu_informations",
                val(Ok(block_on(gpu::get_gpu_informations()))),
            );
            push(&mut out, "get_sensors", val(sensors::get_sensors()));
            push(&mut out, "get_batteries", val(battery::get_batteries()));
            eprintln!("sample {i}/{samples}");
        }
        if i < samples {
            std::thread::sleep(Duration::from_secs(1));
        }
    }

    push(&mut out, "get_configs", val(Ok(cfg)));
    push(
        &mut out,
        "get_interfaces",
        val(Ok(block_on(network::get_interfaces(show_virtual)))),
    );
    push(
        &mut out,
        "get_mem_hardware_info",
        val(Ok(memory::get_mem_hardware_info())),
    );
    push(
        &mut out,
        "get_system_info",
        val(system_info::get_system_info(None)),
    );
    push(
        &mut out,
        "get_connections",
        val(block_on(connections::get_connections())),
    );
    push(
        &mut out,
        "get_startup_apps",
        val(Ok(startup::get_startup_apps())),
    );

    let service_list = block_on(services::get_services());
    if let Ok(list) = &service_list {
        for service in list.iter().take(5) {
            let details = val(block_on(services::get_service_details(
                service.name.clone(),
            )));
            push(
                &mut out,
                &format!("get_service_details:{}", service.name),
                details.clone(),
            );
            push(&mut out, "get_service_details", details);
        }
    }
    push(&mut out, "get_services", val(service_list));

    if let Some(disks) = out["get_disks"][0].as_array() {
        let paths: Vec<String> = disks
            .iter()
            .filter_map(|d| d["dev_path"].as_str().map(str::to_string))
            .collect();
        for path in paths {
            let smart = val(block_on(smart::get_smart_data(path.clone())));
            push(&mut out, &format!("get_smart_data:{path}"), smart);
        }
    }

    let mut names = BTreeSet::new();
    if let Some(list) = out["get_processes"][0].as_array() {
        for p in list {
            if let Some(name) = p["name"].as_str() {
                names.insert(name.to_string());
            }
        }
        if let Some(first) = list.first() {
            if let Ok(process) = serde_json::from_value::<proc::Process>(first.clone()) {
                push(
                    &mut out,
                    "get_process_affinity",
                    val(proc::get_process_affinity(process)),
                );
            }
        }
    }
    if let Some(apps) = out["get_startup_apps"][0].as_array() {
        for app in apps {
            if let Some(exe) = app["executable"].as_str() {
                names.insert(exe.to_string());
            }
        }
    }
    for name in names {
        let icon = val(Ok(proc_icon::get_process_icon(name.clone())));
        push(&mut out, &format!("get_process_icon:{name}"), icon);
    }

    std::fs::write(&out_path, serde_json::to_string(&out).unwrap()).expect("write fixtures");
    eprintln!("wrote {out_path}");
}
