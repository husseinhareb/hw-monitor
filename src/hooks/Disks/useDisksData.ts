import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import useDataConverter from "../helpers/useDataConverter";
import useDisksConfig from "./useDisksConfig";

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
    const convertData = useDataConverter();
    const disksConfig = useDisksConfig();
    useEffect(() => {
        const fetchDiskData = async () => {
            try {
                const fetchedDiskData: DiskData[] = await invoke("get_disks");
                setDiskData(fetchedDiskData);
            } catch (error) {
                console.error("Error fetching data:", error);
                setDiskData([]); // Clear data if error occurs
            }
        };

        fetchDiskData();
        const intervalId = setInterval(fetchDiskData, disksConfig.config.disks_update_time);
        return () => clearInterval(intervalId);

    }, [disksConfig.config.disks_update_time]);

    return { diskData, convertData };
};

export default useDiskData;
