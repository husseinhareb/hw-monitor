import React, { useEffect } from 'react';
import { useSetEthernetSpeed, useSetWifiSpeed } from '../../services/store';
import Graph from '../Graph';
import useNetworkData from '../../hooks/useNetworkData';
import useDataConverter from '../../helpers/useDataConverter';

interface NetworkProps {
    hidden: boolean;
    interfaceName: string;
}

const Network: React.FC<NetworkProps> = ({ hidden, interfaceName }) => {
    const { download, upload, totalDownload, totalUpload } = useNetworkData(interfaceName);
    const setWifiSpeed = useSetWifiSpeed();
    const setEthernetSpeed = useSetEthernetSpeed();
    const convertData = useDataConverter();
    console.log(download.map(d => d.value))
    useEffect(() => {
        if (interfaceName.includes("wl")) {
            setWifiSpeed(download.map(d => d.value), upload.map(u => u.value));
        } else if (interfaceName.includes("en") || interfaceName.includes("eth")) {
            setEthernetSpeed(download.map(d => d.value), upload.map(u => u.value));
        }
    }, [interfaceName, download, upload, setWifiSpeed, setEthernetSpeed]);

    return (
        <div style={{ display: hidden ? 'none' : 'block' }}>
            <h2>{interfaceName}</h2>
            <Graph firstGraphValue={download.map(d => d.value)} secondGraphValue={upload.map(u => u.value)} />
            {totalDownload !== undefined && (
                <p>Total Download: {convertData(totalDownload).value}  {convertData(totalDownload).unit} </p>
            )}
            {totalUpload !== undefined && (
                <p>Total Upload:  {convertData(totalUpload).value}  {convertData(totalUpload).unit}</p>
            )}
            <p>
                Download: {download.length > 0 ? download[download.length - 1].value : 0} 
                {download.length > 0 ? download[download.length - 1].unit : 'B'}
            </p>
            <p>
                Upload: {upload.length > 0 ? upload[upload.length - 1].value : 0} 
                {upload.length > 0 ? upload[upload.length - 1].unit : 'B'}
            </p>
        </div>
    );
};

export default Network;
