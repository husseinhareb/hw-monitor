// src/hooks/Performance/useDiskData.ts

import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/tauri';

export interface DiskRaw {
  name: string;
  read_speed: string;   // KB/s (as serialized from Rust)
  write_speed: string;  // KB/s
  total_read: number;   // bytes
  total_write: number;  // bytes
}

interface Hist {
  readHistory: number[];
  writeHistory: number[];
  total_read: number;
  total_write: number;
}

export default function useDiskData(updateInterval: number) {
  const [historyMap, setHistoryMap] = useState<Record<string, Hist>>({});

  useEffect(() => {
    let cancelled = false;

    async function fetchOnce() {
      // Invoke the Tauri command and get back the raw disk info
      const raw: DiskRaw[] = (await invoke('get_disks')) as DiskRaw[];
      if (cancelled) return;

      setHistoryMap(prev => {
        const next = { ...prev };

        raw.forEach(d => {
          // Pull out the previous history, or start fresh if none exists
          const prevHist = prev[d.name] || {
            readHistory: [],
            writeHistory: [],
            total_read: 0,
            total_write: 0,
          };

          // Parse the KB/s strings into floats
          const readSpeed  = parseFloat(d.read_speed);
          const writeSpeed = parseFloat(d.write_speed);

          next[d.name] = {
            // Append the new sample, but keep only the last 100 points
            readHistory:  [...prevHist.readHistory,  readSpeed].slice(-100),
            writeHistory: [...prevHist.writeHistory, writeSpeed].slice(-100),
            total_read:   d.total_read,
            total_write:  d.total_write,
          };
        });

        return next;
      });
    }

    // Initial fetch
    fetchOnce();
    // Then poll at the given interval
    const id = window.setInterval(fetchOnce, updateInterval);

    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [updateInterval]);

  return historyMap;
}
