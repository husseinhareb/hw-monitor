import { useState, useEffect } from 'react';
import { invoke } from "@tauri-apps/api/tauri";
import useDataConverter from '../helpers/useDataConverter';

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

const useNetworkData = (interfaceName: string, maxDataPoints = 60) => {
    const [download, setDownload] = useState<DataWithUnit[]>([]);
    const [upload, setUpload] = useState<DataWithUnit[]>([]);
    const [totalDownload, setTotalDownload] = useState<number>();
    const [totalUpload, setTotalUpload] = useState<number>();
    const convertData = useDataConverter();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const fetchedNetworkUsages: NetworkUsage[] = await invoke("get_network");
                const interfaceData = fetchedNetworkUsages.find(data => data.interface === interfaceName);
                if (interfaceData) {
                    setDownload(prevDownload => {
                        const newDownload = [...prevDownload, convertData(interfaceData.download)];
                        return newDownload.length > maxDataPoints ? newDownload.slice(newDownload.length - maxDataPoints) : newDownload;
                    });
                    setUpload(prevUpload => {
                        const newUpload = [...prevUpload, convertData(interfaceData.upload)];
                        return newUpload.length > maxDataPoints ? newUpload.slice(newUpload.length - maxDataPoints) : newUpload;
                    });
                    setTotalDownload(interfaceData.total_download);
                    setTotalUpload(interfaceData.total_upload);
                } else {
                    setDownload(prevDownload => {
                        const newDownload = [...prevDownload, { value: 0, unit: 'B' }];
                        return newDownload.length > maxDataPoints ? newDownload.slice(newDownload.length - maxDataPoints) : newDownload;
                    });
                    setUpload(prevUpload => {
                        const newUpload = [...prevUpload, { value: 0, unit: 'B' }];
                        return newUpload.length > maxDataPoints ? newUpload.slice(newUpload.length - maxDataPoints) : newUpload;
                    });
                    setTotalDownload(0);
                    setTotalUpload(0);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData(); // Initial fetch
        const intervalId = setInterval(fetchData, 1000); // Fetch every second

        return () => clearInterval(intervalId);
    }, [interfaceName, maxDataPoints]);

    return { download, upload, totalDownload, totalUpload };
};

export default useNetworkData;
