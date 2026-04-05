//useCpudata.ts
import  { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import usePerformanceConfig from "./usePerformanceConfig";
import { usePaused } from "../../services/store";


interface CpuData {
    name: string | null;
    socket: string | null;
    cores: string | null;
    threads: string | null;
    usage: number | null;
    current_speed: string | null;
    base_speed: string | null;
    max_speed: string | null;
    virtualization: string | null;
    uptime: string | null;
    temperature: string | null;
}


const useCpuData = () => {
    const [cpuData, setCpuData] = useState<CpuData>({ name: null, cores: null, threads: null, usage: null, current_speed: null, base_speed: null, max_speed: null, virtualization: null, socket: null, uptime: null, temperature: null });
    const performanceConfig = usePerformanceConfig();  
    const paused = usePaused();

    useEffect(() => {
        if (paused) return;
        const fetchCpuData = async () => {
            try {
                const fetchedCpuData: CpuData | null = await invoke("get_cpu_informations");
                if (fetchedCpuData) setCpuData(fetchedCpuData);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchCpuData();
        const intervalId = setInterval(fetchCpuData, performanceConfig.config.performance_update_time);

        return () => clearInterval(intervalId);
    }, [performanceConfig.config.performance_update_time, paused]);

    return { cpuData };
}


export default useCpuData;
