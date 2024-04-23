import React, { useEffect, useState, useRef } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import Chart from 'chart.js/auto';

interface NetworkUsages {
    interface: string,
    download: number | null,
    upload: number | null,
}

const Network: React.FC = () => {
    const [networkUsages, setNetworkUsages] = useState<NetworkUsages | null>(null);
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
        if (networkUsages && Array.isArray(networkUsages.download)) {
            const modifiedDownload: number[] = networkUsages.download.map(value => value > 1000 ? value / 1000 : value);
            setNetworkUsages(prevState => prevState ? {...prevState, download: modifiedDownload } : null);
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
                        datasets: [{
                            data: networkUsages?.download/1000,
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
                                max:3000
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
        if (chartInstance.current !== null && networkUsages) {
            updateChartData();
        }
    }, [networkUsages?.download]);

    const updateChartData = () => {
        if (chartInstance.current) {
            const labels = chartInstance.current.data.labels || [];
            chartInstance.current.data.labels = [...labels, `${labels.length + 1}s`];
            chartInstance.current.data.datasets[0].data = networkUsages?.download || [];
            chartInstance.current.update();
        }
    };

    return (
        <div>
            <canvas ref={chartRef} width={500} height={300}></canvas>
            <p>{networkUsages && networkUsages.download/100000}</p>
        </div>
    );
}

export default Network;
