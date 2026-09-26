import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import usePerformanceConfig from '../../hooks/Performance/usePerformanceConfig';
import { useTick } from '../../services/store';

// NOTE: Each Graph instance creates a full Chart.js chart object. The sidebar
// renders one per metric (CPU, Memory, each GPU, each NIC, each disk) plus
// the detail pane chart. For systems with many devices this can mean 10-20+
// simultaneous Chart instances consuming significant memory. If performance
// becomes an issue, consider replacing sidebar mini-graphs with a lighter
// sparkline approach (e.g. inline SVG or a tiny canvas helper).

interface GraphProps {
  firstGraphValue: number[];
  secondGraphValue?: number[];
  maxValue?: number;
  height?: string;
  width?: string;
  updateInterval?: number;
  hideScales?: boolean;
  title?: string;
  /**
   * Formats raw series values for the y-axis ticks and tooltips. Series such as
   * network and disk throughput are raw byte/KB counts, which would otherwise
   * render as unreadable seven-digit tick labels.
   */
  formatValue?: (value: number) => string;
}

const MAX_POINTS = 20;
const EMPTY: number[] = [];

const Graph: React.FC<GraphProps> = ({
  firstGraphValue,
  secondGraphValue = EMPTY,
  maxValue,
  height = '100%',
  width = '80vw',
  updateInterval,
  hideScales = false,
  title,
  formatValue,
}) => {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart<'line'>>();
  const tick = useTick();
  const performanceConfig = usePerformanceConfig();

  // Read through a ref so a caller passing an inline formatter does not force
  // the chart options to be rebuilt on every render.
  const formatValueRef = useRef(formatValue);
  formatValueRef.current = formatValue;

  useEffect(() => {
    if (!chartRef.current) {
      return;
    }

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) {
      return;
    }

    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: [],
        datasets: [
          {
            label: '',
            data: [],
            fill: true,
            tension: 0.4,
            pointRadius: 0,
          },
          {
            label: '',
            data: [],
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
      },
    });

    return () => {
      chartInstance.current?.destroy();
      chartInstance.current = undefined;
    };
  }, []);

  useEffect(() => {
    const chart = chartInstance.current;
    if (!chart || !performanceConfig?.config) {
      return;
    }

    chart.options.scales = {
      y: {
        beginAtZero: true,
        max: maxValue,
        ticks: {
          display: !hideScales,
          callback: (value) => {
            const format = formatValueRef.current;
            if (!format) return value;
            const numeric = typeof value === 'number' ? value : Number(value);
            return Number.isFinite(numeric) ? format(numeric) : value;
          },
        },
        grid: {
          display: true,
          color: hideScales
            ? performanceConfig.config.performance_label_color + '1A'
            : undefined,
        },
        border: { display: !hideScales },
      },
      x: {
        ticks: { display: !hideScales },
        grid: {
          display: true,
          color: hideScales
            ? performanceConfig.config.performance_label_color + '1A'
            : undefined,
        },
        border: { display: !hideScales },
      },
    };
    chart.options.plugins = {
      ...chart.options.plugins,
      legend: { display: false },
      tooltip: {
        enabled: !hideScales,
        backgroundColor: '#000000b3',
        callbacks: {
          label: (item) => {
            const format = formatValueRef.current;
            return format ? format(item.parsed.y) : String(item.parsed.y);
          },
        },
      },
    };
    chart.data.datasets[0].borderColor = performanceConfig.config.performance_graph_color;
    chart.data.datasets[0].backgroundColor = performanceConfig.config.performance_graph_color + '33';
    chart.data.datasets[1].borderColor = performanceConfig.config.performance_sec_graph_color;
    chart.data.datasets[1].backgroundColor = performanceConfig.config.performance_sec_graph_color + '33';
    chart.update('none');
  }, [
    hideScales,
    maxValue,
    performanceConfig?.config.performance_graph_color,
    performanceConfig?.config.performance_label_color,
    performanceConfig?.config.performance_sec_graph_color,
  ]);

  useEffect(() => {
    const chart = chartInstance.current;
    if (!chart || !performanceConfig?.config) {
      return;
    }

    const firstSeries = firstGraphValue.slice(-MAX_POINTS);
    const secondSeries = secondGraphValue.slice(-MAX_POINTS);
    const pointCount = Math.max(firstSeries.length, secondSeries.length, 1);
    const intervalSec =
      (updateInterval ?? performanceConfig.config.performance_update_time) / 1000;

    // All graphs share the global tick so their rightmost label is always identical.
    // The tick counts CPU samples, so a series that got a sample before the first
    // CPU one can briefly hold more points than ticks; never label below 0s.
    const lastTick = Math.max(tick, pointCount - 1);
    chart.data.labels = Array.from(
      { length: pointCount },
      (_, index) => `${((lastTick - pointCount + index + 1) * intervalSec).toFixed(0)}s`,
    );
    chart.data.datasets[0].data = firstSeries;
    chart.data.datasets[1].data = secondSeries;
    chart.update('none');
  }, [
    tick,
    firstGraphValue,
    secondGraphValue,
    performanceConfig?.config.performance_update_time,
    updateInterval,
  ]);

  return (
    <div style={{ position: 'relative', height, width }}>
      <canvas ref={chartRef} role="img" aria-label={title} />
    </div>
  );
};

export default Graph;
