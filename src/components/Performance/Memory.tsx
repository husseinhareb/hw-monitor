import React, { useState, useEffect } from "react";
import Graph from "../Graph";
import useMemoryData from "../../hooks/useMemoryData";
import { useSetMemory } from "../../services/store";
import useDataConverter from "../../helpers/useDataConverter";
import { MemoryContainer, FixedValueItem, FixedValues, LeftValue, RightValue, LeftLabel, NameValue, RightLabel, NameLabel, MemoryTypes, RealTimeValues } from "./Styles/style";
import { NameContainer } from "../../styles/general-style";
import { FaMemory } from "react-icons/fa";
import { IoMdSwap } from "react-icons/io";
interface MemoryProps {
    hidden: boolean;
}

const Memory: React.FC<MemoryProps> = ({ hidden }) => {
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
            setMemoryData({
                total: convertData(memoryUsage.total),
                free: convertData(memoryUsage.free),
                available: convertData(memoryUsage.available),
                cached: convertData(memoryUsage.cached),
                active: convertData(memoryUsage.active),
                swapTotal: convertData(memoryUsage.swap_total),
                swapCache: convertData(memoryUsage.swap_cache)
            });
        }
    }, [memoryUsage, convertData]);

    useEffect(() => {
        if (memoryUsage !== null && memoryUsage.active !== null) {
            setActiveMem(prevActiveMem => {
                const newActiveMem = [...prevActiveMem, convertData(memoryUsage.active).value as number];
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
        if (memoryUsage !== null) {
            setMemory(activeMem);
        }
    }, [activeMem, setMemory]);

    return (
        <MemoryContainer hidden={hidden}>
            {memoryData && (
                <>
                    <NameContainer>
                        <NameLabel>Memory</NameLabel>
                        <NameValue>{Math.floor(memoryData.total.value)} {memoryData.total.unit}</NameValue>
                    </NameContainer>
                    <Graph
                        firstGraphValue={activeMem}
                        maxValue={Math.floor(memoryData.total.value)}
                    />
                    <div style={{ display: 'flex', marginTop: '100px', width: '70%' }}>
                        <RealTimeValues>
                            <MemoryTypes>Ram <FaMemory style={{ marginLeft: '0.5em' }}  /></MemoryTypes>
                            <FixedValueItem>
                                <LeftLabel>Total</LeftLabel>
                                <LeftValue>{memoryData.total.value} {memoryData.total.unit}</LeftValue>
                            </FixedValueItem>
                            <FixedValueItem>

                                <LeftLabel>Free</LeftLabel>
                                <LeftValue>{memoryData.free.value} {memoryData.free.unit}</LeftValue>
                            </FixedValueItem>
                            <FixedValueItem>

                                <LeftLabel>Available</LeftLabel>
                                <LeftValue>{memoryData.available.value} {memoryData.available.unit}</LeftValue>
                            </FixedValueItem>

                            <FixedValueItem>

                                <LeftLabel>Cached</LeftLabel>
                                <LeftValue>{memoryData.cached.value} {memoryData.cached.unit}</LeftValue>
                            </FixedValueItem>

                            <FixedValueItem>
                                <LeftLabel>Active</LeftLabel>
                                <LeftValue> {memoryData.active.value} {memoryData.active.unit}</LeftValue>
                            </FixedValueItem>
                        </RealTimeValues>

                        <FixedValues>
                            <MemoryTypes>Swap<IoMdSwap style={{ marginLeft: '0.5em' }}/></MemoryTypes>

                            <FixedValueItem>
                                <RightLabel>Total</RightLabel>
                                <RightValue>{memoryData.swapTotal.value} {memoryData.swapTotal.unit}</RightValue>
                            </FixedValueItem>
                            <FixedValueItem>
                                <RightLabel>Swap Cache</RightLabel>
                                <RightValue>{memoryData.swapCache.value} {memoryData.swapCache.unit}</RightValue>
                            </FixedValueItem>
                        </FixedValues>
                    </div>
                </>
            )}
        </MemoryContainer>
    );
};
export default Memory;
