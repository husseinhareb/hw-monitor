import React, { useState, useEffect, useRef } from 'react';
import { invoke } from "@tauri-apps/api/tauri";
import Chart from 'chart.js/auto';

interface NetworkUsages {
    download: number | null;
    upload: number | null;
}

const Network: React.FC = () => {
    const [networkUsages, setNetworkUsages] = useState<NetworkUsages>({ download: null, upload: null });
    const [download, setDownload] = useState<number[]>([]);
    const [upload, setupload] = useState<number[]>([]);
    const chartRef = useRef<HTMLCanvasElement | null>(null);
    const chartInstance = useRef<Chart<"line"> | null>(null);
    const [maxDownload, setMaxDownload] = useState<number | null>(null);


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
        if (networkUsages.download !== null) {
            setDownload(prevDownload => {
                const newDownload = [...prevDownload, networkUsages.download as number];
                const max = Math.max(...newDownload);
                setMaxDownload(max);
                return newDownload;
            });
        }
        if (networkUsages.upload !== null) {
            setupload(prevupload => [...prevupload, networkUsages.upload as number]);
        }
    }, [networkUsages]);


    useEffect(() => {
        if (chartRef.current !== null) {
            // Create chart instance
            const ctx = chartRef.current.getContext('2d');
            if (ctx !== null) { // Check if ctx is not null before creating the chart
                chartInstance.current = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: [],
                        datasets: [
                            {
                                label: 'Download',
                                data: download,
                                borderColor: 'rgb(75, 192, 192)',
                                tension: 0.1,
                                fill: true,
                                borderWidth: 1,
                                pointRadius: 0,
                                pointHoverRadius: 0
                            },
                            {
                                label: 'Upload',
                                data: upload,
                                borderColor: 'rgb(255, 99, 132)',
                                tension: 0.1,
                                fill: true,
                                borderWidth: 1,
                                pointRadius: 0,
                                pointHoverRadius: 0
                            }
                        ]
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
    }, [download,upload]);

    const updateChartData = () => {
        if (chartInstance.current !== null) {
            chartInstance.current.data.labels?.push(((chartInstance.current.data.labels?.length ?? 0) + 1) + "s");
            chartInstance.current.data.datasets[0].data = download;
            chartInstance.current.data.datasets[1].data = upload;
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
