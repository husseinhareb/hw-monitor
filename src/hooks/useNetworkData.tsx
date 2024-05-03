import { useState, useEffect } from 'react';
import { invoke } from "@tauri-apps/api/tauri";

// Define the NetworkUsage interface
interface NetworkUsage {
    download: number;
    upload: number;
    total_download: string;
    total_upload: string;
    interface: string;
}

// Define the custom hook
const useNetworkData = (interfaceName: string) => {
    const [download, setDownload] = useState<number[]>([]);
    const [upload, setUpload] = useState<number[]>([]);
    const [totalDownload, setTotalDownload] = useState<string>("");
    const [totalUpload, setTotalUpload] = useState<string>("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const fetchedNetworkUsages: NetworkUsage[] = await invoke("get_network");
                // Filter the data for the specific interface
                const interfaceData = fetchedNetworkUsages.find(data => data.interface === interfaceName);
                if (interfaceData) {
                    setDownload(prevDownload => [...prevDownload, interfaceData.download]);
                    setUpload(prevUpload => [...prevUpload, interfaceData.upload]);
                    setTotalDownload(interfaceData.total_download);
                    setTotalUpload(interfaceData.total_upload);
                } else {
                    // If data for the specified interface is not available, set values to 0
                    setDownload(prevDownload => [...prevDownload, 0]);
                    setUpload(prevUpload => [...prevUpload, 0]);
                    setTotalDownload("0");
                    setTotalUpload("0");
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
