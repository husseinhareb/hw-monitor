import React from "react";
import useSensorsData from "../hooks/useSensorsData";
import {
  Container,
  Title,
  SensorGrid,
  SensorGroup,
  SensorGroupName,
  SensorName,
  SensorList,
  SensorValue,
  SensorItem
} from "../styles/sensors-style";

const Sensors: React.FC = () => {
  const sensors = useSensorsData();

  return (
    <Container>
      <Title>Sensors</Title>
      <SensorGrid>
        {sensors.map((hwmon, index) => (
          <SensorGroup key={index}>
            <SensorGroupName>{hwmon.name}</SensorGroupName>
            <SensorList>
              {hwmon.sensors.map((sensor, idx) => (
                <SensorItem key={idx}>
                  <SensorName>{sensor.name}</SensorName>
                  <SensorValue>Current: {sensor.value.toFixed(2)}°C</SensorValue>
                  <SensorValue>Max: {sensor.max.toFixed(2)}°C</SensorValue>
                  {sensor.critical !== null && (
                    <SensorValue>Critical: {sensor.critical.toFixed(2)}°C</SensorValue>
                  )}
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
