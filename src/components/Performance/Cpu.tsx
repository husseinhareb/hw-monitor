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

interface CpuProps {
    hidden: boolean;
}

const Cpu: React.FC<CpuProps> = ({ hidden }) => {
    const { cpuData } = useCpuData();
    const [cpuUsage, setCpuUsage] = useState<number[]>([]);
    const totalUsages = useTotalUsagesData();
    const setCpu = useSetCpu();

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
        <CPU style={{ height: '100%', width: '100%', display: hidden ? 'none' : 'block' }}>
            <NameContainer>
                <NameLabel>CPU</NameLabel>
                <NameValue>{cpuData.name}</NameValue>
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
                            <LeftLabel>Speed</LeftLabel>
                            <LeftValue>{cpuData.current_speed}GHz</LeftValue>
                        </SpeedUsageItem>
                        <SpeedUsageItem>
                            <LeftLabel>Usage</LeftLabel>
                            <LeftValue>{cpuData.usage}%</LeftValue>
                        </SpeedUsageItem>
                    </SpeedUsageContainer>
                    <LeftLabel>Processes</LeftLabel>
                    <LeftValue>{totalUsages.processes}</LeftValue>
                    <LeftLabel>Uptime</LeftLabel>
                    <LeftValue>{cpuData.uptime}</LeftValue>
                </RealTimeValues>
                <FixedValues>
                    <FixedValueItem>
                        <RightLabel>Socket</RightLabel>
                        <RightValue>{cpuData.socket}</RightValue>
                    </FixedValueItem>
                    <FixedValueItem>
                        <RightLabel>Cores</RightLabel>
                        <RightValue>{cpuData.cores}</RightValue>
                    </FixedValueItem>
                    <FixedValueItem>
                        <RightLabel>Threads</RightLabel>
                        <RightValue>{cpuData.threads}</RightValue>
                    </FixedValueItem>
                    <FixedValueItem>
                        <RightLabel>Base Speed</RightLabel>
                        <RightValue>{cpuData.base_speed / 1000000} GHz</RightValue>
                    </FixedValueItem>
                    <FixedValueItem>
                        <RightLabel>Max Speed</RightLabel>
                        <RightValue>{cpuData.max_speed / 1000000} GHz</RightValue>
                    </FixedValueItem>
                    <FixedValueItem>
                        <RightLabel>Virtualization</RightLabel>
                        <RightValue>{cpuData.virtualization}</RightValue>
                    </FixedValueItem>
                </FixedValues>
            </div>
        </CPU>

    );
}

export default Cpu;
