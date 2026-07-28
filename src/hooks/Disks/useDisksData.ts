import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { convertData } from "../../helpers/useDataConverter";
import useDisksConfig from "./useDisksConfig";
import { usePaused, notify } from "../../services/store";
import useSerialPolling from "../useSerialPolling";
import type { DiskData } from "../../bindings";

export type { DiskData, PartitionData } from "../../bindings";

const useDiskData = () => {
    const [diskData, setDiskData] = useState<DiskData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const disksConfig = useDisksConfig();
    const paused = usePaused();
    useSerialPolling({
        enabled: !paused,
        interval: disksConfig.config.disks_update_time,
        poll: () => invoke<DiskData[]>("get_disks"),
        onSuccess: (fetchedDiskData) => {
            setDiskData(fetchedDiskData);
            setLoading(false);
            setError(null);
        },
        onError: (err) => {
            console.error("Error fetching data:", err);
            notify('error.disks_failed');
            setLoading(false);
            setError(String(err));
            setDiskData([]);
        },
    });

    return { diskData, convertData, loading, error };
};

export default useDiskData;
