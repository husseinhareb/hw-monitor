import { useState } from 'react';
import { invoke } from "@tauri-apps/api/core";
import useSensorsConfig from '../Sensors/useSensorsConfig';
import { usePaused, notify } from '../../services/store';
import useSerialPolling from '../useSerialPolling';

export interface BatteryData {
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
    useSerialPolling({
        enabled: !paused,
        interval: sensorsConfig.config.sensors_update_time,
        poll: () => invoke<BatteryData[]>("get_batteries"),
        onSuccess: (fetchedBatteryData) => {
            setBatteryData(fetchedBatteryData);
            setError(null);
        },
        onError: (err) => {
            console.error("Error fetching battery data:", err);
            notify('error.battery_failed');
            setError(String(err));
        },
    });

    return { batteries: batteryData, error };
};

export default useBatteryData;
