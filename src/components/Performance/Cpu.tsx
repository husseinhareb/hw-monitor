import React from "react";
import Graph from "../Graph/Graph";
import { CpuData } from "../../hooks/Performance/useCpuData";
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
import useTotalUsagesData from "../../hooks/Proc/useTotalUsagesData";
import { useTranslation } from "react-i18next";
import styled from "styled-components";

interface CpuProps {
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
    cpuData: CpuData;
    cpuUsage: number[];
    coreUsageHistories: number[][];
    viewMode: 'overall' | 'per-core';
    onToggleView: () => void;
}

const CoreGrid = styled.div<{ columns: number }>`
    display: grid;
    grid-template-columns: repeat(${p => p.columns}, 1fr);
    gap: 4px;
    width: 98%;
    margin: 0 auto;
`;

const CoreCell = styled.div<{ bgColor: string; labelColor: string }>`
    position: relative;
    background-color: ${p => p.bgColor};
    min-height: 90px;
`;

const CoreLabel = styled.span<{ color: string }>`
    position: absolute;
    top: 3px;
    left: 6px;
    font-size: 10px;
    color: ${p => p.color};
    z-index: 1;
    pointer-events: none;
`;

const CoreUsageLabel = styled.span<{ color: string }>`
    position: absolute;
    top: 3px;
    right: 6px;
    font-size: 10px;
    color: ${p => p.color};
    z-index: 1;
    pointer-events: none;
`;

const ViewToggle = styled.button<{ bgColor: string; color: string; active: boolean; borderColor: string }>`
    background-color: ${p => p.active ? p.borderColor : p.bgColor};
    color: ${p => p.color};
    border: 1px solid ${p => p.borderColor};
    padding: 3px 10px;
    font-size: 11px;
    cursor: pointer;
    &:hover { opacity: 0.85; }
`;

function getGridColumns(coreCount: number): number {
    if (coreCount <= 4) return 2;
    if (coreCount <= 8) return 4;
    if (coreCount <= 16) return 4;
    if (coreCount <= 32) return 8;
    return 8;
}

