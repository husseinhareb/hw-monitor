//useNetworkData.ts
import { useState, useEffect } from 'react';
import { invoke } from "@tauri-apps/api/core";
import useDataConverter from '../../helpers/useDataConverter';
import usePerformanceConfig from '../Performance/usePerformanceConfig';
import { usePaused } from '../../services/store';

interface NetworkUsage {
    download: number;
    upload: number;
    total_download: number;
    total_upload: number;
    interface: string;
}

interface DataWithUnit {
    value: number;
    unit: string;
}

const useNetworkData = (interfaceName: string) => {
    const [download, setDownload] = useState<DataWithUnit[]>([]);
    const [upload, setUpload] = useState<DataWithUnit[]>([]);
    const [totalDownload, setTotalDownload] = useState<number>();
    const [totalUpload, setTotalUpload] = useState<number>();
    const convertData = useDataConverter();
    const performanceConfig = usePerformanceConfig();
    const paused = usePaused();
    useEffect(() => {
        if (paused) return;
        const fetchData = async () => {
            try {
                const fetchedNetworkUsages: NetworkUsage[] = await invoke("get_network", {
                    showVirtual: performanceConfig.config.show_virtual_interfaces,
                });
                const interfaceData = fetchedNetworkUsages.find(data => data.interface === interfaceName);
                if (interfaceData) {
                    setDownload(prevDownload => [...prevDownload, convertData(interfaceData.download)].slice(-20));
                    setUpload(prevUpload => [...prevUpload, convertData(interfaceData.upload)].slice(-20));
                    setTotalDownload(interfaceData.total_download);
                    setTotalUpload(interfaceData.total_upload);
                } else {
                    setDownload(prevDownload => [...prevDownload, { value: 0, unit: 'B' }].slice(-20));
                    setUpload(prevUpload => [...prevUpload, { value: 0, unit: 'B' }].slice(-20));
                    setTotalDownload(0);
                    setTotalUpload(0);
                }   
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData(); // Initial fetch
        const intervalId = setInterval(fetchData, performanceConfig.config.performance_update_time); 

        return () => clearInterval(intervalId);
    }, [interfaceName,performanceConfig.config.performance_update_time, paused]);

    return { download, upload, totalDownload, totalUpload };
};

export default useNetworkData;
