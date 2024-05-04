import React, { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import Graph from "./Graph";
import { useSetCpu } from "../services/store";


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

interface CpuProps {
    hidden: boolean;
}

const Cpu: React.FC<CpuProps> = ({ hidden }) => {
    const [cpuData, setCpuData] = useState<CpuData>({ name: "Fetching CPU data...", cores: 0, threads: 0, usage: 0, current_speed: 0.0, base_speed: 0.0, max_speed: 0.0, virtualization: "enabled", socket: 0, uptime: "N/a" });
    const [cpuUsage, setCpuUsage] = useState<number[]>([]);
    const setCpu = useSetCpu();

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

    useEffect(() => {
        if (cpuData !== null) {
            setCpuUsage(prevCpuUsage => [...prevCpuUsage, cpuData.usage as number]);

        }
    }, [cpuData]);

    useEffect(() => {
        if (cpuData !== null) {
            setCpu(cpuUsage)
        }
    }, [cpuUsage]);


    return (
        <div style={{ display: hidden ? 'none' : 'block', width: '100%' }}>
            <h2>{cpuData.name}</h2>
            <Graph firstGraphValue={cpuUsage} maxValue={100} />
            <p>Cpu usage: {cpuData.usage}%</p>
            <p>Socket: {cpuData.socket}</p>
            <p>Cores: {cpuData.cores}</p>
            <p>Threads: {cpuData.threads}</p>
            <p>CPU Speed: {cpuData.current_speed} GHz</p>
            <p>Base Speed: {cpuData.base_speed / 1000000} GHz</p>
            <p>Max Speed: {cpuData.max_speed / 1000000} GHz</p>
            <p>Virtualization: {cpuData.virtualization}</p>
            <p>{cpuData.uptime}</p>
        </div>
    );
}

export default Cpu;
