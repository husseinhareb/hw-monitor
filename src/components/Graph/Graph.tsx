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
  /** Legend names for the first and second series; the legend is hidden without them. */
  seriesLabels?: [string, string];
  /** Lowest y-axis top, so an idle series does not scale the axis down to fractions. */
  suggestedMax?: number;
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
  seriesLabels,
  suggestedMax,
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
        suggestedMax,
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
      legend: {
        display: !!seriesLabels && !hideScales,
        position: 'top',
        align: 'end',
        labels: {
          color: performanceConfig.config.performance_label_color,
          boxWidth: 12,
          boxHeight: 12,
        },
      },
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
    chart.data.datasets[0].label = seriesLabels?.[0] ?? '';
    chart.data.datasets[1].label = seriesLabels?.[1] ?? '';
    chart.data.datasets[0].borderColor = performanceConfig.config.performance_graph_color;
    chart.data.datasets[0].backgroundColor = performanceConfig.config.performance_graph_color + '33';
    chart.data.datasets[1].borderColor = performanceConfig.config.performance_sec_graph_color;
    chart.data.datasets[1].backgroundColor = performanceConfig.config.performance_sec_graph_color + '33';
    chart.update('none');
  }, [
    hideScales,
    maxValue,
    suggestedMax,
    seriesLabels?.[0],
    seriesLabels?.[1],
    performanceConfig?.config.performance_graph_color,
    performanceConfig?.config.performance_label_color,
    performanceConfig?.config.performance_sec_graph_color,
  ]);

  useEffect(() => {
    const chart = chartInstance.current;
    if (!chart || !performanceConfig?.config) {
      return;
    }

    const intervalSec =
      (updateInterval ?? performanceConfig.config.performance_update_time) / 1000;

    // Every graph gets the same MAX_POINTS slots ending at the shared tick, with a
    // short (still filling) series right-aligned. Labelling only the points a series
    // has made Chart.js skip to different ticks per graph. Slots before 0s stay blank.
    const fit = (series: number[]) => {
      const last = series.slice(-MAX_POINTS);
      return [...Array<null>(MAX_POINTS - last.length).fill(null), ...last];
    };
    chart.data.labels = Array.from({ length: MAX_POINTS }, (_, index) => {
      const at = tick - MAX_POINTS + 1 + index;
      return at < 0 ? '' : `${(at * intervalSec).toFixed(0)}s`;
    });
    chart.data.datasets[0].data = fit(firstGraphValue);
    chart.data.datasets[1].data = fit(secondGraphValue);
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
