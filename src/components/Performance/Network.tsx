import React, { useEffect, useMemo } from 'react';
import { useSetEthernetSpeed, useSetWifiSpeed } from '../../services/store';
import Graph from '../Graph';
import useNetworkData from '../../hooks/useNetworkData';
import useDataConverter from '../../helpers/useDataConverter';

interface NetworkProps {
    hidden: boolean;
    interfaceName: string;
}

const Network: React.FC<NetworkProps> = ({ hidden, interfaceName }) => {
    const { download = [], upload = [], totalDownload, totalUpload } = useNetworkData(interfaceName);
    const setWifiSpeed = useSetWifiSpeed();
    const setEthernetSpeed = useSetEthernetSpeed();
    const convertData = useDataConverter();

    const downloadValues = useMemo(() => download.map(d => d.value), [download]);
    const uploadValues = useMemo(() => upload.map(u => u.value), [upload]);

    useEffect(() => {
        if (interfaceName.includes('wl')) {
            setWifiSpeed(downloadValues, uploadValues);
        } else if (interfaceName.includes('en') || interfaceName.includes('eth')) {
            setEthernetSpeed(downloadValues, uploadValues);
        }
    }, [interfaceName, downloadValues, uploadValues, setWifiSpeed, setEthernetSpeed]);


    return (
        <div style={{ display: hidden ? 'none' : 'block' }}>
            <h2>{interfaceName}</h2>
            <Graph firstGraphValue={downloadValues} secondGraphValue={uploadValues} />
            {totalDownload !== undefined && (
                <p>
                    Total Download: {convertData(totalDownload).value}{' '}
                    {convertData(totalDownload).unit}
                </p>
            )}
            {totalUpload !== undefined && (
                <p>
                    Total Upload: {convertData(totalUpload).value}{' '}
                    {convertData(totalUpload).unit}
                </p>
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
