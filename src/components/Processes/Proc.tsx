import React, { useState, useMemo } from 'react';
import { invoke } from "@tauri-apps/api/core";
import useProcessData, { Process } from '../../hooks/Proc/useProcessData';
import useTotalUsagesData from '../../hooks/Proc/useTotalUsagesData';
import { TableContainer, Table, Tbody, Thead, Td, Th, Tr, BottomBar, KillButton } from '../../styles/proc-style';
import { useProcessSearch } from '../../services/store';
import useProcessConfig from '../../hooks/Proc/useProcessConfig';
import { lighten } from 'polished';
import styled from 'styled-components';
import { FaArrowDown, FaArrowUp } from 'react-icons/fa';
import Spinner from '../Misc/Spinner';
import { useTranslation } from 'react-i18next';
import ProcessMonitor from './ProcessMonitor';
import ProcessTree from './ProcessTree';

const Proc: React.FC = () => {
    const [sortBy, setSortBy] = useState<string | null>('memory');
    const [sortOrder, setSortOrder] = useState<string>('desc');
    const [selectedPid, setSelectedPid] = useState<number | null>(null);
    const [monitoredPid, setMonitoredPid] = useState<number | null>(null);
    const [monitoredName, setMonitoredName] = useState<string>('');
    const [viewMode, setViewMode] = useState<'table' | 'tree'>('table');
    const totalUsages = useTotalUsagesData();
    const { processes } = useProcessData();
    const processSearch = useProcessSearch();
    const processConfig = useProcessConfig();
    const { t } = useTranslation();
    // Function to handle click on a row
    const handleRowClick = (pid: number) => {
        setSelectedPid(prev => prev === pid ? null : pid);
    };

    const handleTreeSelectProcess = (process: Process) => {
        setSelectedPid(prev => prev === process.pid ? null : process.pid);
    };

    const convertDataValue = (usageStr: string): number => {
        if (typeof usageStr !== 'string') return 0;

        const units: { [key: string]: number } = {
            b: 1 / 1024,
            kb: 1,
            mb: 1024,
            gb: 1024 * 1024,
        };

        const match = usageStr.match(/([\d.]+)\s*(\w+)/);
        if (match) {
            const value = parseFloat(match[1]);
            const unit = match[2].toLowerCase();
            return value * (units[unit] || 1);
        }
        return parseFloat(usageStr);
    };

    const calculateTotalUsage = (processes: Process[], key: string): number => {
        return processes.reduce((total, process) => {
            const value = process[key];
            return total + convertDataValue(typeof value === 'string' ? value : String(value));
        }, 0);
    };

    const totalMemoryUsage = calculateTotalUsage(processes, 'memory');
    const totalReadDiskUsage = calculateTotalUsage(processes, 'read_disk_usage');
    const totalWriteDiskUsage = calculateTotalUsage(processes, 'write_disk_usage');
    const totalCpuUsage = processes.reduce((total, process) => {
        const cpuUsage = typeof process.cpu_usage === 'string' ? parseFloat(process.cpu_usage) : 0;
        return total + (cpuUsage || 0);
    }, 0);
    

    const sortProcessesByColumn = useMemo(() => (processes: Process[], column: string, order: string): Process[] => {
        if (!column) return processes;

        return [...processes].sort((a, b) => {
            let valueA: any;
            let valueB: any;

            if (['memory', 'read_disk_usage', 'write_disk_usage', 'read_disk_speed', 'write_disk_speed'].includes(column)) {
                valueA = convertDataValue(a[column] as string || '0');
                valueB = convertDataValue(b[column] as string || '0');
            } else if (['pid', 'ppid'].includes(column)) {
                valueA = parseInt(String(a[column] || '0'), 10);
                valueB = parseInt(String(b[column] || '0'), 10);
            } else if (column === 'cpu_usage') {
                valueA = parseFloat(String(a[column] || '0'));
                valueB = parseFloat(String(b[column] || '0'));
            } else {
                valueA = (a[column as keyof Process]?.toString().toLowerCase() || '');
                valueB = (b[column as keyof Process]?.toString().toLowerCase() || '');
            }

            if (order === 'asc') {
                return valueA > valueB ? 1 : -1;
            } else {
                return valueA < valueB ? 1 : -1;
            }
        });
    }, []);

    const sortedProcesses = useMemo(() => {
        return sortBy ? sortProcessesByColumn(processes, sortBy, sortOrder) : processes;
    }, [sortBy, sortOrder, processes, sortProcessesByColumn]);

    const sortProcesses = (column: string) => {
        setSortBy(column);
        setSortOrder(prevOrder => (column === sortBy && prevOrder === 'asc' ? 'desc' : 'asc'));
    };

    const getSortIndicator = (column: string) => {
        if (sortBy === column) {
            return sortOrder === 'asc' ? <FaArrowUp style={{ fontSize: '10px', marginLeft: '4px' }} />
                : <FaArrowDown style={{ fontSize: '10px', marginLeft: '4px' }} />;
        }
        return null;
    };

    const getCellStyle = (value: string, total: number | null, isCpuUsage: boolean = false, selected: boolean = false): React.CSSProperties => {
        if (selected) {
            // Apply default or overridden styles for selected rows
            return { backgroundColor: 'transparent', color: processConfig.config.processes_body_color }; // Or any other styles
        }

        const percentage = (convertDataValue(value) / (total || 1)) * 100;
        let backgroundColor;

        if (isCpuUsage) {
            const cpuUsage = parseFloat(value);
            if (cpuUsage > 20) {
                backgroundColor = lighten(0.15, processConfig.config.processes_body_background_color);
            } else if (cpuUsage > 5) {
                backgroundColor = lighten(0.1, processConfig.config.processes_body_background_color);
            } else if (cpuUsage > 3) {
                backgroundColor = lighten(0.05, processConfig.config.processes_body_background_color);
            }
        } else {
            if (percentage > 10) {
                backgroundColor = lighten(0.15, processConfig.config.processes_body_background_color);
            } else if (percentage > 5) {
                backgroundColor = lighten(0.1, processConfig.config.processes_body_background_color);
            }
        }

        return backgroundColor ? { backgroundColor, color: processConfig.config.processes_body_color } : {};
    };

    const filteredProcesses = useMemo(() => {
        if (!processSearch) return sortedProcesses;
        return sortedProcesses.filter(process => {
            return Object.values(process).some(value => {
                return String(value).toLowerCase().includes(processSearch.toLowerCase());
            });
        });
    }, [processSearch, sortedProcesses]);
 
    const tableValues = ["user", "pid", "ppid", "name", "state", "memory", "cpu_usage", "read_disk_usage", "write_disk_usage", "read_disk_speed", "write_disk_speed"];

    const displayedColumns = processConfig.config.processes_table_values
        .filter(column => processes.some(process => column in process))
        .sort((a, b) => tableValues.indexOf(a) - tableValues.indexOf(b));

    const columnLabels: { [key: string]: { percentage: string | null; label: string } } = {
        user: { percentage: null, label: t('proc.table_value_user') },
        pid: { percentage: null, label: t('proc.table_value_pid') },
        ppid: { percentage: null, label: t('proc.table_value_ppid') },
        name: { percentage: null, label: t('proc.table_value_name') },
        state: { percentage: null, label: t('proc.table_value_state') },
        memory: { percentage: totalUsages.memory !== null ? `${totalUsages.memory}%` : null, label: t('proc.table_value_memory') },
        cpu_usage: { percentage: `${Math.round(totalCpuUsage)}%`, label: t('proc.table_value_cpu_usage') },
        read_disk_usage: { percentage: null, label:  t('proc.table_value_read_disk_usage') },
        write_disk_usage: { percentage: null, label:  t('proc.table_value_write_disk_usage') },
        read_disk_speed: { percentage: null, label:  t('proc.table_value_read_disk_speed') },
        write_disk_speed: { percentage: null, label:  t('proc.table_value_write_disk_speed') },
    };

    const getSelectedProcess = (): Process | null => {
        if (selectedPid !== null) {
            return processes.find(p => p.pid === selectedPid) || null;
        }
        return null;
    };

    const handleKillSelected = async () => {
        const proc = getSelectedProcess();
        if (proc) {
            try {
                await invoke('kill_process', { process: proc });
            } catch (error) {
                console.error('Failed to kill process:', error);
            }
        }
    };

    const handleMonitorSelected = () => {
        const proc = getSelectedProcess();
        if (proc) {
            setMonitoredPid(proc.pid);
            setMonitoredName(proc.name);
        }
    };

    const hasSelection = selectedPid !== null;

    return (
        <TableContainer style={{ backgroundColor: processConfig.config.processes_body_background_color, minHeight: '100vh', color: processConfig.config.processes_body_color, position: 'relative', paddingBottom: monitoredPid !== null ? '45vh' : undefined }}>
            {processes.length === 0 ? (<Spinner />) : (
                <>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        padding: '4px 8px',
                        backgroundColor: processConfig.config.processes_head_background_color,
                        gap: '4px',
                    }}>
                        <ViewToggleBtn
                            active={viewMode === 'table'}
                            bgColor={processConfig.config.processes_body_background_color}
                            color={processConfig.config.processes_body_color}
                            borderColor={processConfig.config.processes_border_color}
                            onClick={() => { setViewMode('table'); }}
                        >
                            {t('proc.table_view')}
                        </ViewToggleBtn>
                        <ViewToggleBtn
                            active={viewMode === 'tree'}
                            bgColor={processConfig.config.processes_body_background_color}
                            color={processConfig.config.processes_body_color}
                            borderColor={processConfig.config.processes_border_color}
                            onClick={() => { setViewMode('tree'); }}
                        >
                            {t('proc.tree_view')}
                        </ViewToggleBtn>
                    </div>

                    {viewMode === 'table' ? (<Table
                    bodyBackgroundColor={processConfig.config.processes_body_background_color}
                    bodyColor={processConfig.config.processes_body_color}
                    headBackgroundColor={processConfig.config.processes_head_background_color}
                    headColor={processConfig.config.processes_head_color}
                >
                    <Thead
                        headBackgroundColor={processConfig.config.processes_head_background_color}
                        headColor={processConfig.config.processes_head_color}
                    >
                        <Tr>
                            {displayedColumns.map(column => (
                                <Th
                                    key={column}
                                    onClick={() => sortProcesses(column)}
                                    headBackgroundColor={processConfig.config.processes_head_background_color}
                                    headColor={processConfig.config.processes_head_color}
                                    borderColor={processConfig.config.processes_border_color}
                                    aria-sort={sortBy === column ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'}
                                    columnCount={displayedColumns.length}
                                >
                                    <div className="header-label">
                                        <div className="header-content">
                                            {columnLabels[column].percentage && <span className="percentage">{columnLabels[column].percentage}</span>}
                                            <span className="label">{columnLabels[column].label}</span>
                                        </div>
                                        {getSortIndicator(column)}
                                    </div>
                                </Th>
                            ))}
                        </Tr>
                    </Thead>
                    <Tbody
                        bodyBackgroundColor={processConfig.config.processes_body_background_color}
                        bodyColor={processConfig.config.processes_body_color}
                    >
                        {filteredProcesses.map((process) => (
                            <Tr
                                key={process.pid}
                                onClick={() => handleRowClick(process.pid)}
                                style={{ backgroundColor: selectedPid === process.pid ? lighten(0.15, processConfig.config.processes_body_background_color) : 'transparent' }}
                            >
                                {displayedColumns.map(column => (
                                    <Td
                                        key={column}
                                        style={getCellStyle(
                                            process[column] as string,
                                            column.includes('disk')
                                                ? column.includes('read')
                                                    ? totalReadDiskUsage
                                                    : totalWriteDiskUsage
                                                : column === 'cpu_usage'
                                                    ? null  // No total for CPU usage
                                                    : totalMemoryUsage,
                                            column === 'cpu_usage',
                                            selectedPid === process.pid
                                        )}
                                        bodyBackgroundColor={processConfig.config.processes_body_background_color}
                                        bodyColor={processConfig.config.processes_body_color}
                                        borderColor={processConfig.config.processes_border_color}
                                        columnCount={displayedColumns.length}
                                    >
                                        {column === 'cpu_usage' ? `${process[column] || ''} %` : process[column] || ''}
                                    </Td>
                                ))}
                            </Tr>
                        ))}
                    </Tbody>
                </Table>
                    ) : (
                        <ProcessTree
                            processes={filteredProcesses}
                            processConfig={processConfig}
                            onSelectProcess={handleTreeSelectProcess}
                            selectedPid={selectedPid}
                        />
                    )}
                </>
            )}
            {hasSelection && (
                <BottomBar
                    bottomBarBackgroundColor={processConfig.config.processes_head_background_color}
                    style={{ bottom: monitoredPid !== null ? '45vh' : '0' }}
                >
                    <KillButton
                        killButtonBackgroundColor={processConfig.config.processes_body_background_color}
                        killButtonColor={processConfig.config.processes_body_color}
                        onClick={handleMonitorSelected}
                    >{t('proc.monitor_button')}</KillButton>
                    <KillButton
                        killButtonBackgroundColor={processConfig.config.processes_body_background_color}
                        killButtonColor={processConfig.config.processes_body_color}
                        onClick={handleKillSelected}
                    >{t('proc.kill_process')}</KillButton>
                </BottomBar>
            )}
            {monitoredPid !== null && (
                <ProcessMonitor
                    pid={monitoredPid}
                    name={monitoredName}
                    processes={processes}
                    onClose={() => setMonitoredPid(null)}
                />
            )}
        </TableContainer>
    );
};

const ViewToggleBtn = styled.button<{ active: boolean; bgColor: string; color: string; borderColor: string }>`
    background-color: ${props => props.active ? lighten(0.15, props.bgColor) : props.bgColor};
    color: ${props => props.color};
    border: ${props => props.active ? `1px solid ${props.borderColor}` : '1px solid transparent'};
    padding: 3px 12px;
    font-size: 11px;
    cursor: pointer;
    border-radius: 4px;
    &:hover {
        opacity: 0.8;
    }
`;

export default Proc;