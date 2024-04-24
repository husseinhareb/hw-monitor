import React, { useState, useEffect, useRef } from 'react';
import { invoke } from "@tauri-apps/api/tauri";
import Chart from 'chart.js/auto';

interface NetworkUsages {
    download: number | null;
    upload: number | null;
}

const Network: React.FC = () => {
    const [NetworkUsages, setNetworkUsages] = useState<NetworkUsages>({ download: null, upload: null });
    const [download, setdownload] = useState<number[]>([]);
    const [upload, setupload] = useState<number[]>([]);
    const chartRef = useRef<HTMLCanvasElement | null>(null);
    const chartInstance = useRef<Chart<"line"> | null>(null);



    useEffect(() => {
        const fetchData = async () => {
            try {
                const fetchedNetworkUsages: NetworkUsages = await invoke("get_network");
                setNetworkUsages(fetchedNetworkUsages);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
        const intervalId = setInterval(fetchData, 1000);

        return () => clearInterval(intervalId);
    }, []);

    useEffect(() => {
        if (NetworkUsages.download !== null) {
            setdownload(prevdownload => [...prevdownload, NetworkUsages.download as number]);
        }
        if (NetworkUsages.upload !== null) {
            setupload(prevupload => [...prevupload, NetworkUsages.upload as number]);
        }
    }, [NetworkUsages]);


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
                            data: download,
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
        // Update chart data when graphValue prop changes
        if (chartInstance.current !== null) {
            updateChartData();
        }
    }, [download]);

    const updateChartData = () => {
        if (chartInstance.current !== null) {
            chartInstance.current.data.labels?.push(((chartInstance.current.data.labels?.length ?? 0) + 1) + "s");
            chartInstance.current.data.datasets[0].data = download;
            chartInstance.current.update();
        }
    };
    return (
        <div>
            <canvas ref={chartRef} width={500} height={300}></canvas>
        </div>
    );
};

export default Network;
