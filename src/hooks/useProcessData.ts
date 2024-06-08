import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/tauri";

export interface Process {
    user: string;
    pid: number;
    ppid: number;
    name: string;
    state: string;
    memory: string;
   // cpu_usage: number;
    read_disk_usage: string;
    write_disk_usage: string;
    read_disk_speed: string;
    write_disk_speed: string;
    [key: string]: string | number; // Index signature
}


const useProcessData = () => {
    const [processes, setProcesses] = useState<Process[]>([]);

    useEffect(() => {
        const fetchProcess = async () => {
            try {
                const fetchedProcess: Process[] = await invoke("get_processes");
                setProcesses(fetchedProcess);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchProcess();
        const intervalId = setInterval(fetchProcess, 1000);

        return () => clearInterval(intervalId);
    }, []);
    return { processes };
}

export default useProcessData;
