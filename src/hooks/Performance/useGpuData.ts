import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import usePerformanceConfig from "./usePerformanceConfig";
import { usePaused } from "../../services/store";

export interface GpuData {
    id: string;
    name: string;
    driver_version: string;
    memory_total: string;
    memory_used: string;
    memory_free: string;
    temperature: string;
    utilization: string;
    clock_speed: string;
    wattage: string;
    fan_speed: string;
    performance_state: string;
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
