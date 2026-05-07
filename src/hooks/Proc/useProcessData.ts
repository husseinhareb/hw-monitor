import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import useProcessConfig from "../Proc/useProcessConfig";
import { usePaused, notify } from "../../services/store";
import useSerialPolling from "../useSerialPolling";
import type { Process as BackendProcess } from "../../bindings";

export type Process = BackendProcess & { [key: string]: string | number | null };


const useProcessData = () => {
    const [processes, setProcesses] = useState<Process[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const processConfig = useProcessConfig();
    const paused = usePaused();
    useSerialPolling({
        enabled: !paused,
        interval: processConfig.config.processes_update_time,
        poll: () => invoke<Process[]>("get_processes"),
        onSuccess: (fetchedProcesses) => {
            setProcesses(fetchedProcesses);
            setLoading(false);
            setError(null);
        },
        onError: (error) => {
            console.error("Error fetching data:", error);
            setLoading(false);
            setError(String(error));
            notify('error.fetch_failed');
        },
    });

    return { processes, loading, error };
}


export default useProcessData;
