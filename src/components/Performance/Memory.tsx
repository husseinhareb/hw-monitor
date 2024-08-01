import React, { useState, useEffect } from "react";
import Graph from "../Graph/Graph";
import useMemoryData from "../../hooks/Performance/useMemoryData";
import { useSetMemory } from "../../services/store";
import useDataConverter from "../../helpers/useDataConverter";
import { MemoryContainer, FixedValueItem, FixedValues, LeftValue, RightValue, NameValue, RightLabel, NameLabel, MemoryTypes, RealTimeValues } from "./Styles/style";
import { NameContainer } from "../../styles/general-style";
import { FaMemory } from "react-icons/fa";
import { IoMdSwap } from "react-icons/io";

interface MemoryProps {
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

const Memory: React.FC<MemoryProps> = ({ hidden, performanceConfig }) => {
    const memoryUsage = useMemoryData();
    const [activeMem, setActiveMem] = useState<number[]>([]);
    const setMemory = useSetMemory();
    const convertData = useDataConverter();

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

            const activeValue = newMemoryData.active.value as number;
            setActiveMem(prevActiveMem => {
                const newActiveMem = [...prevActiveMem, activeValue];
                // Trim the array to keep only the last 20 elements
                if (newActiveMem.length > 20) {
                    return newActiveMem.slice(newActiveMem.length - 20);
                } else {
                    return newActiveMem;
                }
            });
        }
    }, [memoryUsage]);

    useEffect(() => {
        setMemory(activeMem);
    }, [activeMem, setMemory]);

    return (
        <MemoryContainer 
            performanceBackgroundColor={performanceConfig.config.performance_background_color}
            hidden={hidden}
        >
            {memoryData && (
                <>
                    <NameContainer>
                        <NameLabel performanceTitleColor={performanceConfig.config.performance_title_color}>Memory</NameLabel>
                        <NameValue performanceTitleColor={performanceConfig.config.performance_title_color}>{Math.floor(memoryData.total.value)} {memoryData.total.unit}</NameValue>
                    </NameContainer>
                    <Graph
                        firstGraphValue={activeMem}
                        maxValue={Math.floor(memoryData.total.value)}
                        width="98%"
                    />
                    <div style={{ display: 'flex', marginTop: '100px', width: '70%' }}>
                        <RealTimeValues>
                            <MemoryTypes performanceValueColor={performanceConfig.config.performance_value_color}>Ram <FaMemory style={{ marginLeft: '0.5em' }} /></MemoryTypes>
                            <FixedValueItem>
                                <RightLabel performanceLabelColor={performanceConfig.config.performance_label_color}>Total</RightLabel>
                                <LeftValue performanceValueColor={performanceConfig.config.performance_value_color}>{memoryData.total.value} {memoryData.total.unit}</LeftValue>
                            </FixedValueItem>
                            <FixedValueItem>
                                <RightLabel performanceLabelColor={performanceConfig.config.performance_label_color}>Free</RightLabel>
                                <LeftValue performanceValueColor={performanceConfig.config.performance_value_color}>{memoryData.free.value} {memoryData.free.unit}</LeftValue>
                            </FixedValueItem>
                            <FixedValueItem>
                                <RightLabel performanceLabelColor={performanceConfig.config.performance_label_color}>Available</RightLabel>
                                <LeftValue performanceValueColor={performanceConfig.config.performance_value_color}>{memoryData.available.value} {memoryData.available.unit}</LeftValue>
                            </FixedValueItem>
                            <FixedValueItem>
                                <RightLabel performanceLabelColor={performanceConfig.config.performance_label_color}>Cached</RightLabel>
                                <LeftValue performanceValueColor={performanceConfig.config.performance_value_color}>{memoryData.cached.value} {memoryData.cached.unit}</LeftValue>
                            </FixedValueItem>
                            <FixedValueItem>
                                <RightLabel performanceLabelColor={performanceConfig.config.performance_label_color}>Active</RightLabel>
                                <LeftValue performanceValueColor={performanceConfig.config.performance_value_color}> {memoryData.active.value} {memoryData.active.unit}</LeftValue>
                            </FixedValueItem>
                        </RealTimeValues>
                        <FixedValues>
                            <MemoryTypes performanceValueColor={performanceConfig.config.performance_value_color}>Swap<IoMdSwap style={{ marginLeft: '0.5em' }}/></MemoryTypes>
                            <FixedValueItem>
                                <RightLabel performanceLabelColor={performanceConfig.config.performance_label_color}>Total</RightLabel>
                                <RightValue performanceValueColor={performanceConfig.config.performance_value_color}>{memoryData.swapTotal.value} {memoryData.swapTotal.unit}</RightValue>
                            </FixedValueItem>
                            <FixedValueItem>
                                <RightLabel performanceLabelColor={performanceConfig.config.performance_label_color}>Swap Cache</RightLabel>
                                <RightValue performanceValueColor={performanceConfig.config.performance_value_color}>{memoryData.swapCache.value} {memoryData.swapCache.unit}</RightValue>
                            </FixedValueItem>
                        </FixedValues>
                    </div>
                </>
            )}
        </MemoryContainer>
    );
};

export default Memory;
