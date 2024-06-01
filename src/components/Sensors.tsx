import React from "react";
//import useSensorsData from "../hooks/useSensorsData";
import {
  Container,
  Title,
  SensorGrid,
  SensorList,

} from "../styles/sensors-style";
import Battery from "./Battery";

const Sensors: React.FC = () => {
  //const sensors = useSensorsData();

  return (
    <Container>
      <Title>Sensors</Title>
      <SensorGrid>
        <SensorList>
          <Battery />
        </SensorList>
      </SensorGrid>
    </Container>
  );
};

export default Sensors;
