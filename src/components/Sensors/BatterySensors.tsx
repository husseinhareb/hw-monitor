// BatterySensors.ts
import React from 'react';
import useBatteryData from '../../hooks/useBatteryData';
import { Design, DesignDiv, ContentDiv, BatteryItem, Frame } from '../../styles/battery-style';
import { SensorGroup, SensorName } from '../../styles/sensors-style';

const Battery: React.FC = () => {
    const batteries = useBatteryData();

    return (
        <>
            {batteries.length > 0 ? (
                batteries.map((battery, index) => (
                    <SensorGroup key={index}>
                        <SensorName>Battery {index + 1}</SensorName>
                        <div style={{ display: 'flex' }}>
                            <DesignDiv>
                                <Frame>
                                    <Design percentage={battery.percentage} />
                                </Frame>
                            </DesignDiv>
                            <ContentDiv>
                                {battery.percentage && <BatteryItem>Percentage: {battery.percentage}%</BatteryItem>}
                                {battery.model && <BatteryItem>Model: {battery.model}</BatteryItem>}
                                {battery.state && <BatteryItem>State: {battery.state}</BatteryItem>}
                                {battery.cycle_count && <BatteryItem>Cycle Count: {battery.cycle_count}</BatteryItem>}
                                {battery.energy && <BatteryItem>Energy: {battery.energy} Wh</BatteryItem>}
                                {battery.time_to_full && <BatteryItem>Time to Full: {battery.time_to_full} minutes</BatteryItem>}
                                {battery.technology && <BatteryItem>Technology: {battery.technology}</BatteryItem>}
                                {battery.time_to_empty && <BatteryItem>Time to Empty: {battery.time_to_empty} minutes</BatteryItem>}
                                {battery.temperature && <BatteryItem>Temperature: {battery.temperature} °C</BatteryItem>}
                                {battery.state_of_health && <BatteryItem>State of Health: {battery.state_of_health}%</BatteryItem>}
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
