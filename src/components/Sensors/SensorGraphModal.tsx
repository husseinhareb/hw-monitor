import React, { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import {
  GraphModalOverlay,
  GraphModalContent,
  GraphModalHeader,
  GraphModalTitle,
  GraphModalValue,
  GraphModalClose,
  GraphModalBody,
} from '../../styles/sensors-style';

const MAX_HISTORY = 60;

interface HistoryPoint {
  value: number;
}

interface Props {
  sensorName: string;
  unit: string;
  currentValue: number;
  pollTick: number;
  updateInterval: number;
  backgroundColor: string;
  foregroundColor: string;
  titleColor: string;
  onClose: () => void;
}

const SensorGraphModal: React.FC<Props> = ({
  sensorName,
  unit,
  currentValue,
  pollTick,
  updateInterval,
  backgroundColor,
  foregroundColor,
  titleColor,
  onClose,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart<'line'>>();
  const modalTickRef = useRef(0);
  const [history, setHistory] = useState<HistoryPoint[]>([]);

  // Append a new data point on every poll, even if the value didn't change
  useEffect(() => {
    modalTickRef.current += 1;
    setHistory(prev => [...prev, { value: currentValue }].slice(-MAX_HISTORY));
  // pollTick drives the cadence; currentValue is captured at that moment
  }, [pollTick]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // Init Chart.js
  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    chartRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          data: [],
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          borderWidth: 2,
          borderColor: '#09ffff',
          backgroundColor: '#09ffff1a',
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 200 },
        plugins: {
          legend: { display: false },
          tooltip: {
            enabled: true,
            backgroundColor: 'rgba(0,0,0,0.75)',
            callbacks: {
              label: (ctx) => ` ${ctx.parsed.y}${unit ? ` ${unit}` : ''}`,
            },
          },
        },
        scales: {
          y: {
            ticks: {
              color: 'rgba(255,255,255,0.45)',
              callback: (val) => `${val}${unit}`,
            },
            grid: { color: 'rgba(255,255,255,0.06)' },
            border: { display: false },
          },
          x: {
            ticks: {
              color: 'rgba(255,255,255,0.45)',
              maxTicksLimit: 8,
              maxRotation: 0,
            },
            grid: { color: 'rgba(255,255,255,0.06)' },
            border: { display: false },
          },
        },
      },
    });

    return () => {
      chartRef.current?.destroy();
      chartRef.current = undefined;
    };
  }, [unit]);

  // Update chart whenever history grows
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart || history.length === 0) return;

    const intervalSec = Math.max(1, Math.round(updateInterval / 1000));
    const tick = modalTickRef.current;
    const pointCount = history.length;
    chart.data.labels = history.map((_, i) =>
      `${((tick - pointCount + i + 1) * intervalSec).toFixed(0)}s`,
    );
    chart.data.datasets[0].data = history.map(pt => pt.value);
    chart.update('none');
  }, [history, updateInterval]);

  const displayValue = `${currentValue}${unit ? ` ${unit}` : ''}`;

  return (
    <GraphModalOverlay onClick={onClose}>
      <GraphModalContent $backgroundColor={backgroundColor} $color={foregroundColor} onClick={e => e.stopPropagation()}>
        <GraphModalHeader>
          <GraphModalTitle $color={titleColor} title={sensorName}>{sensorName}</GraphModalTitle>
          <GraphModalValue>{displayValue}</GraphModalValue>
          <GraphModalClose type="button" aria-label="Close" onClick={onClose}>
            &times;
          </GraphModalClose>
        </GraphModalHeader>
        <GraphModalBody>
          <canvas ref={canvasRef} />
        </GraphModalBody>
      </GraphModalContent>
    </GraphModalOverlay>
  );
};

export default SensorGraphModal;
