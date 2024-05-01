import React, { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { useMemoryUsageStore } from "../services/store";
import Graph from "./Graph";


interface TotalUsages {
    memory: number | null;
}

const Memory: React.FC = () => {
    const [totalUsages, setTotalUsages] = useState<TotalUsages | null>(null);
    const [memoryUsage, setMemoryUsage] = useState<number[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const fetchedTotalUsages: TotalUsages = await invoke("get_total_usages");
                setTotalUsages(fetchedTotalUsages);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
        const intervalId = setInterval(fetchData, 1000);

        return () => clearInterval(intervalId);
    }, []);


    useEffect(() => {
        if (totalUsages !== null) {
            setMemoryUsage(prevMemoryUsage => [...prevMemoryUsage, totalUsages.memory as number]);
        }
    }, [totalUsages]);


    useEffect(() => {
        if (totalUsages !== null) {
            useMemoryUsageStore.getState().setMemoryUsage(memoryUsage);
        }
    }, [memoryUsage]);

    return (
        <div>
            <Graph currentValue={memoryUsage} />
        </div>
        );
}

export default Memory;
