import React, { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import Graph from "./Graph";
import { useSetMemory } from "../services/store";


interface Memory {
    total: number;
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
    }, []);


    useEffect(() => {
        if (memoryUsage !== null) {
            setActiveMem(prevActiveMem => {
                const newActiveMem = [...prevActiveMem, memoryUsage.active as number];
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
            setMemory(activeMem,memoryUsage.total)
        }
    }, [activeMem]);

    const formatMemory = (memory: number): string => {
        if (memory >= 1000 * 1000) {
            return (memory / (1000 * 1000)).toFixed(2) + " GB";
        }
        else if (memory >= 1000) {
            return (memory / 1000).toFixed(2) + " MB";
        }
        else {
            return memory.toFixed(2) + " KB";
        }
    };

    return (
        <div style={{ display: hidden ? 'none' : 'block', width: '100%' }}>
            {memoryUsage && (
                <>
                    <Graph
                        firstGraphValue={activeMem}
                        maxValue={memoryUsage.total ?? 0}
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
