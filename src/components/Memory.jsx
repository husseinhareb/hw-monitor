import React, { useState, useEffect, useRef } from "react";
import Chart from 'chart.js/auto';
import { invoke } from "@tauri-apps/api/tauri";

function Memory({ memoryUsage }) {
    const chartRef = useRef(null);
    const chartInstance = useRef(null);
   // const [MemoryData, setMemoryData] = useState({ name: "Fetching Memory data..." }); // Initial value for MemoryData

   /* const fetchMemoryData = async () => {
        try {
            const fetchedMemoryData = await invoke("get_Memory_informations");
            setMemoryData(fetchedMemoryData);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    useEffect(() => {
        fetchMemoryData(); 
    }, []);
*/
    useEffect(() => {
        if (chartRef.current !== null) {
            // Create chart instance
            const ctx = chartRef.current.getContext('2d');
            chartInstance.current = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'Memory Usage',
                        data: memoryUsage,
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
        // Update chart data when memoryUsage prop changes
        if (chartInstance.current !== null) {
            updateChartData();
        }
    }, [memoryUsage]);

    const updateChartData = () => {
        chartInstance.current.data.labels.push((chartInstance.current.data.labels.length + 1) + "s");
        chartInstance.current.data.datasets[0].data = memoryUsage;
        chartInstance.current.update();
    };

    return (
        <div>
            <canvas ref={chartRef} width={500} height={300}></canvas>
        </div>
    );
}

export default Memory;
