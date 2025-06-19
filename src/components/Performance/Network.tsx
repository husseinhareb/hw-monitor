import React, { useEffect, useMemo } from 'react';
import { useSetEthernetSpeed, useSetWifiSpeed } from '../../services/store';
import Graph from '../Graph/Graph';
import useNetworkData from '../../hooks/Performance/useNetworkData';
import useDataConverter from '../../helpers/useDataConverter';
import { MemoryContainer, FixedValueItem, FixedValues, LeftValue, RightValue, LeftLabel, NameValue, RightLabel, NameLabel, MemoryTypes, RealTimeValues, NameContainer } from "./Styles/style";
import { useTranslation } from 'react-i18next';
import usePerformanceTicker from '../../hooks/Performance/usePerformanceTicker';

interface NetworkProps {
    hidden: boolean;
    interfaceName: string;
    performanceConfig: {
        config: {
            performance_update_time: number;
            performance_sidebar_background_color: string;
            performance_sidebar_color: string;
            performance_sidebar_selected_color: string;
            performance_background_color: string;
            performance_title_color: string;
            performance_label_color: string;
            performance_value_color: string;
            performance_graph_color: string;
            performance_sec_graph_color: string;
        }
    };
}

const Network: React.FC<NetworkProps> = ({ hidden, interfaceName, performanceConfig }) => {
    const { download = [], upload = [], totalDownload, totalUpload } = useNetworkData(interfaceName);
    const setWifiSpeed = useSetWifiSpeed();
    const setEthernetSpeed = useSetEthernetSpeed();
    const convertData = useDataConverter();
    const { t } = useTranslation();
    const tick = usePerformanceTicker();

    const downloadValues = useMemo(() => download.map(d => d.value), [download]);
    const uploadValues = useMemo(() => upload.map(u => u.value), [upload]);

    useEffect(() => {
        if (interfaceName.includes('wl')) {
            setWifiSpeed(downloadValues, uploadValues);
        } else if (interfaceName.includes('en') || interfaceName.includes('eth')) {
            setEthernetSpeed(downloadValues, uploadValues);
        }
    }, [interfaceName, downloadValues, uploadValues, setWifiSpeed, setEthernetSpeed]);

    // inside your component:
    const formatSpeed = (arr: Array<{ value: number; unit: string }>) => {
        if (arr.length === 0) {
            // no data → 0 B/s (or your localized translation)
            return `0${t('network.bytes_per_sec')}`;
        }
        const { value, unit } = arr[arr.length - 1];
        // always append the “per second” part after the unit
        return `${value} ${unit}${t('network.bytes_per_sec')}`;
    };

    return (
        <MemoryContainer
            performanceBackgroundColor={performanceConfig.config.performance_background_color}
            hidden={hidden}
        >
            <>
                <NameContainer>
                    <NameLabel performanceTitleColor={performanceConfig.config.performance_title_color}>
                        {t('network.title')}
                    </NameLabel>
                    <NameValue performanceTitleColor={performanceConfig.config.performance_title_color}>
                        {interfaceName}
                    </NameValue>
                </NameContainer>
                <Graph
                    firstGraphValue={downloadValues}
                    secondGraphValue={uploadValues}
                    width="98%"
                    tick={tick}
                />

                <div style={{ display: 'flex', marginTop: '100px', width: '70%' }}>
                    <RealTimeValues>
                        <MemoryTypes performanceValueColor={performanceConfig.config.performance_value_color}>
                            {t('network.usage')}
                        </MemoryTypes>
                        <FixedValueItem>
                            <LeftLabel performanceLabelColor={performanceConfig.config.performance_label_color}>
                                {t('network.download')}
                            </LeftLabel>
                            {totalDownload !== undefined && (
                                <LeftValue performanceValueColor={performanceConfig.config.performance_value_color}>
                                    {convertData(totalDownload).value}{' '}{convertData(totalDownload).unit}
                                </LeftValue>
                            )}
                        </FixedValueItem>
                        <FixedValueItem>
                            <LeftLabel performanceLabelColor={performanceConfig.config.performance_label_color}>
                                {t('network.upload')}
                            </LeftLabel>
                            {totalUpload !== undefined && (
                                <LeftValue performanceValueColor={performanceConfig.config.performance_value_color}>
                                    {convertData(totalUpload).value}{' '}{convertData(totalUpload).unit}
                                </LeftValue>
                            )}
                        </FixedValueItem>
                    </RealTimeValues>

                    <FixedValues>
                        <MemoryTypes performanceValueColor={performanceConfig.config.performance_value_color}>
                            {t('network.speed')}
                        </MemoryTypes>

                        <FixedValueItem>
                            <RightLabel performanceLabelColor={performanceConfig.config.performance_label_color}>
                                {t('network.download')}
                            </RightLabel>
                            <RightValue performanceValueColor={performanceConfig.config.performance_value_color}>
                                {formatSpeed(download)}
                            </RightValue>
                        </FixedValueItem>
                        <FixedValueItem>
                            <RightLabel performanceLabelColor={performanceConfig.config.performance_label_color}>
                                {t('network.upload')}
                            </RightLabel>
                            <RightValue performanceValueColor={performanceConfig.config.performance_value_color}>
                                {formatSpeed(upload)}
                            </RightValue>
                        </FixedValueItem>
                    </FixedValues>
                </div>
            </>
        </MemoryContainer>
    );
};
export default Network;
