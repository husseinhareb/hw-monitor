import React, { useState, useEffect, useRef } from "react";
import Chart from 'chart.js/auto';
import { invoke } from "@tauri-apps/api/tauri";

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
}

const Cpu: React.FC<CpuProps> = ({ cpuUsage }) => {
    const chartRef = useRef<HTMLCanvasElement | null>(null);
    const chartInstance = useRef<Chart<"line"> | null>(null);
    const [cpuData, setCpuData] = useState<CpuData>({ name: "Fetching CPU data...", cores: 0, threads: 0, cpu_speed: 0.0,base_speed: 0.0, max_speed: 0.0,virtualization: "enabled",socket: 0});
    const [totalUsages, setTotalUsages] = useState<TotalUsages>({ memory: null, cpu: null });

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
        if (chartRef.current !== null) {
            // Create chart instance
            const ctx = chartRef.current.getContext('2d');
            if (ctx !== null) { // Check if ctx is not null before creating the chart
                chartInstance.current = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: [],
                        datasets: [{
                            label: 'CPU Usage',
                            data: cpuUsage,
                            borderColor: 'rgb(75, 192, 192)',
                            tension: 0.1,
                            fill: true,
                            borderWidth: 1,
                            pointRadius: 0,
                            pointHoverRadius: 0
                        }]
                    },
                    options: {
                        scales: {
                            y: {
                                beginAtZero: true,
                                max: 100
                            }
                        }
                    }
                });
            }
        }

        return () => {
            // Cleanup chart instance
            if (chartInstance.current !== null) {
                chartInstance.current.destroy();
            }
        };
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
        <div>
            <canvas ref={chartRef} width={500} height={300}></canvas>
            <p>{cpuData.name}</p>
            <p>Cpu usage: {}%</p>
            <p> cores: {cpuData.cores}</p>
            <p>threads: {cpuData.threads}</p>
            <p>socket: {cpuData.socket}</p>
            <p>Cpu Speed: {cpuData.cpu_speed} GHz</p>
            <p>Base Speed: {cpuData.base_speed/1000000} GHz</p>
            <p>Base Speed: {cpuData.max_speed/1000000} GHz</p>
            <p>virtualization: {cpuData.virtualization}</p>
            <p>{totalUsages.processes}</p>
        </div>
    );
}

export default Cpu;
