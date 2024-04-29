import React, { useState, useEffect } from 'react';
import { invoke } from "@tauri-apps/api/tauri";
import BiGraph from './BiGraph';



interface NetworkUsages {
    download: number | null;
    upload: number | null;
    total_download: number | null;
    total_upload: number | null;
}

const Network: React.FC = () => {
    const [NetworkUsages, setNetworkUsages] = useState<NetworkUsages>({ download: null, upload: null, total_download: null, total_upload: null });
    const [download, setdownload] = useState<number[]>([]);
    const [upload, setupload] = useState<number[]>([]);
    const [totalDownload, setTotalDownload] = useState<string[]>([]);
    const [totalUpload, setTotalUpload] = useState<string[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const fetchedNetworkUsages: NetworkUsages = await invoke("get_network");
                setNetworkUsages(fetchedNetworkUsages);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
        const intervalId = setInterval(fetchData, 1000);

        return () => clearInterval(intervalId);
    }, []);


    useEffect(() => {
        if (NetworkUsages.download !== null) {
            setdownload(prevdownload => [...prevdownload, NetworkUsages.download as number]);
        }
        if (NetworkUsages.upload !== null) {
            setupload(prevupload => [...prevupload, NetworkUsages.upload as number]);
        }
    }, [NetworkUsages]);


    useEffect(() => {
        if (NetworkUsages.total_download !== null) {
            let totalDownloadValue = NetworkUsages.total_download as number;
            let downloadUnit = "KB";

            if (totalDownloadValue > 1000000000) {
                totalDownloadValue /= 1000000000;
                downloadUnit = "GB";
            } else if (totalDownloadValue > 1000000) {
                totalDownloadValue /= 1000000;
                downloadUnit = "MB";
            } else if (totalDownloadValue > 1000) {
                totalDownloadValue /= 1000;
                downloadUnit = "KB";
            }

            setTotalDownload([parseFloat(totalDownloadValue.toFixed(1)) + " " + downloadUnit]); // Format number with unit
        }
    }, [NetworkUsages.total_download]);

    useEffect(() => {
        if (NetworkUsages.total_upload !== null) {
            let totalUploadValue = NetworkUsages.total_upload as number;
            let uploadUnit = "KB";

            if (totalUploadValue > 1000000000) {
                totalUploadValue /= 1000000000;
                uploadUnit = "GB";
            } else if (totalUploadValue > 1000000) {
                totalUploadValue /= 1000000;
                uploadUnit = "MB";
            } else if (totalUploadValue > 1000) {
                totalUploadValue /= 1000;
                uploadUnit = "KB";
            }
            setTotalUpload([parseFloat(totalUploadValue.toFixed(1)) + " " + uploadUnit]); // Format number with unit
        }
    }, [NetworkUsages.total_upload]);


    return (
        <div>
            <p>Total Download: {totalDownload}</p>
            <p>Total Upload: {totalUpload}</p>
            <BiGraph firstGraphValue={download} secondGraphValue={upload} />
        </div>
    );

};

export default Network;
