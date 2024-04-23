import React, { useState, useEffect, useRef } from "react";
import Chart from 'chart.js/auto';
import { invoke } from "@tauri-apps/api/tauri";
import Graph from "./Graph";

interface CpuProps {
    cpuUsage: number[];
}
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

const Cpu: React.FC<CpuProps> = ({ cpuUsage }) => {
    const chartInstance = useRef<Chart<"line"> | null>(null);
    const [cpuData, setCpuData] = useState<CpuData>({ name: "Fetching CPU data...", cores: 0, threads: 0, cpu_speed: 0.0, base_speed: 0.0, max_speed: 0.0, virtualization: "enabled", socket: 0, uptime: "N/a" });
    const [totalUsages, setTotalUsages] = useState<TotalUsages | null>(null); // Initialize as null
    useEffect(() => {
        const fetchCpuData = async () => {
            try {
                const fetchedCpuData: CpuData = await invoke("get_cpu_informations");
                setCpuData(fetchedCpuData);

                const fetchedTotalUsages: TotalUsages = await invoke("get_total_usages");
                setTotalUsages(fetchedTotalUsages);
            } catch (error) {
                console.error("Error fetching data:", error);
            }

        };

        fetchCpuData();
        const intervalId = setInterval(fetchCpuData, 1000);

        return () => clearInterval(intervalId);
    }, []);

    useEffect(() => {
        // Update chart data when cpuUsage prop changes
        if (chartInstance.current !== null) {
            updateChartData();
        }
    }, [cpuUsage]);

    const updateChartData = () => {
        if (chartInstance.current !== null) {
            chartInstance.current.data.labels?.push(((chartInstance.current.data.labels?.length ?? 0) + 1) + "s");
            chartInstance.current.data.datasets[0].data = cpuUsage;
            chartInstance.current.update();
        }
    };

    return (
        <div className="bg-gray-100 p-4 rounded-lg shadow-md">
            <Graph graphValue={cpuUsage}/>
            <p className="text-lg font-semibold">{cpuData.name}</p>
            <p>Cpu usage: {totalUsages ? totalUsages.cpu ?? 'N/a' : 'N/a'}%</p>
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
