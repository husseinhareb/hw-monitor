import React, { useState, useMemo } from 'react';
import { invoke } from "@tauri-apps/api/tauri";
import useProcessData, { Process } from '../../hooks/Proc/useProcessData';
import useTotalUsagesData from '../../hooks/Proc/useTotalUsagesData';
import { TableContainer, Table, Tbody, Thead, Td, Th, Tr, BottomBar, KillButton } from '../../styles/proc-style';
import { useProcessSearch } from '../../services/store';
import useProcessConfig from '../../hooks/Proc/useProcessConfig';
import { lighten } from 'polished';
import { FaArrowDown, FaArrowUp } from 'react-icons/fa';
import Spinner from '../Misc/Spinner';

const Proc: React.FC = () => {
    const [sortBy, setSortBy] = useState<string | null>('memory');
    const [sortOrder, setSortOrder] = useState<string>('desc');
    const [selectedRow, setSelectedRow] = useState<number | null>(null); // State to track selected row index
    const totalUsages = useTotalUsagesData();
    const { processes } = useProcessData();
    const processSearch = useProcessSearch();
    const processConfig = useProcessConfig();

    // Function to handle click on a row
    const handleRowClick = (index: number) => {
        setSelectedRow(index === selectedRow ? null : index); // Toggle selection
    };

    const handleKillProcess = async () => {
        if (selectedRow !== null) {
            const selectedProcess = filteredProcesses[selectedRow];
            try {
                await invoke('kill_process', { process: selectedProcess });
                console.log('Killing process:', selectedProcess);
            } catch (error) {
                console.error('Failed to kill process:', error);
            }
        }
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
        <TableContainer style={{ backgroundColor: '#1e1e1e', minHeight: '100vh', color: 'white', position: 'relative' }}>
            {processes.length === 0 ? (<Spinner />) :
                (<Table
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
                            <Tr
                                key={index}
                                onClick={() => handleRowClick(index)} // Attach click handler to entire row
                                style={{ backgroundColor: selectedRow === index ? lighten(0.15, processConfig.config.processes_body_background_color) : 'transparent' }} // Highlight row if selected
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
                                            column === 'cpu_usage',  // Check if the column is 'cpu_usage'
                                            selectedRow === index  // Pass the selected status
                                        )}
                                        bodyBackgroundColor={processConfig.config.processes_body_background_color}
                                        bodyColor={processConfig.config.processes_body_color}
                                        columnCount={displayedColumns.length}
                                    >
                                        {column === 'cpu_usage' ? `${process[column] || ''} %` : process[column] || ''}
                                    </Td>
                                ))}
                            </Tr>
                        ))}
                    </Tbody>
                </Table>)}
            {selectedRow !== null && (
                <BottomBar bottomBarBackgroundColor={processConfig.config.processes_head_background_color}>
                    <KillButton
                        killButtonBackgroundColor={processConfig.config.processes_body_background_color}
                        killButtonColor={processConfig.config.processes_body_color}
                        onClick={handleKillProcess}
                    >Kill Process</KillButton>
                </BottomBar>
            )}
        </TableContainer>
    );
};

export default Proc;
