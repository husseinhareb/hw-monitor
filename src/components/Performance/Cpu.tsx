import React, { useState, useEffect } from "react";
import Graph from "../Graph/Graph";
import { useSetCpu } from "../../services/store";
import useCpuData from "../../hooks/Performance/useCpuData";
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
}

const Cpu: React.FC<CpuProps> = ({ performanceConfig, tick }) => {
    const { cpuData } = useCpuData();
    const [cpuUsage, setCpuUsage] = useState<number[]>([]);
    const totalUsages = useTotalUsagesData();
    const setCpu = useSetCpu();
    const { t } = useTranslation();

    useEffect(() => {
        if (cpuData !== null && cpuData.usage != null) {
            setCpuUsage(prevCpuUsage => [...prevCpuUsage, cpuData.usage as number].slice(-20));
        }
    }, [cpuData]);

    useEffect(() => {
        if (cpuUsage.length > 0) {
            setCpu(cpuUsage);
        }
    }, [cpuUsage, setCpu]);


    return (
        <CPU
            performanceBackgroundColor={performanceConfig.config.performance_background_color}
            style={{ height: '100%', width: '100%' }}
        >
            <NameContainer>
                <NameLabel performanceTitleColor={performanceConfig.config.performance_title_color}>{t('performance.cpu')}</NameLabel>
                <NameValue performanceTitleColor={performanceConfig.config.performance_title_color}>{cpuData.name ?? 'N/A'}</NameValue>
            </NameContainer>
            <div>
                <Graph
                    firstGraphValue={cpuUsage}
                    maxValue={100}
                    width="98%"
                    tick={tick}

                />
            </div>
            <div style={{ display: 'flex', marginTop: '100px', width: '70%', flexWrap: 'wrap' }}>
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
