//useCpudata.ts
import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import usePerformanceConfig from "./usePerformanceConfig";
import { usePaused, notify } from "../../services/store";
import useSerialPolling from "../useSerialPolling";
import type { CpuData } from "../../bindings";

export type { CpuData } from "../../bindings";

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
