import React, { useState, useEffect } from "react";
import Graph from "./Graph";
import { useSetCpu } from "../services/store";
import useCpuData from "../hooks/useCpuData";


interface CpuProps {
    hidden: boolean;
}

const Cpu: React.FC<CpuProps> = ({ hidden }) => {
    const {cpuData} = useCpuData();
    const [cpuUsage, setCpuUsage] = useState<number[]>([]);
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
            setCpu(cpuUsage)
        }
    }, [cpuUsage]);


    return (
        <div style={{ display: hidden ? 'none' : 'block'}}>
            <h2>{cpuData.name}</h2>
            <Graph firstGraphValue={cpuUsage} maxValue={100} />
            <p>Cpu usage: {cpuData.usage}%</p>
            <p>Socket: {cpuData.socket}</p>
            <p>Cores: {cpuData.cores}</p>
            <p>Threads: {cpuData.threads}</p>
            <p>CPU Speed: {cpuData.current_speed} GHz</p>
            <p>Base Speed: {cpuData.base_speed / 1000000} GHz</p>
            <p>Max Speed: {cpuData.max_speed / 1000000} GHz</p>
            <p>Virtualization: {cpuData.virtualization}</p>
            <p>{cpuData.uptime}</p>
        </div>
    );
}

export default Cpu;
