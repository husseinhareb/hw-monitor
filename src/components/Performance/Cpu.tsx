//Cpu.tsx
import React, { useState, useEffect } from "react";
import Graph from "../Graph";
    import { useSetCpu } from "../../services/store";
import useCpuData from "../../hooks/useCpuData";
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
    NameLabel
} from "./Styles/style";
import useTotalUsagesData from "../../hooks/useTotalUsagesData";
import { NameContainer, } from "../../styles/general-style";
import usePerformanceConfig from "../../hooks/usePerformanceConfig";

interface CpuProps {
    hidden: boolean;
}

const Cpu: React.FC<CpuProps> = ({ hidden }) => {
    const { cpuData } = useCpuData();
    const [cpuUsage, setCpuUsage] = useState<number[]>([]);
    const totalUsages = useTotalUsagesData();
    const setCpu = useSetCpu();
    
    const performanceConfig = usePerformanceConfig();
    console.log(performanceConfig)
    useEffect(() => {
        if (cpuUsage !== null) {
            setCpuUsage(prevCpuUsage => {
                const newActiveMem = [...prevCpuUsage, cpuData.usage as number];
                // Trim the array to keep only the last 20 elements
                if (newActiveMem.length > 20) {
                    return newActiveMem.slice(newActiveMem.length - 20);
                } else {
                    return newActiveMem;
                }
            });
        }
    }, [cpuData]);

    useEffect(() => {
        if (cpuData !== null) {
            setCpu(cpuUsage);
        }
    }, [cpuUsage]);

    return (
        <CPU 
        performanceBackgroundColor={performanceConfig.config.performance_background_color}
        style={{ height: '100%', width: '100%', display: hidden ? 'none' : 'block' }}
        >
            <NameContainer>
                <NameLabel performanceTitleColor={performanceConfig.config.performance_title_color}>CPU</NameLabel>
                <NameValue performanceTitleColor={performanceConfig.config.performance_title_color}>{cpuData.name}</NameValue>
            </NameContainer>
            <div>
                <Graph
                    firstGraphValue={cpuUsage}
                    maxValue={100}
                    width="98%"
                />
            </div>
            <div style={{ display: 'flex', marginTop: '100px', width: '70%', flexWrap: 'wrap' }}>
                <RealTimeValues>
                    <SpeedUsageContainer>
                        <SpeedUsageItem>
                            <LeftLabel performanceLabelColor={performanceConfig.config.performance_label_color}>Speed</LeftLabel>
                            <LeftValue performanceValueColor={performanceConfig.config.performance_value_color}>{cpuData.current_speed}GHz</LeftValue>
                        </SpeedUsageItem>
                        <SpeedUsageItem>
                            <LeftLabel performanceLabelColor={performanceConfig.config.performance_label_color}>Usage</LeftLabel>
                            <LeftValue performanceValueColor={performanceConfig.config.performance_value_color}>{cpuData.usage}%</LeftValue>
                        </SpeedUsageItem>
                    </SpeedUsageContainer>
                    <LeftLabel performanceLabelColor={performanceConfig.config.performance_label_color}>Processes</LeftLabel>
                    <LeftValue performanceValueColor={performanceConfig.config.performance_value_color}>{totalUsages.processes}</LeftValue>
                    <LeftLabel performanceLabelColor={performanceConfig.config.performance_label_color}>Uptime</LeftLabel>
                    <LeftValue performanceValueColor={performanceConfig.config.performance_value_color}>{cpuData.uptime}</LeftValue>
                </RealTimeValues>
                <FixedValues>
                    <FixedValueItem>
                        <RightLabel performanceLabelColor={performanceConfig.config.performance_label_color}>Socket</RightLabel>
                        <RightValue performanceValueColor={performanceConfig.config.performance_value_color}>{cpuData.socket}</RightValue>
                    </FixedValueItem>
                    <FixedValueItem>
                        <RightLabel performanceLabelColor={performanceConfig.config.performance_label_color}>Cores</RightLabel>
                        <RightValue performanceValueColor={performanceConfig.config.performance_value_color}>{cpuData.cores}</RightValue>
                    </FixedValueItem>
                    <FixedValueItem>
                        <RightLabel performanceLabelColor={performanceConfig.config.performance_label_color}>Threads</RightLabel>
                        <RightValue performanceValueColor={performanceConfig.config.performance_value_color}>{cpuData.threads}</RightValue>
                    </FixedValueItem>
                    <FixedValueItem>
                        <RightLabel performanceLabelColor={performanceConfig.config.performance_label_color}>Base Speed</RightLabel>
                        <RightValue performanceValueColor={performanceConfig.config.performance_value_color}>{cpuData.base_speed / 1000000} GHz</RightValue>
                    </FixedValueItem>
                    <FixedValueItem>
                        <RightLabel performanceLabelColor={performanceConfig.config.performance_label_color}>Max Speed</RightLabel>
                        <RightValue performanceValueColor={performanceConfig.config.performance_value_color}>{cpuData.max_speed / 1000000} GHz</RightValue>
                    </FixedValueItem>
                    <FixedValueItem>
                        <RightLabel performanceLabelColor={performanceConfig.config.performance_label_color}>Virtualization</RightLabel>
                        <RightValue performanceValueColor={performanceConfig.config.performance_value_color}>{cpuData.virtualization}</RightValue>
                    </FixedValueItem>
                </FixedValues>
            </div>
        </CPU>

    );
}

export default Cpu;
