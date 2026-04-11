import React from "react";
import Graph from "../Graph/Graph";
import { GpuData } from "../../hooks/Performance/useGpuData";
import {
    CPU, LeftLabel,
    RightLabel,
    RightValue,
    LeftValue,
    NameValue,
    RealTimeValues,
    FixedValues,
    SpeedUsageContainer,
    SpeedUsageItem,
    FixedValueItem,
    NameLabel,
    NameContainer
} from "./Styles/style";
import { useTranslation } from "react-i18next";

interface GpuProps {
    gpuData: GpuData | null;
    gpuIndex: number;
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
    tick: number;
    gpuUsage: number[];
}

const Gpu: React.FC<GpuProps> = ({ gpuData, performanceConfig, tick, gpuUsage }) => {
    const { t } = useTranslation();

    return (
        <CPU
            performanceBackgroundColor={performanceConfig.config.performance_background_color}
        >
            <NameContainer>
                <NameLabel performanceTitleColor={performanceConfig.config.performance_title_color}>{t('performance.gpu')}</NameLabel>
                {gpuData && (
                    <NameValue performanceTitleColor={performanceConfig.config.performance_title_color}>{gpuData.name}</NameValue>
                )}
            </NameContainer>
            <div style={{ flex: 1, minHeight: 0, width: '98%', margin: '0 auto' }}>
                <Graph
                    firstGraphValue={gpuUsage}
                    maxValue={100}
                    width="100%"
                    tick={tick}
                />
            </div>
            {gpuData && (
                <div style={{ display: 'flex', marginTop: '16px', padding: '0 10px', flexWrap: 'wrap', flexShrink: 0 }}>
                    <RealTimeValues>
                        <SpeedUsageContainer>
                            <SpeedUsageItem>
                                <LeftLabel performanceLabelColor={performanceConfig.config.performance_label_color}>{t('performance.gpu')}</LeftLabel>
                                <LeftValue performanceValueColor={performanceConfig.config.performance_value_color}>{gpuData.clock_speed}</LeftValue>
                            </SpeedUsageItem>
                            <SpeedUsageItem>
                                <LeftLabel performanceLabelColor={performanceConfig.config.performance_label_color}>{t('performance.usage')}</LeftLabel>
                                <LeftValue performanceValueColor={performanceConfig.config.performance_value_color}>{gpuData.utilization}</LeftValue>
                            </SpeedUsageItem>
                        </SpeedUsageContainer>
                        <SpeedUsageContainer>
                            <SpeedUsageItem>
                                <LeftLabel performanceLabelColor={performanceConfig.config.performance_label_color}>{t('performance.temperature')}</LeftLabel>
                                <LeftValue performanceValueColor={performanceConfig.config.performance_value_color}>{gpuData.temperature}</LeftValue>
                            </SpeedUsageItem>
                            <SpeedUsageItem>
                                <LeftLabel performanceLabelColor={performanceConfig.config.performance_label_color}>{t('performance.wattage')}</LeftLabel>
                                <LeftValue performanceValueColor={performanceConfig.config.performance_value_color}>{gpuData.wattage}</LeftValue>
                            </SpeedUsageItem>
                        </SpeedUsageContainer>
                        <LeftLabel performanceLabelColor={performanceConfig.config.performance_label_color}>{t('performance.driver_version')}</LeftLabel>
                        <LeftValue performanceValueColor={performanceConfig.config.performance_value_color}>{gpuData.driver_version}</LeftValue>
                    </RealTimeValues>
                    <FixedValues>
                        <FixedValueItem>
                            <RightLabel performanceLabelColor={performanceConfig.config.performance_label_color}>{t('performance.memory_used')}</RightLabel>
                            <RightValue performanceValueColor={performanceConfig.config.performance_value_color}>{gpuData.memory_used}</RightValue>
                        </FixedValueItem>
                        <FixedValueItem>
                            <RightLabel performanceLabelColor={performanceConfig.config.performance_label_color}>{t('performance.memory_free')}</RightLabel>
                            <RightValue performanceValueColor={performanceConfig.config.performance_value_color}>{gpuData.memory_free}</RightValue>
                        </FixedValueItem>
                        <FixedValueItem>
                            <RightLabel performanceLabelColor={performanceConfig.config.performance_label_color}>{t('performance.memory_total')}</RightLabel>
                            <RightValue performanceValueColor={performanceConfig.config.performance_value_color}>{gpuData.memory_total}</RightValue>
                        </FixedValueItem>
                        <FixedValueItem>
                            <RightLabel performanceLabelColor={performanceConfig.config.performance_label_color}>{t('performance.fan_speed')}</RightLabel>
                            <RightValue performanceValueColor={performanceConfig.config.performance_value_color}>{gpuData.fan_speed}</RightValue>
                        </FixedValueItem>
                        <FixedValueItem>
                            <RightLabel performanceLabelColor={performanceConfig.config.performance_label_color}>{t('performance.performance_state')}</RightLabel>
                            <RightValue performanceValueColor={performanceConfig.config.performance_value_color}>{gpuData.performance_state}</RightValue>
                        </FixedValueItem>
                    </FixedValues>
                </div>
            )}
        </CPU>
    );
}

export default Gpu;