const Cpu: React.FC<CpuProps> = ({ performanceConfig, tick, cpuData, cpuUsage, coreUsageHistories, viewMode, onToggleView }) => {
    const totalUsages = useTotalUsagesData();
    const { t } = useTranslation();

    const coreCount = coreUsageHistories.length;
    const columns = getGridColumns(coreCount);

    return (
        <CPU
            performanceBackgroundColor={performanceConfig.config.performance_background_color}
            style={{ height: '100%', width: '100%', overflow: 'auto' }}
        >
            <NameContainer>
                <NameLabel performanceTitleColor={performanceConfig.config.performance_title_color}>{t('performance.cpu')}</NameLabel>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginRight: '10px' }}>
                    <ViewToggle
                        bgColor={performanceConfig.config.performance_background_color}
                        color={performanceConfig.config.performance_title_color}
                        borderColor={performanceConfig.config.performance_graph_color}
                        active={viewMode === 'overall'}
                        onClick={viewMode === 'overall' ? undefined : onToggleView}
                    >
                        {t('performance.overall_usage')}
                    </ViewToggle>
                    <ViewToggle
                        bgColor={performanceConfig.config.performance_background_color}
                        color={performanceConfig.config.performance_title_color}
                        borderColor={performanceConfig.config.performance_graph_color}
                        active={viewMode === 'per-core'}
                        onClick={viewMode === 'per-core' ? undefined : onToggleView}
                    >
                        {t('performance.logical_processors')}
                    </ViewToggle>
                </div>
                <NameValue performanceTitleColor={performanceConfig.config.performance_title_color}>{cpuData.name ?? 'N/A'}</NameValue>
            </NameContainer>

            {viewMode === 'overall' ? (
                <div>
                    <Graph
                        firstGraphValue={cpuUsage}
                        maxValue={100}
                        width="98%"
                        tick={tick}
                    />
                </div>
            ) : (
                <CoreGrid columns={columns}>
                    {coreUsageHistories.map((history, i) => {
                        const latest = history.length > 0 ? history[history.length - 1] : 0;
                        return (
                            <CoreCell
                                key={i}
                                bgColor={performanceConfig.config.performance_background_color}
                                labelColor={performanceConfig.config.performance_label_color}
                            >
                                <CoreLabel color={performanceConfig.config.performance_label_color}>
                                    {i}
                                </CoreLabel>
                                <CoreUsageLabel color={performanceConfig.config.performance_value_color}>
                                    {Math.round(latest)}%
                                </CoreUsageLabel>
                                <Graph
                                    firstGraphValue={history}
                                    maxValue={100}
                                    height="90px"
                                    width="100%"
                                    tick={tick}
                                />
                            </CoreCell>
                        );
                    })}
                </CoreGrid>
            )}

            <div style={{ display: 'flex', marginTop: '20px', width: '70%', flexWrap: 'wrap' }}>
                <RealTimeValues>
                    <SpeedUsageContainer>
                        <SpeedUsageItem>
                            <LeftLabel performanceLabelColor={performanceConfig.config.performance_label_color}>{t('performance.speed')}</LeftLabel>
                            <LeftValue performanceValueColor={performanceConfig.config.performance_value_color}>{cpuData.current_speed != null ? `${cpuData.current_speed}GHz` : 'N/A'}</LeftValue>
                        </SpeedUsageItem>
                        <SpeedUsageItem>
                            <LeftLabel performanceLabelColor={performanceConfig.config.performance_label_color}>{t('performance.usage')}</LeftLabel>
                            <LeftValue performanceValueColor={performanceConfig.config.performance_value_color}>{cpuData.usage != null ? `${cpuData.usage}%` : 'N/A'}</LeftValue>
                        </SpeedUsageItem>
                    </SpeedUsageContainer>
                    <SpeedUsageContainer>
                        <SpeedUsageItem>
                            <LeftLabel performanceLabelColor={performanceConfig.config.performance_label_color}>{t('performance.temperature')}</LeftLabel>
                            <LeftValue performanceValueColor={performanceConfig.config.performance_value_color}>{cpuData.temperature ?? 'N/A'}</LeftValue>
                        </SpeedUsageItem>
                        <SpeedUsageItem>
                            <LeftLabel performanceLabelColor={performanceConfig.config.performance_label_color}>{t('performance.processes')}</LeftLabel>
                            <LeftValue performanceValueColor={performanceConfig.config.performance_value_color} style={{ 'textAlign': 'right' }}>{totalUsages.processes}</LeftValue>
                        </SpeedUsageItem>
                    </SpeedUsageContainer>
                    <LeftLabel performanceLabelColor={performanceConfig.config.performance_label_color}>{t('performance.uptime')}</LeftLabel>
                    <LeftValue performanceValueColor={performanceConfig.config.performance_value_color}>{cpuData.uptime ?? 'N/A'}</LeftValue>
                </RealTimeValues>
                <FixedValues>
                    <FixedValueItem>
                        <RightLabel performanceLabelColor={performanceConfig.config.performance_label_color}>{t('performance.socket')}</RightLabel>
                        <RightValue performanceValueColor={performanceConfig.config.performance_value_color}>{cpuData.socket ?? 'N/A'}</RightValue>
                    </FixedValueItem>
                    <FixedValueItem>
                        <RightLabel performanceLabelColor={performanceConfig.config.performance_label_color}>{t('performance.cores')}</RightLabel>
                        <RightValue performanceValueColor={performanceConfig.config.performance_value_color}>{cpuData.cores ?? 'N/A'}</RightValue>
                    </FixedValueItem>
                    <FixedValueItem>
                        <RightLabel performanceLabelColor={performanceConfig.config.performance_label_color}>{t('performance.threads')}</RightLabel>
                        <RightValue performanceValueColor={performanceConfig.config.performance_value_color}>{cpuData.threads ?? 'N/A'}</RightValue>
                    </FixedValueItem>
                    <FixedValueItem>
                        <RightLabel performanceLabelColor={performanceConfig.config.performance_label_color}>{t('performance.base_speed')}</RightLabel>
                        <RightValue performanceValueColor={performanceConfig.config.performance_value_color}>
                            {cpuData.base_speed != null ? (parseFloat(cpuData.base_speed) / 1000000).toFixed(1) + ' GHz' : 'N/A'}
                        </RightValue>
                    </FixedValueItem>
                    <FixedValueItem>
                        <RightLabel performanceLabelColor={performanceConfig.config.performance_label_color}>{t('performance.max_speed')}</RightLabel>
                        <RightValue performanceValueColor={performanceConfig.config.performance_value_color}>
                            {cpuData.max_speed != null ? (parseFloat(cpuData.max_speed) / 1000000).toFixed(1) + ' GHz' : 'N/A'}
                        </RightValue>
                    </FixedValueItem>

                    <FixedValueItem>
                        <RightLabel performanceLabelColor={performanceConfig.config.performance_label_color}>{t('performance.virtualization')}</RightLabel>
                        <RightValue performanceValueColor={performanceConfig.config.performance_value_color}>{cpuData.virtualization ?? 'N/A'}</RightValue>
                    </FixedValueItem>
                </FixedValues>
            </div>
        </CPU>

    );
}

export default Cpu;
