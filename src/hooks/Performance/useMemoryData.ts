//useMemoryData.ts
import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useSetMaxMemory, usePaused, notify } from "../../services/store";
import useDataConverter from "../../helpers/useDataConverter";
import usePerformanceConfig from "../Performance/usePerformanceConfig";

export interface MemoryUsage {
    total: number | null;
    free: number | null;
    available: number | null;
    cached: number | null;
    active: number | null;
    swap_total: number | null;
    swap_cache: number | null;
}

export interface MemoryHardwareInfo {
    speed: string | null;
    slots_used: string | null;
    form_factor: string | null;
    memory_type: string | null;
}

const useMemoryData = () => {
    const [memoryUsage, setMemoryUsage] = useState<MemoryUsage | null>(null);
    const setMaxMemory = useSetMaxMemory();
    const convertData = useDataConverter();
    const performanceConfig = usePerformanceConfig();
    const paused = usePaused();
    useEffect(() => {
        if (paused) return;
        const fetchData = async () => {
            try {
                const fetchedMemory: MemoryUsage = await invoke("get_mem_info");
                setMemoryUsage(fetchedMemory);
                if (fetchedMemory.total != null) {
                    setMaxMemory(Math.floor(convertData(fetchedMemory.total).value));
                }
            } catch (error) {
                console.error("Error fetching memory data:", error);
                notify('error.fetch_failed');
            }
        };

        fetchData();
        const intervalId = setInterval(fetchData, performanceConfig.config.performance_update_time);

        return () => clearInterval(intervalId);
    }, [setMaxMemory, performanceConfig.config.performance_update_time, paused]);
    return memoryUsage;
};

export const useMemoryHardwareInfo = () => {
    const [hardwareInfo, setHardwareInfo] = useState<MemoryHardwareInfo | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const info: MemoryHardwareInfo = await invoke("get_mem_hardware_info");
                setHardwareInfo(info);
            } catch (error) {
                console.error("Error fetching memory hardware info:", error);
            }
        };
        fetchData();
    }, []);

    return hardwareInfo;
};

export default useMemoryData;
