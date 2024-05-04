import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

interface GraphProps {
    firstGraphValue: number[];
    secondGraphValue?: number[];
    maxValue: number;
}

const Graph: React.FC<GraphProps> = ({ firstGraphValue, secondGraphValue, maxValue }) => {
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
                                max: maxValue,
                            }
                        },
                        plugins: {
                            legend: {
                                display: false // Hide the legend
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
    }, [firstGraphValue, secondGraphValue]);

    const updateChartData = () => {
        if (chartInstance.current !== null) {
            const maxDataPoints = 20; // Maximum number of data points to display
    
            // Ensure firstGraphValue is defined and an array before proceeding
            if (Array.isArray(firstGraphValue)) {
                // Calculate the start time based on the current length of labels array
                let startTime = chartInstance.current.data.labels?.length ?? 0;
    
                // Add new data points
                chartInstance.current.data.labels?.push(((startTime + 1) + "s"));
                chartInstance.current.data.datasets[0].data = firstGraphValue.slice(-maxDataPoints);
            }
            
            // Ensure secondGraphValue is defined and an array before proceeding
            if (Array.isArray(secondGraphValue)) {
                chartInstance.current.data.datasets[1].data = secondGraphValue.slice(-maxDataPoints);
            }
    
            // Remove excess data points if necessary
            if (chartInstance.current.data.labels?.length > maxDataPoints) {
                chartInstance.current.data.labels.shift();
                chartInstance.current.data.datasets.forEach(dataset => {
                    dataset.data.shift();
                });
            }
    
            // Update time labels
            chartInstance.current.data.labels = chartInstance.current.data.labels.map((label, index) => {
                return ((index + 1) + "s");
            });
    
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