import React, { useState, useEffect, useRef } from "react";
import Chart from 'chart.js/auto';
import { invoke } from "@tauri-apps/api/tauri";

function Cpu({ cpuUsage }) {
    const chartRef = useRef(null);
    const chartInstance = useRef(null);
    const [cpuData, setCpuData] = useState({ name: "Fetching CPU data..." }); // Initial value for cpuData

    const fetchCpuData = async () => {
        try {
            const fetchedCpuData = await invoke("get_cpu_informations");
            setCpuData(fetchedCpuData);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    useEffect(() => {
        fetchCpuData(); 
    }, []);

    useEffect(() => {
        if (chartRef.current !== null) {
            // Create chart instance
            const ctx = chartRef.current.getContext('2d');
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
        chartInstance.current.data.labels.push((chartInstance.current.data.labels.length + 1) + "s");
        chartInstance.current.data.datasets[0].data = cpuUsage;
        chartInstance.current.update();
    };

    return (
        <div>
            <canvas ref={chartRef} width={500} height={300}></canvas>
            <p>{cpuData.name}</p> 
            <p> cores: {cpuData.cores}</p>
        </div>
    );
}

export default Cpu;
