import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import usePerformanceConfig from "./usePerformanceConfig";

interface GpuData {
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

const defaultGpuData: GpuData = {
    name: "No GPU detected",
    driver_version: "N/A",
    memory_total: "N/A",
    memory_used: "N/A",
    memory_free: "N/A",
    temperature: "N/A",
    utilization: "0",
    clock_speed: "N/A",
    wattage: "N/A",
    fan_speed: "N/A",
    performance_state: "N/A",
};

const useGpuData = () => {
    const [gpuData, setGpuData] = useState<GpuData | null>(null);
    const performanceConfig = usePerformanceConfig();  

    useEffect(() => {
        const fetchGpuData = async () => {
            try {
                const fetchedGpuData: GpuData | null = await invoke("get_gpu_informations");
                setGpuData(fetchedGpuData ?? defaultGpuData);
            } catch (error) {
                console.error("Error fetching GPU data:", error);
                setGpuData(defaultGpuData);
            }
        };
        fetchGpuData();
        const intervalId = setInterval(fetchGpuData, performanceConfig.config.performance_update_time); 

        return () => clearInterval(intervalId);
    }, []);

    return { gpuData };
};

export default useGpuData;
