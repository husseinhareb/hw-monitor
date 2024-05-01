import React, { useState, useEffect } from 'react';
import { invoke } from "@tauri-apps/api/tauri";
import BiGraph from './BiGraph';

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
    const [networkUsages, setNetworkUsages] = useState<NetworkUsage[]>([]);
    const [download, setDownload] = useState<number[]>([]);
    const [upload, setUpload] = useState<number[]>([]);
    const [totalDownload, setTotalDownload] = useState<string>("");
    const [totalUpload, setTotalUpload] = useState<string>("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const fetchedNetworkUsages: NetworkUsage[] = await invoke("get_network");
                setNetworkUsages(fetchedNetworkUsages);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
        const intervalId = setInterval(fetchData, 1000);

        return () => clearInterval(intervalId);
    }, []);

    const interfaceData = networkUsages.find(data => data.interface === interfaceName);

    useEffect(() => {
        if (interfaceData) {
            setDownload(prevDownload => [...prevDownload, interfaceData.download]);
            setUpload(prevUpload => [...prevUpload, interfaceData.upload]);
            setTotalDownload(interfaceData.total_download);
            setTotalUpload(interfaceData.total_upload);
        }
    }, [interfaceData, networkUsages]);

    return (
        <div style={{ display: hidden ? 'none' : 'block', width: '100%' }}>
            <p>Total Download: {totalDownload}</p>
            <p>Total Upload: {totalUpload}</p>
            <p>Interface: {interfaceName}</p>
            <p>Download: {download.length > 0 ? download[download.length - 1] : 0}</p>
            <p>Upload: {upload.length > 0 ? upload[upload.length - 1] : 0}</p>
            <BiGraph firstGraphValue={download} secondGraphValue={upload} />
        </div>
    );
};

export default Network;
