import React, { useState, useEffect } from "react";
import Graph from "./Graph";
import { useSetCpu } from "../services/store";
import useCpuData from "../hooks/useCpuData";
import { CPU, Label, Value, NameContainer, NameLabel, NameValue, RealTimeValues, FixedValues } from "../styles/cpu-style";
import useTotalUsagesData from "../hooks/useTotalUsagesData";

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
        <CPU style={{ display: hidden ? 'none' : 'block' }}>
            <NameContainer>
                <NameLabel>CPU</NameLabel>
                <NameValue>{cpuData.name}</NameValue>
            </NameContainer>
            <Graph firstGraphValue={cpuUsage} maxValue={100} />
            <div style={{ display: 'flex' }}>
                <RealTimeValues>
                    <Label>Speed</Label>
                    <Value>{cpuData.current_speed}GHz</Value>
                    <Label>Usage</Label>
                    <Value>{cpuData.usage}%</Value>
                    <Label>Processes</Label>
                    <Value>{totalUsages.processes}</Value>
                    <Label>Uptime</Label>
                    <Value>{cpuData.uptime}</Value>
                </RealTimeValues>
                <FixedValues>
                    <Label>Socket</Label>
                    <Value>{cpuData.socket}</Value>
                    <Label>Cores</Label>
                    <Value>{cpuData.cores}</Value>
                    <Label>Threads</Label>
                    <Value>{cpuData.threads}</Value>
                    <Label>Base Speed</Label>
                    <Value>{cpuData.base_speed / 1000000} GHz</Value>
                    <Label>Max Speed</Label>
                    <Value> {cpuData.max_speed / 1000000} GHz</Value>
                    <Label>Virtualization</Label>
                    <Value> {cpuData.virtualization}</Value>
                </FixedValues>
            </div>
        </CPU>
    );
}

export default Cpu;
