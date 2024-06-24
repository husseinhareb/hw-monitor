import React, { useEffect, useMemo } from 'react';
import { useSetEthernetSpeed, useSetWifiSpeed } from '../../services/store';
import Graph from '../Graph';
import useNetworkData from '../../hooks/useNetworkData';
import useDataConverter from '../../helpers/useDataConverter';
import { MemoryContainer, FixedValueItem, FixedValues, LeftValue, RightValue, LeftLabel, NameValue, RightLabel, NameLabel, MemoryTypes, RealTimeValues, NameContainer } from "./Styles/style";
import usePerformanceConfig from '../../hooks/usePerformanceConfig';

interface NetworkProps {
    hidden: boolean;
    interfaceName: string;
}

const Network: React.FC<NetworkProps> = ({ hidden, interfaceName }) => {
    const { download = [], upload = [], totalDownload, totalUpload } = useNetworkData(interfaceName);
    const setWifiSpeed = useSetWifiSpeed();
    const setEthernetSpeed = useSetEthernetSpeed();
    const convertData = useDataConverter();
    const performanceConfig = usePerformanceConfig();
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

        <MemoryContainer
        performanceBackgroundColor={performanceConfig.config.performance_background_color} 
        hidden={hidden}
         >

            <>
                <NameContainer>
                    <NameLabel>Network</NameLabel>
                    <NameValue>{interfaceName}</NameValue>
                </NameContainer>
                <Graph
                firstGraphValue={downloadValues}
                secondGraphValue={uploadValues}
                width="98%"
                />

                <div style={{ display: 'flex', marginTop: '100px', width: '70%' }}>
                    <RealTimeValues>
                        <MemoryTypes>Usage</MemoryTypes>
                        <FixedValueItem>
                            <LeftLabel performanceLabelColor={performanceConfig.config.performance_label_color}>Download</LeftLabel>
                            {totalDownload !== undefined && (
                                <LeftValue performanceValueColor={performanceConfig.config.performance_value_color}> {convertData(totalDownload).value}{' '}
                                    {convertData(totalDownload).unit}</LeftValue>
                            )}

                        </FixedValueItem>
                        <FixedValueItem>
                            <LeftLabel performanceLabelColor={performanceConfig.config.performance_label_color}>Upload</LeftLabel>
                            {totalUpload !== undefined && (
                                <LeftValue performanceValueColor={performanceConfig.config.performance_value_color}> {convertData(totalUpload).value}{' '}
                                    {convertData(totalUpload).unit}</LeftValue>
                            )}

                        </FixedValueItem>
                    </RealTimeValues>

                    <FixedValues>
                        <MemoryTypes>Speed</MemoryTypes>

                        <FixedValueItem>
                            <RightLabel performanceLabelColor={performanceConfig.config.performance_label_color}>Download</RightLabel>
                            <RightValue performanceValueColor={performanceConfig.config.performance_value_color}>
                                {download.length > 0 ? download[download.length - 1].value : 0}
                                {download.length > 0 ? download[download.length - 1].unit : 'B'}
                            </RightValue>
                        </FixedValueItem>
                        <FixedValueItem>
                            <RightLabel performanceLabelColor={performanceConfig.config.performance_label_color}>Upload</RightLabel>
                            <RightValue performanceValueColor={performanceConfig.config.performance_value_color}>
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
