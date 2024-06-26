import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import useSensorsConfig from "./useSensorsConfig";

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
  const sensorsConfig = useSensorsConfig();

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
    const intervalId = setInterval(fetchData, sensorsConfig.config.sensors_update_time);

    return () => clearInterval(intervalId);
  }, []);

  return sensors;
};

export default useSensorsData;
