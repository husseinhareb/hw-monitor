import { useState, useEffect } from 'react';
import { invoke } from "@tauri-apps/api/tauri";

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

const useBatteryData = (): BatteryData[] => {
    const [batteryData, setBatteryData] = useState<BatteryData[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const fetchedBatteryData: BatteryData[] = await invoke("get_batteries");
                setBatteryData(fetchedBatteryData);
            } catch (error) {
                console.error("Error fetching battery data:", error);
            }
        };

        fetchData();
        const intervalId = setInterval(fetchData, 5000);

        return () => clearInterval(intervalId);
    }, []);

    return batteryData;
};

export default useBatteryData;
