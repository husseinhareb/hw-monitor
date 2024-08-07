//useCpudata.ts
import  { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import usePerformanceConfig from "./usePerformanceConfig";


interface CpuData {
    name: string;
    socket: number;
    cores: number;
    threads: number;
    usage: number;
    current_speed: number;
    base_speed: number;
    max_speed: number;
    virtualization: string;
    uptime: string;
    temperature:string;
}


const useCpuData = () => {
    const [cpuData, setCpuData] = useState<CpuData>({ name: "Fetching CPU data...", cores: 0, threads: 0, usage: 0, current_speed: 0.0, base_speed: 0.0, max_speed: 0.0, virtualization: "enabled", socket: 0, uptime: "N/a", temperature: "0 C" });
    const performanceConfig = usePerformanceConfig();  

    useEffect(() => {
        const fetchCpuData = async () => {
            try {
                const fetchedCpuData: CpuData = await invoke("get_cpu_informations");
                setCpuData(fetchedCpuData);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchCpuData();
        const intervalId = setInterval(fetchCpuData, performanceConfig.config.performance_update_time);

        return () => clearInterval(intervalId);
    }, [performanceConfig.config.performance_update_time]);

    return { cpuData };
}


export default useCpuData;
