import React, { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import Graph from "./Graph";
import { useSetMemory, useSetMaxMemory } from "../services/store";

interface Memory {
    total: number | null;
    free: number | null;
    available: number | null;
    cached: number | null;
    active: number | null;
}

interface MemoryProps {
    hidden: boolean;
}

const Memory: React.FC<MemoryProps> = ({ hidden }) => {
    const [memoryUsage, setMemoryUsage] = useState<Memory | null>(null);
    const [activeMem, setActiveMem] = useState<number[]>([]);

    const setMemory = useSetMemory();
    const setMaxMemory = useSetMaxMemory();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const fetchedMemory: Memory = await invoke("get_mem_info");
                setMemoryUsage(fetchedMemory);

                // Set max memory when new memory data is received
                if (fetchedMemory.total !== null) {
                    setMaxMemory(Math.floor(formatMemory(fetchedMemory.total)));
                }
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
                const newActiveMem = [...prevActiveMem, formatMemory(memoryUsage.active) as number];
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


    const formatMemory = (memory: number | null): number => {
        if (memory === null) {
            return 0;
        }
        if (memory >= 1000 * 1000) {
            return parseFloat((memory / (1000 * 1000)).toFixed(2));
        } else if (memory >= 1000) {
            return parseFloat((memory / 1000).toFixed(2));
        } else {
            return parseFloat(memory.toFixed(2));
        }
    };

    return (
        <div style={{ display: hidden ? 'none' : 'block', width: '100%' }}>
            {memoryUsage && (
                <>
                    <Graph
                        firstGraphValue={activeMem as number[]}
                        maxValue={memoryUsage.total !== null ? Math.floor(formatMemory(memoryUsage.total)) : 0}
                    />

                    <p>Total Memory: {memoryUsage.total !== null ? formatMemory(memoryUsage.total) : "N/A"}</p>
                    <p>Free: {memoryUsage.free !== null ? formatMemory(memoryUsage.free) : "N/A"}</p>
                    <p>Available: {memoryUsage.available !== null ? formatMemory(memoryUsage.available) : "N/A"}</p>
                    <p>Cached: {memoryUsage.cached !== null ? formatMemory(memoryUsage.cached) : "N/A"}</p>
                    <p>Active: {memoryUsage.active !== null ? formatMemory(memoryUsage.active) : "N/A"}</p>
                </>
            )}
        </div>
    );

}

export default Memory;
