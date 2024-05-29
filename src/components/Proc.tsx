import React, { useState, useMemo } from 'react';
import useProcessData, { Process } from '../hooks/useProcessData';
import useTotalUsagesData from '../hooks/useTotalUsagesData';
import { TableContainer, Table, Tbody, Thead, Td, Th, Tr } from '../styles/proc-style';

const Proc: React.FC = () => {
    const [sortBy, setSortBy] = useState<string | null>(null);
    const [sortOrder, setSortOrder] = useState<string>('asc');
    const totalUsages = useTotalUsagesData();
    const { processes } = useProcessData();

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
        return processes.reduce((total, process) => total + convertDataValue(process[key]), 0);
    };

    const totalMemoryUsage = calculateTotalUsage(processes, 'memory');
    const totalReadDiskUsage = calculateTotalUsage(processes, 'read_disk_usage');
    const totalWriteDiskUsage = calculateTotalUsage(processes, 'write_disk_usage');

    const sortProcessesByColumn = useMemo(() => (processes: Process[], column: string, order: string): Process[] => {
        if (!column) return processes;

        return [...processes].sort((a, b) => {
            let valueA: any;
            let valueB: any;

            if (column === "memory" || column === "read_disk_usage" || column === "write_disk_usage" || column === "read_disk_speed" || column === "write_disk_speed") {
                valueA = convertDataValue(a[column]);
                valueB = convertDataValue(b[column]);
            } else if (column === "pid" || column === "ppid") {
                valueA = parseInt(String(a[column]), 10);
                valueB = parseInt(String(b[column]), 10);
            } else if (column === "cpu_usage") {
                valueA = parseFloat(String(a[column]) || '0');
                valueB = parseFloat(String(b[column]) || '0');
            } else {
                valueA = (a[column as keyof Process] as string).toLowerCase();
                valueB = (b[column as keyof Process] as string).toLowerCase();
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
    }, [sortBy, sortOrder, processes]);

    const sortProcesses = (column: string) => {
        setSortBy(column);
        setSortOrder(prevOrder => (column === sortBy && prevOrder === 'asc' ? 'desc' : 'asc'));
    };

    const getSortIndicator = (column: string) => {
        if (sortBy === column) {
            return sortOrder === 'asc' ? ' ▲' : ' ▼';
        }
        return '';
    };

    const getCellStyle = (value: string, total: number): React.CSSProperties => {
        const percentage = (convertDataValue(value) / total) * 100;
        return percentage > 5 ? { backgroundColor: '#3e3e3e', color: 'white' } : {};
    };

    return (
        <TableContainer>
            <Table>
                <Thead>
                    <Tr>
                        <Th onClick={() => sortProcesses('user')}>User{getSortIndicator('user')}</Th>
                        <Th onClick={() => sortProcesses('pid')}>Pid{getSortIndicator('pid')}</Th>
                        <Th onClick={() => sortProcesses('ppid')}>Ppid{getSortIndicator('ppid')}</Th>
                        <Th onClick={() => sortProcesses('name')}>Name{getSortIndicator('name')}</Th>
                        <Th onClick={() => sortProcesses('state')}>State{getSortIndicator('state')}</Th>
                        <Th onClick={() => sortProcesses('memory')}>
                            {totalUsages.memory !== null ? `${totalUsages.memory}%` : 'N/A'} <br />Memory{getSortIndicator('memory')}
                        </Th>
                        <Th onClick={() => sortProcesses('cpu_usage')}>
                            {totalUsages.cpu !== null ? `${totalUsages.cpu}%` : 'N/A'} <br /> CPU usage{getSortIndicator('cpu_usage')}
                        </Th>
                        <Th onClick={() => sortProcesses('read_disk_usage')}>Disk Read Total{getSortIndicator('read_disk_usage')}</Th>
                        <Th onClick={() => sortProcesses('write_disk_usage')}>Disk Write Total{getSortIndicator('write_disk_usage')}</Th>
                        <Th onClick={() => sortProcesses('read_disk_speed')}>Disk Read Speed{getSortIndicator('read_disk_speed')}</Th>
                        <Th onClick={() => sortProcesses('write_disk_speed')}>Disk Write Speed{getSortIndicator('write_disk_speed')}</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {sortedProcesses.map((process, index) => (
                        <Tr key={index}>
                            <Td>{process.user}</Td>
                            <Td>{process.pid}</Td>
                            <Td>{process.ppid}</Td>
                            <Td>{process.name}</Td>
                            <Td>{process.state}</Td>
                            <Td style={getCellStyle(process.memory, totalMemoryUsage)}>
                                {process.memory}
                            </Td>
                            <Td style={getCellStyle(process.cpu_usage.toString(), totalUsages.cpu)}>
                                {process.cpu_usage.toString()}%
                            </Td>
                            <Td style={getCellStyle(process.read_disk_usage, totalReadDiskUsage)}>
                                {process.read_disk_usage}
                            </Td>
                            <Td style={getCellStyle(process.write_disk_usage, totalWriteDiskUsage)}>
                                {process.write_disk_usage}
                            </Td>
                            <Td style={getCellStyle(process.read_disk_speed, totalReadDiskUsage)}>
                                {process.read_disk_speed}
                            </Td>
                            <Td style={getCellStyle(process.write_disk_speed, totalWriteDiskUsage)}>
                                {process.write_disk_speed}
                            </Td>
                        </Tr>
                    ))}
                </Tbody>
            </Table>
        </TableContainer>
    );
};

export default Proc;
