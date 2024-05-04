import React, { useState, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

interface GraphProps {
    firstGraphValue: number[];
    secondGraphValue: number[];
    maxValue: number;
}
const Graph: React.FC<GraphProps> = ({firstGraphValue,secondGraphValue,maxValue}) => {
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
                                tension: 0.1,
                                fill: true,
                                borderWidth: 1,
                                pointRadius: 0,
                                pointHoverRadius: 0
                            },
                            {
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
                                max: maxValue,
                            }
                        },
                        plugins: {
                            legend: {
                                display: false
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

    useEffect(() => {
        // Increment time counter only when there's a new value received in firstGraphValue
        setTimeCounter(prevCounter => prevCounter + 1);
    }, [firstGraphValue]);


    const updateChartData = () => {
        if (chartInstance.current !== null && secondGraphValue !== undefined) {
            const labels = chartInstance.current.data.labels;
            const firstValues = firstGraphValue.slice(-20); // Take only the last 20 elements
            const secondValues = secondGraphValue.slice(-20); // Take only the last 20 elements

            // Update labels and dataset values
            labels?.push(timeCounter + "s"); // Use time counter instead of length
            chartInstance.current.data.labels = labels?.slice(-20); // Take only the last 20 labels
            chartInstance.current.data.datasets[0].data = firstValues;
            chartInstance.current.data.datasets[1].data = secondValues;

            // Update chart
            chartInstance.current.update();
        }
    };


    
    
    
    return (
        <div>
            <canvas ref={chartRef} width={500} height={300}></canvas>
        </div>
    );
};

export default Graph;