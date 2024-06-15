import React from 'react';
import useBatteryData from '../../hooks/useBatteryData';
import {  Design, DesignDiv, ContentDiv,Item } from '../../styles/battery-style';
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
                                {battery.percentage && <Item><p>Percentage: {battery.percentage}%</p></Item>}
                                {battery.model && <Item><p>Model: {battery.model}</p></Item>}
                                {battery.state && <Item><p>State: {battery.state}</p></Item>}
                                {battery.cycle_count && <Item><p>Cycle Count: {battery.cycle_count}</p></Item>}
                                {battery.energy && <Item><p>Energy: {battery.energy} Wh</p></Item>}
                                {battery.time_to_full && <Item><p>Time to Full: {battery.time_to_full} minutes</p></Item>}
                                {battery.technology && <Item><p>Technology: {battery.technology}</p></Item>}
                                {battery.time_to_empty && <Item><p>Time to Empty: {battery.time_to_empty} minutes</p></Item>}
                                {battery.temperature && <Item><p>Temperature: {battery.temperature} °C</p></Item>}
                                {battery.state_of_health && <Item><p>State of Health: {battery.state_of_health}%</p></Item>}
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