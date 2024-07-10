import { useState, useEffect } from 'react';
import { invoke } from "@tauri-apps/api/tauri";
import useProcessConfig from './Proc/useProcessConfig';

interface TotalUsages {
    memory: number | null;
    cpu: number | null;
    processes: number | null
}

const useTotalUsagesData = (): TotalUsages => {
    const [totalUsages, setTotalUsages] = useState<TotalUsages>({ memory: null, cpu: null, processes: null });
    const processConfig = useProcessConfig();
    useEffect(() => {
        const fetchData = async () => {
            try {
                const fetchedTotalUsages: TotalUsages = await invoke("get_total_usages");
                setTotalUsages(fetchedTotalUsages);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
        const intervalId = setInterval(fetchData, processConfig.config.processes_update_time);

        return () => clearInterval(intervalId);
    }, [processConfig.config.processes_update_time]);

    return totalUsages;
};

export default useTotalUsagesData;
