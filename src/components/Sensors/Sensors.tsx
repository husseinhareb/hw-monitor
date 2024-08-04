import React from 'react';
import {
  Container,
  Title,
  SensorGrid,
  SensorList,
  SensorName,
  SensorGroup,
  SensorItem,
  ContentDiv,
} from '../../styles/sensors-style';
import useSensorsData from '../../hooks/Sensors/useSensorsData';
import Battery from '../Sensors/Battery';
import HeatBar from '../Sensors/HeatBar';
import useSensorsConfig from '../../hooks/Sensors/useSensorsConfig';
import useBatteryData from '../../hooks/Sensors/useBatteryData';
import { useTranslation } from 'react-i18next';

const Sensors: React.FC = () => {
  const sensors = useSensorsData();
  const battery = useBatteryData();
  const { t } = useTranslation();
  // Filter out sensors with no sensor values
  const filteredSensors = sensors.filter(hwmon => hwmon.sensors.length > 0);

  // Sort sensors by the number of sensors in descending order
  const sortedSensors = filteredSensors.sort((a, b) => b.sensors.length - a.sensors.length);

  const sensorsConfig = useSensorsConfig();
  return (
    <Container
      sensorsBackgroundColors={sensorsConfig.config.sensors_background_color}
    >
      <Title sensorsForegroundColor={sensorsConfig.config.sensors_foreground_color}>{t('sensors.title')}</Title>
      <SensorGrid>
        {battery.length > 0 && <SensorList
          sensorsBoxesBackgroundColor={sensorsConfig.config.sensors_boxes_background_color}
        >
          <Battery />
        </SensorList>}
        {sortedSensors.map((hwmon, index) => (
          <SensorList
            key={index}
            sensorsBoxesBackgroundColor={sensorsConfig.config.sensors_boxes_background_color}
          >
            <SensorGroup>
              <SensorName sensorsBoxesTitleForegroundColor={sensorsConfig.config.sensors_boxes_title_foreground_color}>{hwmon.name}</SensorName>
              <ContentDiv>
                {hwmon.sensors.map((sensor, idx) => (
                  <SensorItem
                  sensorsGroupForegroundColor={sensorsConfig.config.sensors_boxes_foreground_color}
                  key={idx}>

                    {sensor.name}: {sensor.value.toFixed(2)}°C
                    <HeatBar value={sensor.value} critical={sensor.critical ? sensor.critical : 100} />
                  </SensorItem>
                ))}
              </ContentDiv>
            </SensorGroup>
          </SensorList>
        ))}
      </SensorGrid>
    </Container>
  );
};

export default Sensors;
