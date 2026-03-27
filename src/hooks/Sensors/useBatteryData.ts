import { useState, useEffect } from 'react';
import { invoke } from "@tauri-apps/api/core";
import useSensorsConfig from '../Sensors/useSensorsConfig';
import { usePaused } from '../../services/store';

interface BatteryData {
    model: string | null;
    state: string;
    cycle_count: number | null;
    energy: number; // in Wh
    time_to_full: number | null; // in minutes
    technology: string;
    time_to_empty: number | null; // in minutes
    temperature: number | null; // in Celsius
    state_of_health: number; 
    percentage: number,
}

const useBatteryData = (): { batteries: BatteryData[]; error: string | null } => {
    const [batteryData, setBatteryData] = useState<BatteryData[]>([]);
    const [error, setError] = useState<string | null>(null);
    const sensorsConfig = useSensorsConfig();
    const paused = usePaused();
    useEffect(() => {
        if (paused) return;
        const fetchData = async () => {
            try {
                const fetchedBatteryData: BatteryData[] = await invoke("get_batteries");
                setBatteryData(fetchedBatteryData);
                setError(null);
            } catch (err) {
                console.error("Error fetching battery data:", err);
                setError(String(err));
            }
        };

        fetchData();
        const intervalId = setInterval(fetchData, sensorsConfig.config.sensors_update_time);

        return () => clearInterval(intervalId);
    }, [sensorsConfig.config.sensors_update_time, paused]);

    return { batteries: batteryData, error };
};

export default useBatteryData;
