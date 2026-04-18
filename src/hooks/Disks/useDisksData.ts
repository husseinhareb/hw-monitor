import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { convertData } from "../../helpers/useDataConverter";
import useDisksConfig from "./useDisksConfig";
import { usePaused, notify } from "../../services/store";
import useSerialPolling from "../useSerialPolling";

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
    const disksConfig = useDisksConfig();
    const paused = usePaused();
    useSerialPolling({
        enabled: !paused,
        interval: disksConfig.config.disks_update_time,
        poll: () => invoke<DiskData[]>("get_disks"),
        onSuccess: (fetchedDiskData) => {
            setDiskData(fetchedDiskData);
            setError(null);
        },
        onError: (err) => {
            console.error("Error fetching data:", err);
            notify('error.disks_failed');
            setError(String(err));
            setDiskData([]);
        },
    });

    return { diskData, convertData, error };
};

export default useDiskData;
