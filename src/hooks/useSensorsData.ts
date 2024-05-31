import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";

interface SensorData {
  name: string;
  value: number;
  max: number;
  critical: number | null;
}

interface HwMonData {
  name: string;
  sensors: SensorData[];
}

const useSensorsData = (): HwMonData[] => {
  const [sensors, setSensors] = useState<HwMonData[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedSensorsData: HwMonData[] = await invoke("get_sensors");
        setSensors(fetchedSensorsData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
    const intervalId = setInterval(fetchData, 1000);

    return () => clearInterval(intervalId);
  }, []);

  return sensors;
};

export default useSensorsData;
