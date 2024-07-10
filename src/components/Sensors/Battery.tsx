//Battery.tsx
import React from 'react';
import useBatteryData from '../../hooks/Sensors/useBatteryData';
import {  Design, DesignDiv, ContentDiv,Item } from '../../styles/battery-style';
import { SensorGroup, SensorName} from '../../styles/sensors-style';
import useSensorsConfig from '../../hooks/useSensorsConfig';

const Battery: React.FC = () => {
    const batteries = useBatteryData();
    const sensorsConfig = useSensorsConfig();

    return (
        <>
            {batteries.length > 0 ? (
                batteries.map((battery, index) => (
                    <SensorGroup key={index}>
                        <SensorName sensorsBoxesTitleForegroundColor={sensorsConfig.config.sensors_boxes_title_foreground_color}>Battery {index + 1}</SensorName>
                        <div style={{ display: 'flex' }}>
                            <DesignDiv>
                                <Design 
                                percentage={battery.percentage}
                                sensorsBatteryBackgroundColor={sensorsConfig.config.sensors_battery_background_color}
                                sensorsBatteryFrameColor={sensorsConfig.config.sensors_battery_frame_color}
                                 />
                            </DesignDiv>
                            <ContentDiv>
                                {battery.percentage && <Item sensorsGroupForegroundColor={sensorsConfig.config.sensors_boxes_foreground_color}><p>Percentage: {battery.percentage}%</p></Item>}
                                {battery.model && <Item sensorsGroupForegroundColor={sensorsConfig.config.sensors_boxes_foreground_color}><p>Model: {battery.model}</p></Item>}
                                {battery.state && <Item sensorsGroupForegroundColor={sensorsConfig.config.sensors_boxes_foreground_color}><p>State: {battery.state}</p></Item>}
                                {battery.cycle_count && <Item sensorsGroupForegroundColor={sensorsConfig.config.sensors_boxes_foreground_color}><p>Cycle Count: {battery.cycle_count}</p></Item>}
                                {battery.energy && <Item sensorsGroupForegroundColor={sensorsConfig.config.sensors_boxes_foreground_color}><p>Energy: {battery.energy} Wh</p></Item>}
                                {battery.time_to_full && <Item sensorsGroupForegroundColor={sensorsConfig.config.sensors_boxes_foreground_color}><p>Time to Full: {battery.time_to_full} minutes</p></Item>}
                                {battery.technology && <Item sensorsGroupForegroundColor={sensorsConfig.config.sensors_boxes_foreground_color}><p>Technology: {battery.technology}</p></Item>}
                                {battery.time_to_empty && <Item sensorsGroupForegroundColor={sensorsConfig.config.sensors_boxes_foreground_color}><p>Time to Empty: {battery.time_to_empty} minutes</p></Item>}
                                {battery.temperature && <Item sensorsGroupForegroundColor={sensorsConfig.config.sensors_boxes_foreground_color}><p>Temperature: {battery.temperature} °C</p></Item>}
                                {battery.state_of_health && <Item sensorsGroupForegroundColor={sensorsConfig.config.sensors_boxes_foreground_color}><p>State of Health: {battery.state_of_health}%</p></Item>}
                            </ContentDiv>

                        </div>
                    </SensorGroup>
                ))
            ) : (
                <p>Loading battery data...</p>
            )}
        </>
    );
};

export default Battery;