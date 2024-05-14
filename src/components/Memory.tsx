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
                        firstGraphValue={activeMem}
                        maxValue={memoryUsage.total !== null ? memoryUsage.total : 0}
                    />
                    <p>Total Memory: {memoryUsage.total !== null ? memoryUsage.total : "N/A"}</p>
                    <p>Free: {memoryUsage.free !== null ? memoryUsage.free : "N/A"}</p>
                    <p>Available: {memoryUsage.available !== null ? memoryUsage.available : "N/A"}</p>
                    <p>Cached: {memoryUsage.cached !== null ? memoryUsage.cached : "N/A"}</p>
                    <p>Active: {memoryUsage.active !== null ? memoryUsage.active : "N/A"}</p>
                    <p>Swap Total: {memoryUsage.swap_total !== null ? memoryUsage.swap_total : "N/A"}</p>
                    <p>Swap Cache: {memoryUsage.swap_cache !== null ? memoryUsage.swap_cache : "N/A"}</p>
                </>
            )}
        </div>
    );
};

export default Memory;
