import { useState, useEffect } from 'react';
import { invoke } from "@tauri-apps/api/tauri";

interface SensorData {
    name: string;
    value: number;
    max: number;
    critical?: number;
}

interface HwMonData {
    name: string;
    sensors: SensorData[];
}

const useDiskSensorsData = (): HwMonData[] => {
    const [DiskSensorsData, setDiskSensorsData] = useState<HwMonData[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const fetchedDiskSensorsData: HwMonData[] = await invoke("get_disk_sensors");
                setDiskSensorsData(fetchedDiskSensorsData);
                console.log(fetchedDiskSensorsData);
            } catch (error) {
                console.error("Error fetching sensor data:", error);
            }
        };

        fetchData();
        const intervalId = setInterval(fetchData, 5000);

        return () => clearInterval(intervalId);
    }, []);

    return DiskSensorsData;
};

export default useDiskSensorsData;
