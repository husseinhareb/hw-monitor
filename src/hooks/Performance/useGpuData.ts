import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import usePerformanceConfig from "./usePerformanceConfig";
import { usePaused, notify } from "../../services/store";
import useSerialPolling from "../useSerialPolling";

export interface GpuData {
    id: string | null;
    name: string | null;
    driver_version: string | null;
    memory_total: string | null;
    memory_used: string | null;
    memory_free: string | null;
    temperature: string | null;
    utilization: string | null;
    clock_speed: string | null;
    wattage: string | null;
    fan_speed: string | null;
    performance_state: string | null;
}

const useGpuData = () => {
    const [gpuList, setGpuList] = useState<GpuData[]>([]);
    const performanceConfig = usePerformanceConfig();  
    const paused = usePaused();

    useSerialPolling({
        enabled: !paused,
        interval: performanceConfig.config.performance_update_time,
        poll: () => invoke<GpuData[]>("get_gpu_informations"),
        onSuccess: (fetched) => {
            setGpuList(fetched ?? []);
        },
        onError: (error) => {
            console.error("Error fetching GPU data:", error);
            notify('error.fetch_failed');
            setGpuList([]);
        },
    });

    return { gpuList };
};

export default useGpuData;
