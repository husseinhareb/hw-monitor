import React from 'react';
import useBatteryData from '../../hooks/useBatteryData';
import {  Design, DesignDiv, ContentDiv,BatteryItem } from '../../styles/battery-style';
import { SensorGroup, SensorName} from '../../styles/sensors-style';

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
                                <Design percentage={battery.percentage} />
                            </DesignDiv>
                            <ContentDiv>
                                {battery.percentage && <BatteryItem><p>Percentage: {battery.percentage}%</p></BatteryItem>}
                                {battery.model && <BatteryItem><p>Model: {battery.model}</p></BatteryItem>}
                                {battery.state && <BatteryItem><p>State: {battery.state}</p></BatteryItem>}
                                {battery.cycle_count && <BatteryItem><p>Cycle Count: {battery.cycle_count}</p></BatteryItem>}
                                {battery.energy && <BatteryItem><p>Energy: {battery.energy} Wh</p></BatteryItem>}
                                {battery.time_to_full && <BatteryItem><p>Time to Full: {battery.time_to_full} minutes</p></BatteryItem>}
                                {battery.technology && <BatteryItem><p>Technology: {battery.technology}</p></BatteryItem>}
                                {battery.time_to_empty && <BatteryItem><p>Time to Empty: {battery.time_to_empty} minutes</p></BatteryItem>}
                                {battery.temperature && <BatteryItem><p>Temperature: {battery.temperature} °C</p></BatteryItem>}
                                {battery.state_of_health && <BatteryItem><p>State of Health: {battery.state_of_health}%</p></BatteryItem>}
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