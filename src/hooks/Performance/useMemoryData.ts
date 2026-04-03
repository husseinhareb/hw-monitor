//useMemoryData.ts
import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useSetMemory, useSetMaxMemory, usePaused } from "../../services/store";
import useDataConverter from "../../helpers/useDataConverter";
import usePerformanceConfig from "../Performance/usePerformanceConfig";

interface Memory {
    total: number | null;
    free: number | null;
    available: number | null;
    cached: number | null;
    active: number | null;
    swap_total: number | null;
    swap_cache: number | null;
}

const useMemoryData = () => {
    const [memoryUsage, setMemoryUsage] = useState<Memory | null>(null);
    const setMemory = useSetMemory();
    const setMaxMemory = useSetMaxMemory();
    const convertData = useDataConverter();
    const performanceConfig = usePerformanceConfig();
    const paused = usePaused();
    useEffect(() => {
        if (paused) return;
        const fetchData = async () => {
            try {
                const fetchedMemory: Memory = await invoke("get_mem_info");
                setMemoryUsage(fetchedMemory);
                if (fetchedMemory.total != null) {
                    setMaxMemory(Math.floor(convertData(fetchedMemory.total).value));
                }
            } catch (error) {
                console.error("Error fetching memory data:", error);
            }
        };

        fetchData();
        const intervalId = setInterval(fetchData, performanceConfig.config.performance_update_time);

        return () => clearInterval(intervalId);
    }, [setMaxMemory, setMemory, performanceConfig.config.performance_update_time, paused]);
    return memoryUsage;
};

export default useMemoryData;
