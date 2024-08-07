import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import useProcessConfig from "../Proc/useProcessConfig";

export interface Process {
    user: string;
    pid: number;
    ppid: number;
    name: string;
    state: string;
    memory: string;
    cpu_usage: number;
    read_disk_usage: string;
    write_disk_usage: string;
    read_disk_speed: string;
    write_disk_speed: string;
    [key: string]: string | number; // Index signature
}


const useProcessData = () => {
    const [processes, setProcesses] = useState<Process[]>([]);
    const processConfig = useProcessConfig();
    useEffect(() => {
        const fetchProcess = async () => {
            try {
                //console.time("Data Fetch Time");
                const fetchedProcess: Process[] = await invoke("get_processes");
                //console.timeEnd("Data Fetch Time");
                setProcesses(fetchedProcess);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchProcess();
        const intervalId = setInterval(fetchProcess, processConfig.config.processes_update_time);

        return () => clearInterval(intervalId);
    }, [processConfig.config.processes_update_time]);

    return { processes };
}


export default useProcessData;
