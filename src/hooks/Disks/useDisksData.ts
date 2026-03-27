import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import useDataConverter from "../../helpers/useDataConverter";
import useDisksConfig from "./useDisksConfig";
import { usePaused } from "../../services/store";

interface PartitionData {
    name: string;
    size: number;
    file_system?: string;
    available_space?: number;
    total_space?: number;
    used_space?: number;
    mount_point?: string;
}

interface DiskData {
    name: string;
    partitions: PartitionData[];
    size: number;
}

const useDiskData = () => {
    const [diskData, setDiskData] = useState<DiskData[]>([]);
    const [error, setError] = useState<string | null>(null);
    const convertData = useDataConverter();
    const disksConfig = useDisksConfig();
    const paused = usePaused();
    useEffect(() => {
        if (paused) return;
        const fetchDiskData = async () => {
            try {
                const fetchedDiskData: DiskData[] = await invoke("get_disks");
                setDiskData(fetchedDiskData);
                setError(null);
            } catch (err) {
                console.error("Error fetching data:", err);
                setError(String(err));
                setDiskData([]);
            }
        };

        fetchDiskData();
        const intervalId = setInterval(fetchDiskData, disksConfig.config.disks_update_time);
        return () => clearInterval(intervalId);

    }, [disksConfig.config.disks_update_time, paused]);

    return { diskData, convertData, error };
};

export default useDiskData;
