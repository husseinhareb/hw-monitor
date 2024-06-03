import React from 'react';
import {
  Container,
  Title,
  SensorGrid,
  SensorList,
} from '../../styles/sensors-style';
import Battery from '../Sensors/BatterySensors';
import CpuSensors from '../Sensors/CpuSensors';

const Sensors: React.FC = () => {
  return (
    <Container>
      <Title>Sensors</Title>
      <SensorGrid>
        <SensorList>
          <Battery />
        </SensorList>
        <SensorList>
          <CpuSensors />
        </SensorList>
      </SensorGrid>
    </Container>
  );
};

export default Sensors;
