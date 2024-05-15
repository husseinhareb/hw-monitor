import React, { useEffect } from 'react';
import { useSetEthernetSpeed, useSetWifiSpeed } from '../services/store';
import useDataConverter from '../helper/useDataConverter';
import Graph from './Graph';
import useNetworkData from '../hooks/useNetworkData';

interface NetworkProps {
    hidden: boolean;
    interfaceName: string;
}

const Network: React.FC<NetworkProps> = ({ hidden, interfaceName }) => {
    const { download, upload, totalDownload, totalUpload } = useNetworkData(interfaceName);
    const setWifiSpeed = useSetWifiSpeed();
    const setEthernetSpeed = useSetEthernetSpeed();
    const convertData = useDataConverter();

    useEffect(() => {
        if (interfaceName.includes("wl")) {
            setWifiSpeed(download, upload);
        } else if (interfaceName.includes("en")) {
            setEthernetSpeed(download, upload);
        }
    }, [interfaceName, download, upload, setWifiSpeed, setEthernetSpeed]);

    return (
        <div style={{ display: hidden ? 'none' : 'block', width: '100%' }}>
            <h2>{interfaceName}</h2>
            <Graph firstGraphValue={download} secondGraphValue={upload} />
            {totalDownload !== undefined && (
                <p>Total Download: {convertData(totalDownload).value} {convertData(totalDownload).unit}</p>
            )}
            {totalUpload !== undefined && (
                <p>Total Upload: {convertData(totalUpload).value} {convertData(totalUpload).unit}</p>
            )}
            <p>Download: {download.length > 0 ? download[download.length - 1] : 0}</p>
            <p>Upload: {upload.length > 0 ? upload[upload.length - 1] : 0}</p>
        </div>
    );
};

export default Network;
