import React, { useMemo } from 'react';
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
  const batteryState = useBatteryData();
  const { t } = useTranslation();

  const sortedSensors = useMemo(() => {
    return sensors
      .filter(hwmon => hwmon.sensors.length > 0)
      .sort((a, b) => b.sensors.length - a.sensors.length);
  }, [sensors]);

  const sensorsConfig = useSensorsConfig();
  return (
    <Container
      sensorsBackgroundColors={sensorsConfig.config.sensors_background_color}
    >
      <Title sensorsForegroundColor={sensorsConfig.config.sensors_foreground_color}>{t('sensors.title')}</Title>
      <SensorGrid>
        {(batteryState.error || batteryState.batteries.length > 0) && <SensorList
          sensorsBoxesBackgroundColor={sensorsConfig.config.sensors_boxes_background_color}
        >
          <Battery batteries={batteryState.batteries} error={batteryState.error} />
        </SensorList>}
        {sortedSensors.map((hwmon) => (
          <SensorList
            key={hwmon.index}
            sensorsBoxesBackgroundColor={sensorsConfig.config.sensors_boxes_background_color}
          >
            <SensorGroup>
              <SensorName sensorsBoxesTitleForegroundColor={sensorsConfig.config.sensors_boxes_title_foreground_color}>{hwmon.name}</SensorName>
              <ContentDiv>
                {hwmon.sensors.map((sensor) => (
                  <SensorItem
                  sensorsGroupForegroundColor={sensorsConfig.config.sensors_boxes_foreground_color}
                  key={`${hwmon.index}-${sensor.name}`}>

                    {sensor.name}: {sensor.sensor_type === 'fan'
                      ? `${Math.round(sensor.value)} ${sensor.unit}`
                      : `${sensor.value.toFixed(2)}${sensor.unit}`}
                    {sensor.sensor_type === 'temperature' && (
                      <HeatBar value={sensor.value} critical={sensor.critical ? sensor.critical : 100} />
                    )}
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
