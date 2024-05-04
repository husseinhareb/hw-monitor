import React, { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { useMemoryUsageStore } from "../services/store";
import Graph from "./Graph";

interface TotalUsages {
    memory: number | null;
}

interface Memory {
    total: number | null;
    free: number | null;
    available: number | null;
    cached: number | null;
}

interface MemoryProps {
    hidden: boolean;
}

const Memory: React.FC<MemoryProps> = ({ hidden }) => {
    const [totalUsages, setTotalUsages] = useState<TotalUsages | null>(null);
    const [memoryUsage, setMemoryUsage] = useState<Memory | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const fetchedTotalUsages: TotalUsages = await invoke("get_total_usages");
                setTotalUsages(fetchedTotalUsages);
            } catch (error) {
                console.error("Error fetching total usages:", error);
            }

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
        if (totalUsages !== null && memoryUsage !== null) {
            useMemoryUsageStore.getState().setMemoryUsage(memoryUsage?.total); // Assuming you only want to update total memory usage
        }
    }, [totalUsages, memoryUsage]);

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
            <Graph currentValue={memoryUsage?.total ?? 0} maxValue={memoryUsage?.total} />
            <p>Total Memory: {memoryUsage?.total !== null ? formatMemory(memoryUsage.total) : "N/A"}</p>
            <p>Free: {memoryUsage?.free !== null ? formatMemory(memoryUsage.free) : "N/A"}</p>
            <p>Available: {memoryUsage?.available !== null ? formatMemory(memoryUsage.available) : "N/A"}</p>
            <p>Cached: {memoryUsage?.cached !== null ? formatMemory(memoryUsage.cached) : "N/A"}</p>
        </div>
    );
}

export default Memory;
