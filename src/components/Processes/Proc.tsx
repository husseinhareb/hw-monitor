import React, { memo, useDeferredValue, useEffect, useMemo, useState } from 'react';
import { invoke } from "@tauri-apps/api/core";
import useProcessData, { Process } from '../../hooks/Proc/useProcessData';
import useTotalUsagesData from '../../hooks/Proc/useTotalUsagesData';
import { TableContainer, Table, Tbody, Thead, Td, Th, Tr, BottomBar, KillButton } from '../../styles/proc-style';
import { useProcessSearch, notify } from '../../services/store';
import useProcessConfig from '../../hooks/Proc/useProcessConfig';
import { safeLighten } from '../../utils/safeLighten';
import styled from 'styled-components';
import { FaArrowDown, FaArrowUp } from 'react-icons/fa';
import Spinner from '../Misc/Spinner';
import ProcessIcon from './ProcessIcon';
import { useTranslation } from 'react-i18next';
import ProcessMonitor from './ProcessMonitor';
import ProcessTree from './ProcessTree';

const tableValues = [
    'name',
    'pid',
    'ppid',
    'user',
    'state',
    'memory',
    'cpu_usage',
    'read_disk_usage',
    'write_disk_usage',
    'read_disk_speed',
    'write_disk_speed',
] as const;

type TableColumn = (typeof tableValues)[number];

interface ProcessRowProps {
    process: Process;
    columns: TableColumn[];
    isSelected: boolean;
    selectedBg: string;
    bodyBg: string;
    bodyColor: string;
    borderColor: string;
    getCellStyle: (value: string, total: number | null, isCpuUsage: boolean, selected: boolean) => React.CSSProperties;
    totalReadDiskUsage: number;
    totalWriteDiskUsage: number;
    totalMemoryUsage: number;
    onRowClick: (pid: number) => void;
}

const ProcessRow = memo<ProcessRowProps>(({
    process, columns, isSelected, selectedBg, bodyBg, bodyColor, borderColor,
    getCellStyle, totalReadDiskUsage, totalWriteDiskUsage, totalMemoryUsage, onRowClick,
}) => (
    <Tr
        onClick={() => onRowClick(process.pid)}
        bodyBackgroundColor={bodyBg}
        style={{ backgroundColor: isSelected ? selectedBg : 'transparent' }}
    >
        {columns.map(column => (
            <Td
                key={`${process.pid}-${column}`}
                style={getCellStyle(
                    process[column] as string,
                    column.includes('disk')
                        ? column.includes('read')
                            ? totalReadDiskUsage
                            : totalWriteDiskUsage
                        : column === 'cpu_usage'
                            ? null
                            : totalMemoryUsage,
                    column === 'cpu_usage',
                    isSelected,
                )}
                bodyBackgroundColor={bodyBg}
                bodyColor={bodyColor}
                borderColor={borderColor}
                columnCount={columns.length}
            >
                {column === 'name' ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <ProcessIcon name={String(process[column] || '')} fallbackColor={bodyColor} />
                        {process[column] || ''}
                    </span>
                ) : column === 'cpu_usage' ? `${process[column] || ''} %` : process[column] || ''}
            </Td>
        ))}
    </Tr>
));

