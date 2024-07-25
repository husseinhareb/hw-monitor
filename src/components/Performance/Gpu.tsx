import React, { useState, useEffect } from "react";
import Graph from "../Graph/Graph";
import { useSetGpu } from "../../services/store";
import usegpuData from "../../hooks/Performance/useGpuData";
import {
    CPU, LeftLabel,
    RightLabel,
    RightValue,
    LeftValue,
    NameValue,
    RealTimeValues,
    FixedValues,
    SpeedUsageContainer,
    SpeedUsageItem,
    FixedValueItem,
    NameLabel,
    NameContainer
} from "./Styles/style";

interface GpuProps {
    hidden: boolean;
    performanceConfig: {
        config: {
            performance_background_color: string;
            performance_title_color: string;
            performance_label_color: string;
            performance_value_color: string;
        }
    };
}

const Gpu: React.FC<GpuProps> = ({ hidden, performanceConfig }) => {
    const { gpuData } = usegpuData();
    const [gpuUsage, setGpuUsage] = useState<number[]>([]);
    const setGpu = useSetGpu();

    useEffect(() => {
        if (gpuData && gpuData.utilization !== undefined) {
            setGpuUsage(prevGpuUsage => {
                const newActiveMem = [...prevGpuUsage, parseInt(gpuData.utilization) as number];
                // Trim the array to keep only the last 20 elements
                if (newActiveMem.length > 20) {
                    return newActiveMem.slice(newActiveMem.length - 20);
                } else {
                    return newActiveMem;
                }
            });
        }
    }, [gpuData, setGpuUsage]);

    useEffect(() => {
        if (gpuData && gpuUsage.length > 0) {
            setGpu(gpuUsage);
        }
    }, [gpuUsage, gpuData, setGpu]);

    return (
        <CPU
            performanceBackgroundColor={performanceConfig.config.performance_background_color}
            style={{ height: '100%', width: '100%', display: hidden ? 'none' : 'block' }}
        >
            <NameContainer>
                <NameLabel performanceTitleColor={performanceConfig.config.performance_title_color}>Gpu</NameLabel>
                {gpuData && (
                    <NameValue performanceTitleColor={performanceConfig.config.performance_title_color}>{gpuData.name}</NameValue>
                )}
            </NameContainer>
            <div>
                <Graph
                    firstGraphValue={gpuUsage}
                    maxValue={100}
                    width="98%"
                />
            </div>
            {gpuData && (
                <div style={{ display: 'flex', marginTop: '100px', width: '70%', flexWrap: 'wrap' }}>
                    <RealTimeValues>
                        <SpeedUsageContainer>
                            <SpeedUsageItem>
                                <LeftLabel performanceLabelColor={performanceConfig.config.performance_label_color}>Clock Speed</LeftLabel>
                                <LeftValue performanceValueColor={performanceConfig.config.performance_value_color}>{gpuData.clock_speed}</LeftValue>
                            </SpeedUsageItem>
                            <SpeedUsageItem>
                                <LeftLabel performanceLabelColor={performanceConfig.config.performance_label_color}>Usage</LeftLabel>
                                <LeftValue performanceValueColor={performanceConfig.config.performance_value_color}>{gpuData.utilization}</LeftValue>
                            </SpeedUsageItem>
                        </SpeedUsageContainer>
                        <SpeedUsageContainer>
                            <SpeedUsageItem>
                                <LeftLabel performanceLabelColor={performanceConfig.config.performance_label_color}>Temperature</LeftLabel>
                                <LeftValue performanceValueColor={performanceConfig.config.performance_value_color}>{gpuData.temperature}</LeftValue>
                            </SpeedUsageItem>
                            <SpeedUsageItem>
                                <LeftLabel performanceLabelColor={performanceConfig.config.performance_label_color}>Wattage</LeftLabel>
                                <LeftValue performanceValueColor={performanceConfig.config.performance_value_color}>{gpuData.wattage}</LeftValue>
                            </SpeedUsageItem>
                        </SpeedUsageContainer>
                        <LeftLabel performanceLabelColor={performanceConfig.config.performance_label_color}>Driver Version</LeftLabel>
                        <LeftValue performanceValueColor={performanceConfig.config.performance_value_color}>{gpuData.driver_version}</LeftValue>
                    </RealTimeValues>
                    <FixedValues>
                        <FixedValueItem>
                            <RightLabel performanceLabelColor={performanceConfig.config.performance_label_color}>Memory Used</RightLabel>
                            <RightValue performanceValueColor={performanceConfig.config.performance_value_color}>{gpuData.memory_used}</RightValue>
                        </FixedValueItem>
                        <FixedValueItem>
                            <RightLabel performanceLabelColor={performanceConfig.config.performance_label_color}>Memory Free</RightLabel>
                            <RightValue performanceValueColor={performanceConfig.config.performance_value_color}>{gpuData.memory_free}</RightValue>
                        </FixedValueItem>
                        <FixedValueItem>
                            <RightLabel performanceLabelColor={performanceConfig.config.performance_label_color}>Memory Total</RightLabel>
                            <RightValue performanceValueColor={performanceConfig.config.performance_value_color}>{gpuData.memory_total}</RightValue>
                        </FixedValueItem>
                        <FixedValueItem>
                            <RightLabel performanceLabelColor={performanceConfig.config.performance_label_color}>Fan Speed</RightLabel>
                            <RightValue performanceValueColor={performanceConfig.config.performance_value_color}>{gpuData.fan_speed}</RightValue>
                        </FixedValueItem>
                        <FixedValueItem>
                            <RightLabel performanceLabelColor={performanceConfig.config.performance_label_color}>Performance State</RightLabel>
                            <RightValue performanceValueColor={performanceConfig.config.performance_value_color}>{gpuData.performance_state}</RightValue>
                        </FixedValueItem>
                    </FixedValues>
                </div>
            )}
        </CPU>
    );
}

export default Gpu;
