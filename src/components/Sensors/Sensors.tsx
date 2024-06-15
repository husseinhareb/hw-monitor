import React from 'react';
import {
  Container,
  Title,
  SensorGrid,
  SensorList,
  SensorName,
} from '../../styles/sensors-style';
import useSensorsData from '../../hooks/useSensorsData';
import Battery from './Battery';
import { Item, ContentDiv } from '../../styles/battery-style';

const Sensors: React.FC = () => {
  const sensors = useSensorsData();

  // Filter out sensors with no sensor values
  const filteredSensors = sensors.filter(hwmon => hwmon.sensors.length > 0);

  // Sort sensors by the number of sensors in descending order
  const sortedSensors = filteredSensors.sort((a, b) => b.sensors.length - a.sensors.length);

  return (
    <Container>
      <Title>Sensors</Title>
      <SensorGrid>
        <SensorList>
          <Battery />
        </SensorList>
        {sortedSensors.map((hwmon, index) => (
          <SensorList key={index}>
            <SensorName>{hwmon.name}</SensorName>
            <ContentDiv>
              {hwmon.sensors.map((sensor, idx) => (
                <Item key={idx}>
                  {sensor.name}: {sensor.value.toFixed(2)}°C
                </Item>
              ))}
            </ContentDiv>
          </SensorList>
        ))}
      </SensorGrid>
    </Container>
  );
};

export default Sensors;
