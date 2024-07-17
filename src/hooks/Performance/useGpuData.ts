//useGpuData.ts
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
}

const useGpuData = () => {
    const [gpuData, setGpuData] = useState<GpuData>({
        name: "Fetching GPU data...",
        driver_version: "N/A",
        memory_total: "N/A",
        memory_used: "N/A",
        memory_free: "N/A",
        temperature: "N/A",
        utilization: "0",
        clock_speed: "N/A",
        wattage: "N/A"
    });
    const performanceConfig = usePerformanceConfig();  

    useEffect(() => {
        const fetchGpuData = async () => {
            try {
                const fetchedGpuData: GpuData = await invoke("get_gpu_informations");
                setGpuData(fetchedGpuData);
            } catch (error) {
                console.error("Error fetching GPU data:", error);
            }
        };
        console.log(gpuData)
        fetchGpuData();
        const intervalId = setInterval(fetchGpuData, performanceConfig.config.performance_update_time); 

        return () => clearInterval(intervalId);
    }, []);

    return { gpuData };
};

export default useGpuData;
