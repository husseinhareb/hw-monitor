import React from "react";
//import useSensorsData from "../hooks/useSensorsData";
import {
  Container,
  Title,
  SensorGrid,
  SensorList,

} from "../../styles/sensors-style";
import Battery from "../Sensors/Battery";
import CpuSensors from "../Sensors/CpuSensors";

const Sensors: React.FC = () => {
  //const sensors = useSensorsData();

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
