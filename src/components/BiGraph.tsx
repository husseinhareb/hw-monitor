import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

interface BiGraphProps {
    firstGraphValue: number[];
    secondGraphValue: number[];
}

const BiGraph: React.FC<BiGraphProps> = ({firstGraphValue,secondGraphValue}) => {
    const chartRef = useRef<HTMLCanvasElement | null>(null);
    const chartInstance = useRef<Chart<"line"> | null>(null);

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
                                label: 'firstGraphValue',
                                data: firstGraphValue,
                                borderColor: 'rgb(75, 192, 192)',
                                tension: 0.1,
                                fill: true,
                                borderWidth: 1,
                                pointRadius: 0,
                                pointHoverRadius: 0
                            },
                            {
                                label: 'secondGraphValue',
                                data: secondGraphValue,
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
    }, [firstGraphValue,secondGraphValue]);

    const updateChartData = () => {
        if (chartInstance.current !== null) {
            chartInstance.current.data.labels?.push(((chartInstance.current.data.labels?.length ?? 0) + 1) + "s");
            chartInstance.current.data.datasets[0].data = firstGraphValue;
            chartInstance.current.data.datasets[1].data = secondGraphValue;
            chartInstance.current.update();
        }
    };
    return (
        <div>
            <canvas ref={chartRef} width={500} height={300}></canvas>
        </div>
    );
};

export default BiGraph;
