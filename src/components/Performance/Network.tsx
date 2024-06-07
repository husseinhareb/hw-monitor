import React, { useEffect, useMemo } from 'react';
import { useSetEthernetSpeed, useSetWifiSpeed } from '../../services/store';
import Graph from '../Graph';
import useNetworkData from '../../hooks/useNetworkData';
import useDataConverter from '../../helpers/useDataConverter';
import { MemoryContainer, FixedValueItem, FixedValues, LeftValue, RightValue, LeftLabel, NameValue, RightLabel, NameLabel, MemoryTypes, RealTimeValues, NameContainer } from "./Styles/style";

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

        <MemoryContainer hidden={hidden}>

            <>
                <NameContainer>
                    <NameLabel>Network</NameLabel>
                    <NameValue>{interfaceName}</NameValue>
                </NameContainer>
                <Graph firstGraphValue={downloadValues} secondGraphValue={uploadValues} />

                <div style={{ display: 'flex', marginTop: '100px', width: '70%' }}>
                    <RealTimeValues>
                        <MemoryTypes>Usage</MemoryTypes>
                        <FixedValueItem>
                            <LeftLabel>Download</LeftLabel>
                            {totalDownload !== undefined && (
                                <LeftValue> {convertData(totalDownload).value}{' '}
                                    {convertData(totalDownload).unit}</LeftValue>
                            )}

                        </FixedValueItem>
                        <FixedValueItem>
                            <LeftLabel>Upload</LeftLabel>
                            {totalUpload !== undefined && (
                                <LeftValue> {convertData(totalUpload).value}{' '}
                                    {convertData(totalUpload).unit}</LeftValue>
                            )}

                        </FixedValueItem>
                    </RealTimeValues>

                    <FixedValues>
                        <MemoryTypes>Speed</MemoryTypes>

                        <FixedValueItem>
                            <RightLabel>Download</RightLabel>
                            <RightValue>
                                {download.length > 0 ? download[download.length - 1].value : 0}
                                {download.length > 0 ? download[download.length - 1].unit : 'B'}
                            </RightValue>
                        </FixedValueItem>
                        <FixedValueItem>
                            <RightLabel>Upload</RightLabel>
                            <RightValue>
                                {upload.length > 0 ? upload[upload.length - 1].value : 0}
                                {upload.length > 0 ? upload[upload.length - 1].unit : 'B'}
                            </RightValue>
                        </FixedValueItem>
                    </FixedValues>
                </div>
            </>
            
        </MemoryContainer>
    );
};

export default Network;
