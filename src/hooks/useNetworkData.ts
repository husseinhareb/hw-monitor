import { useState, useEffect } from 'react';
import { invoke } from "@tauri-apps/api/tauri";

interface NetworkUsage {
    download: number;
    upload: number;
    total_download: number;
    total_upload: number;
    interface: string;
}

const useNetworkData = (interfaceName: string) => {
    const [download, setDownload] = useState<number[]>([]);
    const [upload, setUpload] = useState<number[]>([]);
    const [totalDownload, setTotalDownload] = useState<number>();
    const [totalUpload, setTotalUpload] = useState<number>();
    useEffect(() => {
        const fetchData = async () => {
            try {
                const fetchedNetworkUsages: NetworkUsage[] = await invoke("get_network");
                const interfaceData = fetchedNetworkUsages.find(data => data.interface === interfaceName);
                if (interfaceData) {
                    setDownload(prevDownload => [...prevDownload,  interfaceData.download]);
                    setUpload(prevUpload => [...prevUpload, interfaceData.upload]);
                    setTotalDownload(interfaceData.total_download);
                    setTotalUpload(interfaceData.total_upload);
                } else {
                    setDownload(prevDownload => [...prevDownload, 0]);
                    setUpload(prevUpload => [...prevUpload, 0]);
                    setTotalDownload(0);
                    setTotalUpload(0);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
        const intervalId = setInterval(fetchData, 1000);

        return () => clearInterval(intervalId);
    }, [interfaceName]);

    return { download, upload, totalDownload, totalUpload };
};

export default useNetworkData;
