// src/hooks/Performance/usePerformanceTicker.ts
import { useState, useEffect } from 'react';
import usePerformanceConfig from './usePerformanceConfig';

export default function usePerformanceTicker(): number {
  const { config } = usePerformanceConfig();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setTick(t => t + 1);
    }, config.performance_update_time);
    return () => window.clearInterval(id);
  }, [config.performance_update_time]);

  return tick;
}
