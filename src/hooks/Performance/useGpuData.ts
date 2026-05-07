import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import usePerformanceConfig from "./usePerformanceConfig";
import { usePaused, notify } from "../../services/store";
import useSerialPolling from "../useSerialPolling";
import type { GpuData } from "../../bindings";

export type { GpuData } from "../../bindings";

const useGpuData = () => {
    const [gpuList, setGpuList] = useState<GpuData[]>([]);
    const performanceConfig = usePerformanceConfig();  
    const paused = usePaused();

    useSerialPolling({
        enabled: !paused,
        interval: performanceConfig.config.performance_update_time,
        poll: () => invoke<GpuData[]>("get_gpu_informations"),
        onSuccess: (fetched) => {
            setGpuList(fetched ?? []);
        },
        onError: (error) => {
            console.error("Error fetching GPU data:", error);
            notify('error.fetch_failed');
            setGpuList([]);
        },
    });

    return { gpuList };
};

export default useGpuData;
