//useMemoryData.ts
import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useSetMaxMemory, usePaused, notify } from "../../services/store";
import useDataConverter from "../../helpers/useDataConverter";
import usePerformanceConfig from "../Performance/usePerformanceConfig";
import useSerialPolling from "../useSerialPolling";

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

let memoryHardwareInfoCache: MemoryHardwareInfo | null = null;
let memoryHardwareInfoPromise: Promise<MemoryHardwareInfo> | null = null;

const fetchMemoryHardwareInfo = async () => {
    if (memoryHardwareInfoCache) {
        return memoryHardwareInfoCache;
    }

    if (!memoryHardwareInfoPromise) {
        memoryHardwareInfoPromise = invoke<MemoryHardwareInfo>("get_mem_hardware_info")
            .then((info) => {
                memoryHardwareInfoCache = info;
                return info;
            })
            .finally(() => {
                memoryHardwareInfoPromise = null;
            });
    }

    return memoryHardwareInfoPromise;
};

const useMemoryData = () => {
    const [memoryUsage, setMemoryUsage] = useState<MemoryUsage | null>(null);
    const setMaxMemory = useSetMaxMemory();
    const convertData = useDataConverter();
    const performanceConfig = usePerformanceConfig();
    const paused = usePaused();
    useSerialPolling({
        enabled: !paused,
        interval: performanceConfig.config.performance_update_time,
        poll: () => invoke<MemoryUsage>("get_mem_info"),
        onSuccess: (fetchedMemory) => {
            setMemoryUsage(fetchedMemory);
            if (fetchedMemory.total != null) {
                setMaxMemory(Math.floor(convertData(fetchedMemory.total).value));
            }
        },
        onError: (error) => {
            console.error("Error fetching memory data:", error);
            notify('error.fetch_failed');
        },
        deps: [convertData, setMaxMemory],
    });
    return memoryUsage;
};

export const useMemoryHardwareInfo = () => {
    const [hardwareInfo, setHardwareInfo] = useState<MemoryHardwareInfo | null>(memoryHardwareInfoCache);

    useEffect(() => {
        let cancelled = false;

        const fetchData = async () => {
            try {
                const info = await fetchMemoryHardwareInfo();
                if (!cancelled) {
                    setHardwareInfo(info);
                }
            } catch (error) {
                console.error("Error fetching memory hardware info:", error);
            }
        };

        void fetchData();

        return () => {
            cancelled = true;
        };
    }, []);

    return hardwareInfo;
};

export default useMemoryData;
