import React, { useState, useEffect } from "react";
import Graph from "./Graph";
import useMemoryData from "../hooks/useMemoryData";
import { useSetMemory } from "../services/store";
import useDataConverter from "../helper/useDataConverter";

interface MemoryProps {
    hidden: boolean;
}

const Memory: React.FC<MemoryProps> = ({ hidden }) => {
    const memoryUsage = useMemoryData();
    const [activeMem, setActiveMem] = useState<number[]>([]);
    const setMemory = useSetMemory();
    const convertData = useDataConverter();
    useEffect(() => {
        if (memoryUsage !== null && memoryUsage.active !== null) {
            setActiveMem(prevActiveMem => {
                const newActiveMem = [...prevActiveMem, convertData(memoryUsage.active).value as number];
                // Trim the array to keep only the last 20 elements
                if (newActiveMem.length > 20) {
                    return newActiveMem.slice(newActiveMem.length - 20);
                } else {
                    return newActiveMem;
                }
            });
        }
    }, [memoryUsage]);



    useEffect(() => {
        if (memoryUsage !== null) {
            setMemory(activeMem);
        }
    }, [activeMem, setMemory]);


    return (
        <div style={{ display: hidden ? 'none' : 'block', width: '100%' }}>
            {memoryUsage && (
                <>
                    <Graph
                        firstGraphValue={activeMem as number[]}
                        maxValue={memoryUsage.total !== null ? Math.floor(convertData(memoryUsage.total).value) : 0}
                    />

                    <p>Total Memory: {memoryUsage.total !== null ? convertData(memoryUsage.total).value : "N/A"} {convertData(memoryUsage.total).unit}</p>
                    <p>Free: {memoryUsage.free !== null ? convertData(memoryUsage.free).value : "N/A"} {convertData(memoryUsage.total).unit}</p>
                    <p>Available: {memoryUsage.available !== null ? convertData(memoryUsage.available).value : "N/A"} {convertData(memoryUsage.total).unit}</p>
                    <p>Cached: {memoryUsage.cached !== null ? convertData(memoryUsage.cached).value : "N/A"} {convertData(memoryUsage.total).unit}</p>
                    <p>Active: {memoryUsage.active !== null ? convertData(memoryUsage.active).value : "N/A"} {convertData(memoryUsage.total).unit}</p>
                    <p>Swap Total: {memoryUsage.active !== null ? convertData(memoryUsage.swap_total).value : "N/A"} {convertData(memoryUsage.total).unit}</p>
                    <p>Swap Cache: {memoryUsage.active !== null ? convertData(memoryUsage.swap_cache).value : "N/A"} {convertData(memoryUsage.total).unit}</p>

                </>
            )}
        </div>
    );

};
export default Memory;
