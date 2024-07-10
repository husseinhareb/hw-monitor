import { useState, useEffect } from 'react';
import { invoke } from "@tauri-apps/api/tauri";
import useDataConverter from '../helpers/useDataConverter';
import usePerformanceConfig from './usePerformanceConfig';

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
    const perfomanceConfig = usePerformanceConfig();
    useEffect(() => {
        const fetchData = async () => {
            try {
                const fetchedNetworkUsages: NetworkUsage[] = await invoke("get_network");
                const interfaceData = fetchedNetworkUsages.find(data => data.interface === interfaceName);
                if (interfaceData) {
                    setDownload(prevDownload => [...prevDownload, convertData(interfaceData.download)]);
                    setUpload(prevUpload => [...prevUpload, convertData(interfaceData.upload)]);
                    setTotalDownload(interfaceData.total_download);
                    setTotalUpload(interfaceData.total_upload);
                } else {
                    setDownload(prevDownload => [...prevDownload, { value: 0, unit: 'B' }]);
                    setUpload(prevUpload => [...prevUpload, { value: 0, unit: 'B' }]);
                    setTotalDownload(0);
                    setTotalUpload(0);
                }   
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData(); // Initial fetch
        const intervalId = setInterval(fetchData, perfomanceConfig.config.performance_update_time); 

        return () => clearInterval(intervalId);
    }, [interfaceName,perfomanceConfig.config.performance_update_time]);

    return { download, upload, totalDownload, totalUpload };
};

export default useNetworkData;
