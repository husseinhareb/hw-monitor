import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import usePerformanceConfig from "./usePerformanceConfig";
import { usePaused } from "../../services/store";

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

    useEffect(() => {
        if (paused) return;
        const fetchGpuData = async () => {
            try {
                const fetched: GpuData[] = await invoke("get_gpu_informations");
                setGpuList(fetched ?? []);
            } catch (error) {
                console.error("Error fetching GPU data:", error);
                setGpuList([]);
            }
        };
        fetchGpuData();
        const intervalId = setInterval(fetchGpuData, performanceConfig.config.performance_update_time); 

        return () => clearInterval(intervalId);
    }, [performanceConfig.config.performance_update_time, paused]);

    // Backwards-compatible: expose first GPU as gpuData
    const gpuData = gpuList.length > 0 ? gpuList[0] : null;

    return { gpuData, gpuList };
};

export default useGpuData;
