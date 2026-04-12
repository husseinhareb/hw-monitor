import React, { useState, useEffect } from "react";
import Graph from "../Graph/Graph";
import { MemoryUsage, MemoryHardwareInfo } from "../../hooks/Performance/useMemoryData";
import useDataConverter from "../../helpers/useDataConverter";
import { MemoryContainer, FixedValueItem, FixedValues, LeftValue, RightValue, NameValue, RightLabel, NameLabel, MemoryTypes, RealTimeValues, NameContainer } from "./Styles/style";
import { FaMemory } from "react-icons/fa";
import { IoMdSwap } from "react-icons/io";
import { useTranslation } from "react-i18next";

interface MemoryProps {
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
    memoryUsage: MemoryUsage | null;
    activeMem: number[];
    hardwareInfo: MemoryHardwareInfo | null;
}

const Memory: React.FC<MemoryProps> = ({ performanceConfig, tick, memoryUsage, activeMem, hardwareInfo }) => {
    const convertData = useDataConverter();
    const { t } = useTranslation();

    const [memoryData, setMemoryData] = useState<{
        total: { value: number, unit: string },
        free: { value: number, unit: string },
        available: { value: number, unit: string },
        cached: { value: number, unit: string },
        active: { value: number, unit: string },
        swapTotal: { value: number, unit: string },
        swapCache: { value: number, unit: string }
    } | null>(null);

    useEffect(() => {
        if (memoryUsage !== null) {
            const newMemoryData = {
                total: convertData(memoryUsage.total),
                free: convertData(memoryUsage.free),
                available: convertData(memoryUsage.available),
                cached: convertData(memoryUsage.cached),
                active: convertData(memoryUsage.active),
                swapTotal: convertData(memoryUsage.swap_total),
                swapCache: convertData(memoryUsage.swap_cache)
            };
            setMemoryData(newMemoryData);
        }
    }, [memoryUsage, convertData]);

    return (
        <MemoryContainer 
            performanceBackgroundColor={performanceConfig.config.performance_background_color}
        >
            {memoryData && (
                <>
                    <NameContainer>
                        <NameLabel performanceTitleColor={performanceConfig.config.performance_title_color}>{t('performance.memory')}</NameLabel>
                        <NameValue performanceTitleColor={performanceConfig.config.performance_title_color}>{Math.floor(memoryData.total.value)} {memoryData.total.unit}</NameValue>
                    </NameContainer>
                    <div style={{ flex: 1, minHeight: 0, width: '98%', margin: '0 auto' }}>
                        <Graph
                            firstGraphValue={activeMem}
                            maxValue={Math.floor(memoryData.total.value)}
                            width="100%"
                            tick={tick}
                        />
                    </div>
                    <div style={{ display: 'flex', marginTop: '16px', padding: '0 10px', flexWrap: 'wrap', flexShrink: 0 }}>
                        <RealTimeValues>
                            <MemoryTypes performanceValueColor={performanceConfig.config.performance_value_color}>{t('performance.ram')} <FaMemory style={{ marginLeft: '0.5em' }} /></MemoryTypes>
                            <FixedValueItem>
                                <RightLabel performanceLabelColor={performanceConfig.config.performance_label_color}>{t('performance.total')} </RightLabel>
                                <LeftValue performanceValueColor={performanceConfig.config.performance_value_color}>{memoryData.total.value} {memoryData.total.unit}</LeftValue>
                            </FixedValueItem>
                            <FixedValueItem>
                                <RightLabel performanceLabelColor={performanceConfig.config.performance_label_color}>{t('performance.free')} </RightLabel>
                                <LeftValue performanceValueColor={performanceConfig.config.performance_value_color}>{memoryData.free.value} {memoryData.free.unit}</LeftValue>
                            </FixedValueItem>
                            <FixedValueItem>
                                <RightLabel performanceLabelColor={performanceConfig.config.performance_label_color}>{t('performance.available')} </RightLabel>
                                <LeftValue performanceValueColor={performanceConfig.config.performance_value_color}>{memoryData.available.value} {memoryData.available.unit}</LeftValue>
                            </FixedValueItem>
                            <FixedValueItem>
                                <RightLabel performanceLabelColor={performanceConfig.config.performance_label_color}>{t('performance.cached')} </RightLabel>
                                <LeftValue performanceValueColor={performanceConfig.config.performance_value_color}>{memoryData.cached.value} {memoryData.cached.unit}</LeftValue>
                            </FixedValueItem>
                            <FixedValueItem>
                                <RightLabel performanceLabelColor={performanceConfig.config.performance_label_color}>{t('performance.active')} </RightLabel>
                                <LeftValue performanceValueColor={performanceConfig.config.performance_value_color}> {memoryData.active.value} {memoryData.active.unit}</LeftValue>
                            </FixedValueItem>
                        </RealTimeValues>
                        <FixedValues>
                            <MemoryTypes performanceValueColor={performanceConfig.config.performance_value_color}>{t('performance.swap')} <IoMdSwap style={{ marginLeft: '0.5em' }}/></MemoryTypes>
                            <FixedValueItem>
                                <RightLabel performanceLabelColor={performanceConfig.config.performance_label_color}>{t('performance.total')} </RightLabel>
                                <RightValue performanceValueColor={performanceConfig.config.performance_value_color}>{memoryData.swapTotal.value} {memoryData.swapTotal.unit}</RightValue>
                            </FixedValueItem>
                            <FixedValueItem>
                                <RightLabel performanceLabelColor={performanceConfig.config.performance_label_color}>{t('performance.swap_cache')} </RightLabel>
                                <RightValue performanceValueColor={performanceConfig.config.performance_value_color}>{memoryData.swapCache.value} {memoryData.swapCache.unit}</RightValue>
                            </FixedValueItem>
                        </FixedValues>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 32px', padding: '10px 20px 6px', flexShrink: 0, borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: '8px' }}>
                        <FixedValueItem>
                            <RightLabel performanceLabelColor={performanceConfig.config.performance_label_color}>{t('performance.mem_speed')} </RightLabel>
                            <RightValue performanceValueColor={performanceConfig.config.performance_value_color}>{hardwareInfo?.speed ?? 'N/A'}</RightValue>
                        </FixedValueItem>
                        <FixedValueItem>
                            <RightLabel performanceLabelColor={performanceConfig.config.performance_label_color}>{t('performance.slots_used')} </RightLabel>
                            <RightValue performanceValueColor={performanceConfig.config.performance_value_color}>{hardwareInfo?.slots_used ?? 'N/A'}</RightValue>
                        </FixedValueItem>
                        <FixedValueItem>
                            <RightLabel performanceLabelColor={performanceConfig.config.performance_label_color}>{t('performance.form_factor')} </RightLabel>
                            <RightValue performanceValueColor={performanceConfig.config.performance_value_color}>{hardwareInfo?.form_factor ?? 'N/A'}</RightValue>
                        </FixedValueItem>
                        <FixedValueItem>
                            <RightLabel performanceLabelColor={performanceConfig.config.performance_label_color}>{t('performance.mem_type')} </RightLabel>
                            <RightValue performanceValueColor={performanceConfig.config.performance_value_color}>{hardwareInfo?.memory_type ?? 'N/A'}</RightValue>
                        </FixedValueItem>
                    </div>
                </>
            )}
        </MemoryContainer>
    );
};

export default Memory;
