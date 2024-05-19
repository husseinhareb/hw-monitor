import { useState, useEffect } from 'react';
import { invoke } from "@tauri-apps/api/tauri";

interface TotalUsages {
    memory: number | null;
    cpu: number | null;
}

const useTotalUsagesData = (): TotalUsages => {
    const [totalUsages, setTotalUsages] = useState<TotalUsages>({ memory: null, cpu: null });

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
        const intervalId = setInterval(fetchData, 1000);

        return () => clearInterval(intervalId);
    }, []);

    return totalUsages;
};

export default useTotalUsagesData;
