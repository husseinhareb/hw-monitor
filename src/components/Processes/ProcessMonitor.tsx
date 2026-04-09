import React, { useState, useEffect, useRef } from 'react';
import { Process } from '../../hooks/Proc/useProcessData';
import Graph from '../Graph/Graph';
import usePerformanceConfig from '../../hooks/Performance/usePerformanceConfig';
import useProcessConfig from '../../hooks/Proc/useProcessConfig';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

interface ProcessMonitorProps {
    pid: number;
    name: string;
    processes: Process[];
    onClose: () => void;
}

const MAX_POINTS = 20;

const MonitorOverlay = styled.div<{ bgColor: string; borderColor: string }>`
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 45vh;
    background-color: ${props => props.bgColor};
    border-top: 2px solid ${props => props.borderColor};
    z-index: 10;
    display: flex;
    flex-direction: column;
    overflow: hidden;
`;

const MonitorHeader = styled.div<{ bgColor: string; color: string }>`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 16px;
    background-color: ${props => props.bgColor};
    color: ${props => props.color};
    flex-shrink: 0;
`;

const MonitorTitle = styled.span`
    font-size: 16px;
    font-weight: bold;
`;

const CloseButton = styled.button<{ bgColor: string; color: string }>`
    background-color: ${props => props.bgColor};
    color: ${props => props.color};
    border: none;
    padding: 4px 12px;
    font-size: 14px;
    cursor: pointer;
    &:hover {
        opacity: 0.8;
    }
`;

const GraphsContainer = styled.div`
    display: flex;
    flex: 1;
    padding: 8px;
    gap: 16px;
    overflow: hidden;
`;

const GraphPanel = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
`;

const GraphLabel = styled.div<{ color: string }>`
    color: ${props => props.color};
    font-size: 14px;
    margin-bottom: 4px;
    text-align: center;
`;

const CurrentValue = styled.div<{ color: string }>`
    color: ${props => props.color};
    font-size: 13px;
    text-align: center;
    margin-top: 4px;
`;

const EndedMessage = styled.div<{ color: string }>`
    color: ${props => props.color};
    font-size: 14px;
    text-align: center;
    padding: 8px;
    opacity: 0.7;
`;

const parseMemoryToMb = (memStr: string): number => {
    if (typeof memStr !== 'string') return 0;
    const match = memStr.match(/([\d.]+)\s*(\w+)/);
    if (!match) return 0;
    const value = parseFloat(match[1]);
    const unit = match[2].toLowerCase();
    if (unit === 'gb') return value * 1000;
    if (unit === 'mb') return value;
    if (unit === 'kb') return value / 1000;
    return value / (1000 * 1000);
};

const ProcessMonitor: React.FC<ProcessMonitorProps> = ({ pid, name, processes, onClose }) => {
    const [cpuHistory, setCpuHistory] = useState<number[]>([]);
    const [memHistory, setMemHistory] = useState<number[]>([]);
    const [tick, setTick] = useState(0);
    const [processAlive, setProcessAlive] = useState(true);
    const prevProcessesRef = useRef<Process[]>(processes);
    const { t } = useTranslation();
    const performanceConfig = usePerformanceConfig();
    const processConfig = useProcessConfig();

    useEffect(() => {
        // Skip if the processes array reference hasn't changed
        if (processes === prevProcessesRef.current && tick > 0) return;
        prevProcessesRef.current = processes;

        const proc = processes.find(p => p.pid === pid);
        if (!proc) {
            setProcessAlive(false);
            return;
        }

        setProcessAlive(true);

        const cpuVal = typeof proc.cpu_usage === 'string'
            ? parseFloat(proc.cpu_usage as unknown as string)
            : (proc.cpu_usage || 0);
        const memVal = parseMemoryToMb(proc.memory);

        setCpuHistory(prev => {
            const next = [...prev, isNaN(cpuVal) ? 0 : cpuVal];
            return next.length > MAX_POINTS ? next.slice(-MAX_POINTS) : next;
        });
        setMemHistory(prev => {
            const next = [...prev, memVal];
            return next.length > MAX_POINTS ? next.slice(-MAX_POINTS) : next;
        });
        setTick(t => t + 1);
    }, [processes, pid]);

    const currentCpu = cpuHistory.length > 0 ? cpuHistory[cpuHistory.length - 1] : 0;
    const currentMem = memHistory.length > 0 ? memHistory[memHistory.length - 1] : 0;

    return (
        <MonitorOverlay bgColor={performanceConfig.config.performance_background_color} borderColor={processConfig.config.processes_monitor_border_color}>
            <MonitorHeader
                bgColor={processConfig.config.processes_head_background_color}
                color={processConfig.config.processes_head_color}
            >
                <MonitorTitle>
                    {t('proc.monitor_title')}: {name} (PID: {pid})
                </MonitorTitle>
                <CloseButton
                    bgColor={processConfig.config.processes_body_background_color}
                    color={processConfig.config.processes_body_color}
                    onClick={onClose}
                >
                    ✕
                </CloseButton>
            </MonitorHeader>
            {!processAlive && (
                <EndedMessage color={performanceConfig.config.performance_value_color}>
                    {t('proc.monitor_process_ended')}
                </EndedMessage>
            )}
            <GraphsContainer>
                <GraphPanel>
                    <GraphLabel color={performanceConfig.config.performance_title_color}>
                        {t('proc.monitor_cpu')}
                    </GraphLabel>
                    <Graph
                        tick={tick}
                        firstGraphValue={cpuHistory}
                        maxValue={100}
                        height="calc(100% - 50px)"
                        width="100%"
                        updateInterval={processConfig.config.processes_update_time}
                    />
                    <CurrentValue color={performanceConfig.config.performance_value_color}>
                        {t('proc.monitor_current')}: {currentCpu.toFixed(2)}%
                    </CurrentValue>
                </GraphPanel>
                <GraphPanel>
                    <GraphLabel color={performanceConfig.config.performance_title_color}>
                        {t('proc.monitor_memory')}
                    </GraphLabel>
                    <Graph
                        tick={tick}
                        firstGraphValue={memHistory}
                        height="calc(100% - 50px)"
                        width="100%"
                        updateInterval={processConfig.config.processes_update_time}
                    />
                    <CurrentValue color={performanceConfig.config.performance_value_color}>
                        {t('proc.monitor_current')}: {currentMem.toFixed(2)} MB
                    </CurrentValue>
                </GraphPanel>
            </GraphsContainer>
        </MonitorOverlay>
    );
};

export default ProcessMonitor;
