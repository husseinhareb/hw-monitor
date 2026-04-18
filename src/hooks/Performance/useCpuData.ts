//useCpudata.ts
import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import usePerformanceConfig from "./usePerformanceConfig";
import { usePaused, notify } from "../../services/store";
import useSerialPolling from "../useSerialPolling";


export interface CpuData {
    name: string | null;
    socket: string | null;
    cores: string | null;
    threads: string | null;
    live_threads: string | null;
    usage: number | null;
    core_usages: number[] | null;
    current_speed: string | null;
    base_speed: string | null;
    max_speed: string | null;
    virtualization: string | null;
    virtual_machine: string | null;
    uptime: string | null;
    temperature: string | null;
    cache_l1: string | null;
    cache_l2: string | null;
    cache_l3: string | null;
}


const useCpuData = () => {
    const [cpuData, setCpuData] = useState<CpuData>({ name: null, cores: null, threads: null, live_threads: null, usage: null, core_usages: null, current_speed: null, base_speed: null, max_speed: null, virtualization: null, virtual_machine: null, socket: null, uptime: null, temperature: null, cache_l1: null, cache_l2: null, cache_l3: null });
    const performanceConfig = usePerformanceConfig();  
    const paused = usePaused();

    useSerialPolling({
        enabled: !paused,
        interval: performanceConfig.config.performance_update_time,
        poll: () => invoke<CpuData | null>("get_cpu_informations"),
        onSuccess: (fetchedCpuData) => {
            if (fetchedCpuData) {
                setCpuData(fetchedCpuData);
            }
        },
        onError: (error) => {
            console.error("Error fetching data:", error);
            notify('error.fetch_failed');
        },
    });

    return { cpuData };
}


export default useCpuData;
