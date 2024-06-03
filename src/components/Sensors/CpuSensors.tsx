import React from 'react';
import useCpuSensorsData from '../../hooks/useCpuSensorsData';
import { SensorGroup, SensorName, BatteryItem } from '../../styles/sensors-style';
import HeatBar from '../HeatBar';

const CpuSensors: React.FC = () => {
    const cpuSensors = useCpuSensorsData();

    const flattenedAndSortedSensors = cpuSensors
        .flatMap(sensorGroup => sensorGroup.sensors)
        .sort((a, b) => {
            // Sort by Package id first
            if (a.name.includes('Package id')) return -1;
            if (b.name.includes('Package id')) return 1;

            // If both are cores, sort by core number
            const coreA = parseInt(a.name.split(' ')[2], 10);
            const coreB = parseInt(b.name.split(' ')[2], 10);
            return coreA - coreB;
        });

    return (
        <>
            {flattenedAndSortedSensors.length > 0 ? (
                <SensorGroup>
                    <SensorName>CPU</SensorName>
                    <div>
                        {flattenedAndSortedSensors.map((sensor, index) => (
                            <div key={index} style={{ display: 'flex', alignItems: 'center' }}>
                                <BatteryItem>{sensor.name}: {sensor.value}°C</BatteryItem>
                                <HeatBar value={sensor.value} critical={sensor.critical} />
                            </div>
                        ))}
                    </div>
                </SensorGroup>
            ) : (
                <p>Loading CPU sensor data...</p>
            )}
        </>
    );
};

export default CpuSensors;
