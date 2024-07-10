//graph.tsx
import React, { useState, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import usePerformanceConfig from '../hooks/usePerformanceConfig';

interface GraphProps {
    firstGraphValue: number[];
    secondGraphValue?: number[];
    maxValue?: number;
    height?: string; // Optional 
    width?: string;  // Optional 
}

const Graph: React.FC<GraphProps> = ({ firstGraphValue, secondGraphValue, maxValue, height = '40vh', width = '80vw' }) => {
    const chartRef = useRef<HTMLCanvasElement | null>(null);
    const chartInstance = useRef<Chart<"line"> | null>(null);
    const [timeCounter, setTimeCounter] = useState(0);

    const performanceConfig = usePerformanceConfig();
    useEffect(() => {
        if (chartRef.current !== null && performanceConfig?.config) {
            const ctx = chartRef.current.getContext('2d');
            if (ctx !== null) {
                chartInstance.current = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: [],
                        datasets: [
                            {
                                data: firstGraphValue,
                                borderColor: performanceConfig.config.performance_graph_color,
                                backgroundColor: performanceConfig.config.performance_graph_color + "33",
                                tension: 0.4,
                                fill: true,
                                borderWidth: 1,
                                pointRadius: 0,
                                pointHoverRadius: 0
                            },
                            {
                                data: secondGraphValue || [],
                                borderColor: performanceConfig.config.performance_sec_graph_color,
                                backgroundColor: performanceConfig.config.performance_sec_graph_color  + "33",
                                tension: 0.4,
                                fill: true,
                                borderWidth: 1,
                                pointRadius: 0,
                                pointHoverRadius: 0
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
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
                                backgroundColor: '#000000b3',
                            }
                        }
                    }
                });
            }
        }
    
        return () => {
            if (chartInstance.current !== null) {
                chartInstance.current.destroy();
            }
        };
    }, [performanceConfig?.config.performance_graph_color, performanceConfig?.config.performance_sec_graph_color]);
    
    

    useEffect(() => {
        if (chartInstance.current !== null) {
            updateChartData();
        }
        setTimeCounter(prevCounter => prevCounter + 1* Math.floor(performanceConfig.config.performance_update_time/1000));
    }, [firstGraphValue, secondGraphValue]);

    const updateChartData = () => {
        if (chartInstance.current !== null) {
            const labels = chartInstance.current.data.labels;
            const firstValues = firstGraphValue.slice(-20);
            const secondValues = (secondGraphValue || []).slice(-20);

            labels?.push(timeCounter + "s");
            chartInstance.current.data.labels = labels?.slice(-20);
            chartInstance.current.data.datasets[0].data = firstValues;
            chartInstance.current.data.datasets[1].data = secondValues;

            chartInstance.current.update();
        }
    };

    return (
        <div style={{ position: 'relative', height, width}}>
            <canvas ref={chartRef}></canvas>
        </div>
    );
};

export default Graph;
