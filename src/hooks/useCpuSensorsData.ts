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

const useCpuSensorsData = (): HwMonData[] => {
    const [cpuSensorsData, setCpuSensorsData] = useState<HwMonData[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const fetchedCpuSensorsData: HwMonData[] = await invoke("get_cpu_sensors");
                setCpuSensorsData(fetchedCpuSensorsData);
                console.log(fetchedCpuSensorsData);
            } catch (error) {
                console.error("Error fetching sensor data:", error);
            }
        };

        fetchData();
        const intervalId = setInterval(fetchData, 5000);

        return () => clearInterval(intervalId);
    }, []);

    return cpuSensorsData;
};

export default useCpuSensorsData;
