import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import useDataConverter from "../helper/useDataConverter";

interface PartitionData {
    name: string;
    size: number;
}

interface DiskData {
    name: string;
    partitions: PartitionData[];
    size: number;
}

const useDiskData = () => {
    const [diskData, setDiskData] = useState<DiskData[]>([]);
    const convertData = useDataConverter();

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

        // Clean up function
        return () => {
            // You might want to cancel any ongoing requests or clear any timers here if needed
        };
    }, []);

    return { diskData, convertData };
};

export default useDiskData;
