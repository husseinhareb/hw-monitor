//useCpudata.ts
import  { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/tauri";


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
}


const useCpuData = () => {
    const [cpuData, setCpuData] = useState<CpuData>({ name: "Fetching CPU data...", cores: 0, threads: 0, usage: 0, current_speed: 0.0, base_speed: 0.0, max_speed: 0.0, virtualization: "enabled", socket: 0, uptime: "N/a" });

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
        const intervalId = setInterval(fetchCpuData, 1000);

        return () => clearInterval(intervalId);
    }, []);

    return{cpuData}
}

export default useCpuData;
