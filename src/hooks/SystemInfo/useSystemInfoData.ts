import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { usePaused, notify } from "../../services/store";
import useSerialPolling from "../useSerialPolling";
import useSystemInfoConfig from "./useSystemInfoConfig";
import type { SystemInfo, CpuData, GpuData, MemoryUsage, NetworkInterface } from "../../bindings";

export type { SystemInfo } from "../../bindings";

export interface SystemInfoPageData {
    info: SystemInfo | null;
    cpu: CpuData | null;
    gpus: GpuData[];
    mem: MemoryUsage;
    interfaces: NetworkInterface[];
}

const useSystemInfoData = () => {
    const [data, setData] = useState<SystemInfoPageData>({
        info: null,
        cpu: null,
        gpus: [],
        mem: { total: null, free: null, available: null, cached: null, active: null, swap_total: null, swap_cache: null },
        interfaces: [],
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const paused = usePaused();
    const sysConfig = useSystemInfoConfig();

    const { pollNow } = useSerialPolling({
        enabled: !paused,
        interval: sysConfig.config.system_info_update_time,
        poll: async () => {
            const [info, cpu, gpus, mem, interfaces] = await Promise.all([
                invoke<SystemInfo | null>("get_system_info"),
                invoke<CpuData | null>("get_cpu_informations"),
                invoke<GpuData[]>("get_gpu_informations"),
                invoke<MemoryUsage>("get_mem_info"),
                invoke<NetworkInterface[]>("get_interfaces", { showVirtual: true }),
            ]);
            return { info, cpu, gpus, mem, interfaces };
        },
        onSuccess: (fetched) => {
            setData(fetched);
            setLoading(false);
            setError(null);
        },
        onError: (err) => {
            console.error("Error fetching system info:", err);
            setLoading(false);
            setError(String(err));
            notify("error.fetch_failed");
        },
    });

    return { data, loading, error, refetch: pollNow };
};

export default useSystemInfoData;
