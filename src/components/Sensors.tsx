import React, { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";

interface SensorData {
  name: String;
  value: number;
}

interface HwMonData {
  index: number;
  name: String;
  sensors: SensorData[];
}

const Sensors: React.FC = () => {
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

  return (
    <div>
      <h1>Sensors</h1>
      {sensors.map((hwmon) => (
        <div key={hwmon.index}>
          <h2>{hwmon.name}</h2>
          <ul>
            {hwmon.sensors.map((sensor, idx) => (
              <li key={idx}>
                {sensor.name}: {sensor.value.toFixed(2)}°C
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default Sensors;
