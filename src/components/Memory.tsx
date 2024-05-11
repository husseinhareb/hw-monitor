import React, { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import Graph from "./Graph";
import { useSetMemory, useSetMaxMemory } from "../services/store";
import useDataConverter from "../hooks/useDataConverter";

interface Memory {
    total: number | null;
    free: number | null;
    available: number | null;
    cached: number | null;
    active: number | null;
    swap_total: number | null;
    swap_cache: number | null;
}

interface MemoryProps {
    hidden: boolean;
}

const Memory: React.FC<MemoryProps> = ({ hidden }) => {
    const [memoryUsage, setMemoryUsage] = useState<Memory | null>(null);
    const [activeMem, setActiveMem] = useState<number[]>([]);
   
    const setMemory = useSetMemory();
    const setMaxMemory = useSetMaxMemory();
    const convertData = useDataConverter();
    useEffect(() => {
        const fetchData = async () => {
            try {
                const fetchedMemory: Memory = await invoke("get_mem_info");
                setMemoryUsage(fetchedMemory);

            } catch (error) {
                console.error("Error fetching memory data:", error);
            }
        };

        fetchData();
        const intervalId = setInterval(fetchData, 1000);

        return () => clearInterval(intervalId);
    }, [setMaxMemory, setMemory]);

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
