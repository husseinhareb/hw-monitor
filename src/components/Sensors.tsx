import React from "react";
import useSensorsData from "../hooks/useSensorsData";
import { Container, Title, SensorGrid, SensorGroup, SensorGroupName,SensorName,SensorList,SensorValue,SensorItem} from "../styles/sensors-style";

const Sensors: React.FC = () => {
  const sensors = useSensorsData();

  return (
    <Container>
      <Title>Sensors</Title>
      <SensorGrid>
        {sensors.map((hwmon) => (
          <SensorGroup key={hwmon.index}>
            <SensorGroupName>{hwmon.name}</SensorGroupName>
            <SensorList>
              {hwmon.sensors.map((sensor, idx) => (
                <SensorItem key={idx}>
                  <SensorName>{sensor.name}</SensorName>
                  <SensorValue>{sensor.value.toFixed(2)}°C</SensorValue>
                </SensorItem>
              ))}
            </SensorList>
          </SensorGroup>
        ))}
      </SensorGrid>
    </Container>
  );
};

export default Sensors;
