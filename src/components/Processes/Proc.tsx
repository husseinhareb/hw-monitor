import React, { useState, useMemo } from 'react';
import useProcessData, { Process } from '../../hooks/useProcessData';
import useTotalUsagesData from '../../hooks/useTotalUsagesData';
import { TableContainer, Table, Tbody, Thead, Td, Th, Tr } from '../../styles/proc-style';
import { useProcessSearch } from '../../services/store';
import useProcessConfig from '../../hooks/useProcessConfig';
import { lighten } from 'polished';
import { FaArrowDown, FaArrowUp } from 'react-icons/fa';

const Proc: React.FC = () => {
    const [sortBy, setSortBy] = useState<string | null>('memory');
    const [sortOrder, setSortOrder] = useState<string>('desc');
    const totalUsages = useTotalUsagesData();
    const { processes } = useProcessData();
    const processSearch = useProcessSearch();
    const processConfig = useProcessConfig();

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

    const getCellStyle = (value: string, total: number | null): React.CSSProperties => {
        const percentage = (convertDataValue(value) / (total || 1)) * 100;
        if (percentage > 10) {
            const backgroundColor = lighten(0.15, processConfig.config.processes_body_background_color);
            return { backgroundColor, color: processConfig.config.processes_body_color };
        }
        if (percentage > 5) {
            const backgroundColor = lighten(0.1, processConfig.config.processes_body_background_color);
            return { backgroundColor, color: processConfig.config.processes_body_color };
        }
        return {};
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
        user: { percentage: null, label: 'User' },
        pid: { percentage: null, label: 'Pid' },
        ppid: { percentage: null, label: 'Ppid' },
        name: { percentage: null, label: 'Name' },
        state: { percentage: null, label: 'State' },
        memory: { percentage: totalUsages.memory !== null ? `${totalUsages.memory}%` : null, label: 'Memory' },
        cpu_usage: { percentage: totalUsages.cpu !== null ? `${totalUsages.cpu}%` : null, label: 'CPU usage' },
        read_disk_usage: { percentage: null, label: 'Disk Read Total' },
        write_disk_usage: { percentage: null, label: 'Disk Write Total' },
        read_disk_speed: { percentage: null, label: 'Disk Read Speed' },
        write_disk_speed: { percentage: null, label: 'Disk Write Speed' },
    };

    return (
        <TableContainer style={{ backgroundColor: '#1e1e1e', minHeight: '100vh', color: 'white' }}>
            <Table
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
                    {filteredProcesses.map((process, index) => (
                        <Tr key={index}>
                            {displayedColumns.map(column => (
                                <Td
                                    key={column}
                                    style={column === 'memory' || column.includes('disk') ? getCellStyle(process[column] as string, column.includes('read') ? totalReadDiskUsage : column.includes('write') ? totalWriteDiskUsage : totalMemoryUsage) : {}}
                                    bodyBackgroundColor={processConfig.config.processes_body_background_color}
                                    bodyColor={processConfig.config.processes_body_color}
                                    columnCount={displayedColumns.length}>
                                    {process[column] || ''}
                                </Td>
                            ))}
                        </Tr>
                    ))}
                </Tbody>
            </Table>
        </TableContainer>
    );
};

export default Proc;
