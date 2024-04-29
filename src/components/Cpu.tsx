//Cpu.tsx
import React, { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/tauri";


interface TotalUsages {
    memory: number | null;
    cpu: number | null;
    processes: number | null;
}

interface CpuData {
    name: string;
    cores: number;
    threads: number;
    cpu_speed: number;
    base_speed: number;
    max_speed: number;
    virtualization: string;
    socket: number;
    uptime: string;
}

const Cpu: React.FC = () => {
    const [cpuData, setCpuData] = useState<CpuData>({ name: "Fetching CPU data...", cores: 0, threads: 0, cpu_speed: 0.0, base_speed: 0.0, max_speed: 0.0, virtualization: "enabled", socket: 0, uptime: "N/a" });
    const [totalUsages, setTotalUsages] = useState<TotalUsages | null>(null);
    

    useEffect(() => {
        const fetchCpuData = async () => {
            try {
                const fetchedCpuData: CpuData = await invoke("get_cpu_informations");
                setCpuData(fetchedCpuData);

                const fetchedTotalUsages: TotalUsages = await invoke("get_total_usages");
                setTotalUsages(fetchedTotalUsages);

                // Dispatch CPU usage only if it's not null
                if (fetchedTotalUsages.cpu !== null) {
                    console.log("hey",fetchedTotalUsages.cpu)
                }

                
                

            } catch (error) {
                console.error("Error fetching data:", error);
            }

        };

        fetchCpuData();
        const intervalId = setInterval(fetchCpuData, 1000);

        return () => clearInterval(intervalId);
    }, []);


    return (
        <div>
            <p>{cpuData.name}</p>
            <p>Cpu usage: {totalUsages ? totalUsages.cpu : '0'}%</p>
            <p>Cores: {cpuData.cores}</p>
            <p>Threads: {cpuData.threads}</p>
            <p>Socket: {cpuData.socket}</p>
            <p>CPU Speed: {cpuData.cpu_speed} GHz</p>
            <p>Base Speed: {cpuData.base_speed / 1000000} GHz</p>
            <p>Max Speed: {cpuData.max_speed / 1000000} GHz</p>
            <p>Virtualization: {cpuData.virtualization}</p>
            <p>{totalUsages ? totalUsages.processes : 'N/a'}</p>
            <p>{cpuData.uptime}</p>
        </div>
    );
}

export default Cpu;
