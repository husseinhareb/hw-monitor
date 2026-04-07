import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import useProcessConfig from "../Proc/useProcessConfig";
import { usePaused, notify } from "../../services/store";

export interface Process {
    user: string | null;
    pid: number;
    ppid: number | null;
    name: string | null;
    state: string | null;
    memory: string | null;
    cpu_usage: string | null;
    read_disk_usage: string | null;
    write_disk_usage: string | null;
    read_disk_speed: string | null;
    write_disk_speed: string | null;
    [key: string]: string | number | null;
}


const useProcessData = () => {
    const [processes, setProcesses] = useState<Process[]>([]);
    const processConfig = useProcessConfig();
    const paused = usePaused();
    useEffect(() => {
        if (paused) return;
        const fetchProcess = async () => {
            try {
                //console.time("Data Fetch Time");
                const fetchedProcess: Process[] = await invoke("get_processes");
                //console.timeEnd("Data Fetch Time");
                setProcesses(fetchedProcess);
            } catch (error) {
                console.error("Error fetching data:", error);
                notify('error.fetch_failed');
            }
        };

        fetchProcess();
        const intervalId = setInterval(fetchProcess, processConfig.config.processes_update_time);

        return () => clearInterval(intervalId);
    }, [processConfig.config.processes_update_time, paused]);

    return { processes };
}


export default useProcessData;
