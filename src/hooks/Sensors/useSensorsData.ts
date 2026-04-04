import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import useSensorsConfig from "../Sensors/useSensorsConfig";
import { usePaused } from "../../services/store";

interface SensorData {
  name: string;
  value: number;
  critical: number | null;
}

interface HwMonData {
  name: string;
  sensors: SensorData[];
}

const useSensorsData = (): HwMonData[] => {
  const [sensors, setSensors] = useState<HwMonData[]>([]);
  const sensorsConfig = useSensorsConfig();
  const paused = usePaused();

  useEffect(() => {
    if (paused) return;
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
  }, [sensorsConfig.config.sensors_update_time, paused]);

  return sensors;
};

export default useSensorsData;
