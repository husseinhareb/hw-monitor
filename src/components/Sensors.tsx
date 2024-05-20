import React from "react";
import useSensorsData from "../hooks/useSensorsData";

const Sensors: React.FC = () => {
  const sensors = useSensorsData();

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
