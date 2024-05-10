import React, { useState, useEffect } from 'react';
import { invoke } from "@tauri-apps/api/tauri";
import BiGraph from './Graph';
import {  useSetEthernetSpeed, useSetWifiSpeed } from '../services/store';

interface NetworkProps {
    hidden: boolean;
    interfaceName: string;
}
interface NetworkUsage {
    download: number;
    upload: number;
    total_download: string;
    total_upload: string;
    interface: string;
}
const Network: React.FC<NetworkProps> = ({ hidden, interfaceName }) => {
    const [download, setDownload] = useState<number[]>([]);
    const [upload, setUpload] = useState<number[]>([]);
    const [totalDownload, setTotalDownload] = useState<string>("");
    const [totalUpload, setTotalUpload] = useState<string>("");
    const setWifiSpeed = useSetWifiSpeed();
    const setEthernetSpeed = useSetEthernetSpeed();

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

    useEffect(() => {
        if (interfaceName.includes("wl")) {
            setWifiSpeed(download, upload);
        }
        else if (interfaceName.includes("en")) {
            setEthernetSpeed(download,upload);
        }
    }, [interfaceName, download, upload]);
    return (
        <div style={{ display: hidden ? 'none' : 'block', width: '100%' }}>
            <h2>{interfaceName}</h2>
            <BiGraph firstGraphValue={download} secondGraphValue={upload} />
            <p>Total Download: {totalDownload}</p>
            <p>Total Upload: {totalUpload}</p>
            <p>Download: {download.length > 0 ? download[download.length - 1] : 0}</p>
            <p>Upload: {upload.length > 0 ? upload[upload.length - 1] : 0}</p>
        </div>
    );
};

export default Network;