const Proc: React.FC = () => {
    const [sortBy, setSortBy] = useState<TableColumn | null>('memory');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [selectedPid, setSelectedPid] = useState<number | null>(null);
    const [monitoredPid, setMonitoredPid] = useState<number | null>(null);
    const [monitoredName, setMonitoredName] = useState<string>('');
    const [viewMode, setViewMode] = useState<'table' | 'tree'>('table');
    const totalUsages = useTotalUsagesData();
    const { processes, loading, error } = useProcessData();
    const processSearch = useProcessSearch();
    const deferredProcessSearch = useDeferredValue(processSearch);
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

    const totalMemoryUsage = useMemo(() => calculateTotalUsage(processes, 'memory'), [processes]);
    const totalReadDiskUsage = useMemo(() => calculateTotalUsage(processes, 'read_disk_usage'), [processes]);
    const totalWriteDiskUsage = useMemo(() => calculateTotalUsage(processes, 'write_disk_usage'), [processes]);
    const totalCpuUsage = useMemo(() => (
        processes.reduce((total, process) => {
            const cpuUsage = typeof process.cpu_usage === 'string' ? parseFloat(process.cpu_usage) : 0;
            return total + (cpuUsage || 0);
        }, 0)
    ), [processes]);
    

    const sortProcessesByColumn = (items: Process[], column: TableColumn, order: 'asc' | 'desc'): Process[] => {
        if (!column) return items;

        return [...items].sort((a, b) => {
            let valueA: number | string;
            let valueB: number | string;

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

            if (valueA === valueB) {
                return 0;
            }

            if (order === 'asc') {
                return valueA > valueB ? 1 : -1;
            }

            return valueA < valueB ? 1 : -1;
        });
    };

    const sortedProcesses = useMemo(() => {
        return sortBy ? sortProcessesByColumn(processes, sortBy, sortOrder) : processes;
    }, [sortBy, sortOrder, processes]);

    const sortProcesses = (column: TableColumn) => {
        setSortBy(column);
        setSortOrder(prevOrder => (column === sortBy && prevOrder === 'asc' ? 'desc' : 'asc'));
    };

    const getSortIndicator = (column: TableColumn) => {
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
                backgroundColor = safeLighten(0.15, processConfig.config.processes_body_background_color);
            } else if (cpuUsage > 5) {
                backgroundColor = safeLighten(0.1, processConfig.config.processes_body_background_color);
            } else if (cpuUsage > 3) {
                backgroundColor = safeLighten(0.05, processConfig.config.processes_body_background_color);
            }
        } else {
            if (percentage > 10) {
                backgroundColor = safeLighten(0.15, processConfig.config.processes_body_background_color);
            } else if (percentage > 5) {
                backgroundColor = safeLighten(0.1, processConfig.config.processes_body_background_color);
            }
        }

        return backgroundColor ? { backgroundColor, color: processConfig.config.processes_body_color } : {};
    };

    const filteredProcesses = useMemo(() => {
        if (!deferredProcessSearch) return sortedProcesses;
        const query = deferredProcessSearch.toLowerCase();
        return sortedProcesses.filter(process => {
            return Object.values(process).some(value => {
                return String(value).toLowerCase().includes(query);
            });
        });
    }, [deferredProcessSearch, sortedProcesses]);

    const displayedColumns = useMemo(() => processConfig.config.processes_table_values
        .filter((column): column is TableColumn => (
            tableValues.includes(column as TableColumn) &&
            processes.some((process) => column in process)
        ))
        .sort((a, b) => tableValues.indexOf(a) - tableValues.indexOf(b)),
    [processConfig.config.processes_table_values, processes]);

    useEffect(() => {
        if (selectedPid !== null && !processes.some((process) => process.pid === selectedPid)) {
            setSelectedPid(null);
        }
    }, [processes, selectedPid]);

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

    const [killPending, setKillPending] = useState(false);

    const handleKillSelected = async () => {
        if (killPending) return;
        const proc = getSelectedProcess();
        if (proc) {
            setKillPending(true);
            try {
                await invoke('kill_process', { process: proc });
            } catch (error) {
                console.error('Failed to kill process:', error);
                notify('error.kill_failed');
            } finally {
                setKillPending(false);
            }
        }
    };

    const handleMonitorSelected = () => {
        const proc = getSelectedProcess();
        if (proc) {
            setMonitoredPid(proc.pid);
            setMonitoredName(proc.name ?? '');
        }
    };

    const hasSelection = selectedPid !== null;

    return (
        <TableContainer style={{ backgroundColor: processConfig.config.processes_body_background_color, minHeight: '100vh', color: processConfig.config.processes_body_color, position: 'relative', paddingBottom: monitoredPid !== null ? '45vh' : undefined }}>
            {loading ? (<Spinner />) : error && processes.length === 0 ? (
                <p>{t('error.fetch_failed')}</p>
            ) : (
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
                            <ProcessRow
                                key={process.pid}
                                process={process}
                                columns={displayedColumns}
                                isSelected={selectedPid === process.pid}
                                selectedBg={safeLighten(0.15, processConfig.config.processes_body_background_color)}
                                bodyBg={processConfig.config.processes_body_background_color}
                                bodyColor={processConfig.config.processes_body_color}
                                borderColor={processConfig.config.processes_border_color}
                                getCellStyle={getCellStyle}
                                totalReadDiskUsage={totalReadDiskUsage}
                                totalWriteDiskUsage={totalWriteDiskUsage}
                                totalMemoryUsage={totalMemoryUsage}
                                onRowClick={handleRowClick}
                            />
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
                        disabled={killPending}
                    >{killPending ? '…' : t('proc.kill_process')}</KillButton>
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
    background-color: ${props => props.active ? safeLighten(0.15, props.bgColor) : props.bgColor};
    color: ${props => props.color};
    border: ${props => props.active ? `1px solid ${props.borderColor}` : '1px solid transparent'};
    padding: 3px 12px;
    font-size: 11px;
    cursor: pointer;
    &:hover {
        opacity: 0.8;
    }
`;

export default Proc;
