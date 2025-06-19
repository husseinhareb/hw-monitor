// src/components/Graph/Graph.tsx

import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import usePerformanceConfig from '../../hooks/Performance/usePerformanceConfig';

interface GraphProps {
  /** Shared tick from parent to synchronize updates */
  tick: number;
  /** Primary data series */
  firstGraphValue: number[];
  /** Secondary data series */
  secondGraphValue?: number[];
  /** Y-axis max value */
  maxValue?: number;
  /** Optional height/style */
  height?: string;
  width?: string;
}

const MAX_POINTS = 20;

const Graph: React.FC<GraphProps> = ({
  tick,
  firstGraphValue,
  secondGraphValue = [],
  maxValue,
  height = '40vh',
  width = '80vw',
}) => {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart<'line'>>()
  const performanceConfig = usePerformanceConfig();

  // Initialize chart once
  useEffect(() => {
    if (!chartRef.current || !performanceConfig?.config) return;
    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: [],
        datasets: [
          {
            label: '',
            data: [],
            borderColor: performanceConfig.config.performance_graph_color,
            backgroundColor: performanceConfig.config.performance_graph_color + '33',
            fill: true,
            tension: 0.4,
            pointRadius: 0,
          },
          {
            label: '',
            data: [],
            borderColor: performanceConfig.config.performance_sec_graph_color,
            backgroundColor: performanceConfig.config.performance_sec_graph_color + '33',
            fill: true,
            tension: 0.4,
            pointRadius: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 0 },
        scales: {
          y: { beginAtZero: true, max: maxValue },
        },
        plugins: {
          legend: { display: false },
          tooltip: { backgroundColor: '#000000b3' },
        },
      },
    });

    return () => {
      chartInstance.current?.destroy();
    };
  }, [performanceConfig?.config.performance_graph_color, performanceConfig?.config.performance_sec_graph_color, maxValue]);

  // Update chart on each tick
  useEffect(() => {
    const chart = chartInstance.current;
    if (!chart) return;

    // Push new label based on tick and interval
    const intervalSec = performanceConfig.config.performance_update_time / 1000;
    const label = `${tick * intervalSec}s`;

    chart.data.labels = [...(chart.data.labels || []).slice(-MAX_POINTS + 1), label];
    chart.data.datasets[0].data = [...firstGraphValue.slice(-MAX_POINTS)];
    chart.data.datasets[1].data = [...secondGraphValue.slice(-MAX_POINTS)];

    chart.update('none');
  }, [tick, firstGraphValue, secondGraphValue, performanceConfig.config.performance_update_time]);

  return (
    <div style={{ position: 'relative', height, width }}>
      <canvas ref={chartRef} />
    </div>
  );
};

export default Graph;
