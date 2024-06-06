import React, { useState, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

interface GraphProps {
    firstGraphValue: number[];
    secondGraphValue?: number[]; //Optional
    maxValue?: number; //Optional
}

const Graph: React.FC<GraphProps> = ({ firstGraphValue, secondGraphValue, maxValue }) => {
    const chartRef = useRef<HTMLCanvasElement | null>(null);
    const chartInstance = useRef<Chart<"line"> | null>(null);
    const [timeCounter, setTimeCounter] = useState(0);

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
                                data: firstGraphValue,
                                borderColor: 'rgb(75, 192, 192)',
                                backgroundColor: 'rgba(9, 255, 255, 0.2)', // Set background color
                                tension: 0.4,
                                fill: true,
                                borderWidth: 1,
                                pointRadius: 0,
                                pointHoverRadius: 0
                            },
                            {
                                data: secondGraphValue || [], // Handle undefined secondGraphValue
                                borderColor: 'rgb(255, 99, 132)',
                                backgroundColor: 'rgba(255, 99, 132, 0.2)', // Set background color
                                tension: 0.4,
                                fill: true,
                                borderWidth: 1,
                                pointRadius: 0,
                                pointHoverRadius: 0
                            }
                        ]
                    },
                    options: {
                        animation: {
                            duration: 0
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                max: maxValue,
                            }
                        },
                        plugins: {
                            legend: {
                                display: false
                            },
                            tooltip: {
                                backgroundColor: 'rgba(0, 0, 0, 0.7)', // Default to black background
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
        setTimeCounter(prevCounter => prevCounter + 1);
    
    }, [firstGraphValue, secondGraphValue]);

    const updateChartData = () => {
        if (chartInstance.current !== null) {
            const labels = chartInstance.current.data.labels;
            const firstValues = firstGraphValue.slice(-20);
            const secondValues = (secondGraphValue || []).slice(-20); // Handle undefined secondGraphValue

            labels?.push(timeCounter + "s");
            chartInstance.current.data.labels = labels?.slice(-20);
            chartInstance.current.data.datasets[0].data = firstValues;
            chartInstance.current.data.datasets[1].data = secondValues;

            chartInstance.current.update();
        }
    };

    return (
        <div>
            <canvas ref={chartRef} style={{'marginLeft': '7px'}}></canvas>
        </div>
    );
};

export default Graph;
