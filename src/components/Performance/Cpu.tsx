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
    hidden: boolean;
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

const Cpu: React.FC<CpuProps> = ({ hidden, performanceConfig }) => {
    const { cpuData } = useCpuData();
    const [cpuUsage, setCpuUsage] = useState<number[]>([]);
    const totalUsages = useTotalUsagesData();
    const setCpu = useSetCpu();
    const { t } = useTranslation();
    useEffect(() => {
        if (cpuData !== null && cpuData.usage !== undefined) {
            setCpuUsage(prevCpuUsage => {
                const newActiveMem = [...prevCpuUsage, cpuData.usage as number];
                // Trim the array to keep only the last 20 elements
                if (newActiveMem.length > 20) {
                    return newActiveMem.slice(newActiveMem.length - 20);
                } else {
                    return newActiveMem;
                }
            });
        }
    }, [cpuData, setCpuUsage]);

    useEffect(() => {
        if (cpuData !== null && cpuUsage.length > 0) {
            setCpu(cpuUsage);
        }
    }, [cpuUsage, cpuData, setCpu]);


    return (
        <CPU
            performanceBackgroundColor={performanceConfig.config.performance_background_color}
            style={{ height: '100%', width: '100%', display: hidden ? 'none' : 'block' }}
        >
            <NameContainer>
                <NameLabel performanceTitleColor={performanceConfig.config.performance_title_color}>{t('performance.cpu')}</NameLabel>
                <NameValue performanceTitleColor={performanceConfig.config.performance_title_color}>{cpuData.name}</NameValue>
            </NameContainer>
            <div>
                <Graph
                    firstGraphValue={cpuUsage}
                    maxValue={100}
                    width="98%"
                />
            </div>
            <div style={{ display: 'flex', marginTop: '100px', width: '70%', flexWrap: 'wrap' }}>
                <RealTimeValues>
                    <SpeedUsageContainer>
                        <SpeedUsageItem>
                            <LeftLabel performanceLabelColor={performanceConfig.config.performance_label_color}>{t('performance.speed')}</LeftLabel>
                            <LeftValue performanceValueColor={performanceConfig.config.performance_value_color}>{cpuData.current_speed}GHz</LeftValue>
                        </SpeedUsageItem>
                        <SpeedUsageItem>
                            <LeftLabel performanceLabelColor={performanceConfig.config.performance_label_color}>{t('performance.usage')}</LeftLabel>
                            <LeftValue performanceValueColor={performanceConfig.config.performance_value_color}>{cpuData.usage}%</LeftValue>
                        </SpeedUsageItem>
                    </SpeedUsageContainer>
                    <SpeedUsageContainer>
                        <SpeedUsageItem>
                            <LeftLabel performanceLabelColor={performanceConfig.config.performance_label_color}>{t('performance.temperature')}</LeftLabel>
                            <LeftValue performanceValueColor={performanceConfig.config.performance_value_color}>{cpuData.temperature}</LeftValue>
                        </SpeedUsageItem>
                        <SpeedUsageItem>
                            <LeftLabel performanceLabelColor={performanceConfig.config.performance_label_color}>{t('performance.processes')}</LeftLabel>
                            <LeftValue performanceValueColor={performanceConfig.config.performance_value_color} style={{ 'textAlign': 'right' }}>{totalUsages.processes}</LeftValue>
                        </SpeedUsageItem>
                    </SpeedUsageContainer>
                    <LeftLabel performanceLabelColor={performanceConfig.config.performance_label_color}>{t('performance.uptime')}</LeftLabel>
                    <LeftValue performanceValueColor={performanceConfig.config.performance_value_color}>{cpuData.uptime}</LeftValue>
                </RealTimeValues>
                <FixedValues>
                    <FixedValueItem>
                        <RightLabel performanceLabelColor={performanceConfig.config.performance_label_color}>{t('performance.socket')}</RightLabel>
                        <RightValue performanceValueColor={performanceConfig.config.performance_value_color}>{cpuData.socket}</RightValue>
                    </FixedValueItem>
                    <FixedValueItem>
                        <RightLabel performanceLabelColor={performanceConfig.config.performance_label_color}>{t('performance.cores')}</RightLabel>
                        <RightValue performanceValueColor={performanceConfig.config.performance_value_color}>{cpuData.cores}</RightValue>
                    </FixedValueItem>
                    <FixedValueItem>
                        <RightLabel performanceLabelColor={performanceConfig.config.performance_label_color}>{t('performance.threads')}</RightLabel>
                        <RightValue performanceValueColor={performanceConfig.config.performance_value_color}>{cpuData.threads}</RightValue>
                    </FixedValueItem>
                    <FixedValueItem>
                        <RightLabel performanceLabelColor={performanceConfig.config.performance_label_color}>{t('performance.base_speed')}</RightLabel>
                        <RightValue performanceValueColor={performanceConfig.config.performance_value_color}>
                            {(cpuData.base_speed / 1000000).toFixed(1)} GHz
                        </RightValue>
                    </FixedValueItem>
                    <FixedValueItem>
                        <RightLabel performanceLabelColor={performanceConfig.config.performance_label_color}>{t('performance.max_speed')}</RightLabel>
                        <RightValue performanceValueColor={performanceConfig.config.performance_value_color}>
                            {(cpuData.max_speed / 1000000).toFixed(1)} GHz
                        </RightValue>
                    </FixedValueItem>

                    <FixedValueItem>
                        <RightLabel performanceLabelColor={performanceConfig.config.performance_label_color}>{t('performance.virtualization')}</RightLabel>
                        <RightValue performanceValueColor={performanceConfig.config.performance_value_color}>{cpuData.virtualization}</RightValue>
                    </FixedValueItem>
                </FixedValues>
            </div>
        </CPU>

    );
}

export default Cpu;
