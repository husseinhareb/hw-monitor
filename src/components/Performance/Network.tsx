import React, { useCallback, useMemo } from 'react';
import Graph from '../Graph/Graph';
import { useNetworkFullData } from '../../services/store';
import { convertData } from '../../helpers/useDataConverter';
import { MemoryContainer, FixedValueItem, FixedValues, LeftValue, RightValue, LeftLabel, NameValue, RightLabel, NameLabel, MemoryTypes, RealTimeValues, NameContainer } from "./Styles/style";
import { useTranslation } from 'react-i18next';

interface NetworkProps {
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

const Network: React.FC<NetworkProps> = ({ interfaceName, performanceConfig }) => {
    const networkFullData = useNetworkFullData();
    const data = networkFullData[interfaceName] || { download: [], upload: [], totalDownload: 0, totalUpload: 0 };
    const { download, upload, totalDownload, totalUpload } = data;
    const { t } = useTranslation();

    const downloadValues = useMemo(() => download.map(d => d.value), [download]);
    const uploadValues = useMemo(() => upload.map(u => u.value), [upload]);

    const convertedTotalDownload = useMemo(() => convertData(totalDownload), [totalDownload]);
    const convertedTotalUpload = useMemo(() => convertData(totalUpload), [totalUpload]);

    const formatSpeed = useCallback((arr: Array<{ value: number; unit: string }>) => {
        if (arr.length === 0) {
            return `0${t('network.bytes_per_sec')}`;
        }
        const { value, unit } = arr[arr.length - 1];
        return `${value} ${unit}${t('network.bytes_per_sec')}`;
    }, [t]);

    return (
        <MemoryContainer
            performanceBackgroundColor={performanceConfig.config.performance_background_color}
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
                <div style={{ flex: 1, minHeight: 0, width: '98%', margin: '0 auto' }}>
                    <Graph
                        firstGraphValue={downloadValues}
                        secondGraphValue={uploadValues}
                        width="100%"
                    />
                </div>

                <div style={{ display: 'flex', marginTop: '16px', padding: '0 10px', flexWrap: 'wrap', flexShrink: 0 }}>
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
                                    {convertedTotalDownload.value}{' '}{convertedTotalDownload.unit}
                                </LeftValue>
                            )}
                        </FixedValueItem>
                        <FixedValueItem>
                            <LeftLabel performanceLabelColor={performanceConfig.config.performance_label_color}>
                                {t('network.upload')}
                            </LeftLabel>
                            {totalUpload !== undefined && (
                                <LeftValue performanceValueColor={performanceConfig.config.performance_value_color}>
                                    {convertedTotalUpload.value}{' '}{convertedTotalUpload.unit}
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
