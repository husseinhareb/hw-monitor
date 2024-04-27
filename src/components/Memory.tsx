import React, { useEffect, useState } from "react";
import Graph from "./Graph";
import { invoke } from "@tauri-apps/api/tauri";

interface MemoryProps {
    activeItem: string;
}


interface TotalUsages {
    memory: number | null;
}

const Memory: React.FC<MemoryProps> = ({ activeItem }) => {
    const [render, setRender] = useState<boolean>(false);
    const [totalUsages, setTotalUsages] = useState<TotalUsages>({ memory: 0 });
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
        if (totalUsages.memory !== null) {
            setMemoryUsage(prevMemoryUsage => [...prevMemoryUsage, totalUsages.memory as number]);
        }
    }, [totalUsages]);


    useEffect(() => {
        if (activeItem == "Memory") {
            setRender(true);
        }
    }, [activeItem])


    return (
        render && (<div>
            <Graph currentValue={memoryUsage} maxValue={100} />
        </div>)
    );
}

export default Memory;
