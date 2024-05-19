import React, { useState, useMemo } from 'react';
import useProcessData, { Process } from '../hooks/useProcessData';
import useTotalUsagesData from '../hooks/useTotalUsagesData';
import { TableContainer, Table, Tbody, Td, Th, Thead, Tr } from '../styles/proc-style';

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

    const sortProcessesByColumn = useMemo(() => (processes: Process[], column: string, order: string): Process[] => {
        if (!column) return processes;

        return [...processes].sort((a, b) => {
            let valueA: any;
            let valueB: any;

            if (column === "memory" || column === "read_disk_usage" || column === "write_disk_usage" || column === "read_disk_speed" || column === "write_disk_speed")  {
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

    const getIntensityColor = (value: number): string => {
        const baseColor = [45, 45, 45]; // Base color (#2d2d2d in RGB)
        const maxIntensity = 50; // Maximum value for intensity
        const intensity = Math.max(0, Math.min(Math.round(value * 25 / maxIntensity), 25));
    
        // Calculate color with decreasing intensity
        return `rgb(${baseColor.map(channel => Math.min(255, channel + intensity)).join(', ')})`;
    };
    

    return (
        <TableContainer>
            <Table>
            <Thead>
                    <Tr>
                        <Th onClick={() => sortProcesses('user')}>user{getSortIndicator('user')}</Th>
                        <Th onClick={() => sortProcesses('pid')}>pid{getSortIndicator('pid')}</Th>
                        <Th onClick={() => sortProcesses('ppid')}>ppid{getSortIndicator('ppid')}</Th>
                        <Th onClick={() => sortProcesses('name')}>name{getSortIndicator('name')}</Th>
                        <Th onClick={() => sortProcesses('state')}>state{getSortIndicator('state')}</Th>
                        <Th onClick={() => sortProcesses('memory')}>
                            {totalUsages.memory !== null ? `${totalUsages.memory}%` : 'N/A'} <br /> memory{getSortIndicator('memory')}
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
                            <Td style={{ backgroundColor: getIntensityColor(convertDataValue(process.memory)) }}>{process.memory}</Td>
                            <Td style={{ backgroundColor: getIntensityColor(parseFloat(process.cpu_usage || '0')) }}>{process.cpu_usage.toString()}%</Td>
                            <Td style={{ backgroundColor: getIntensityColor(convertDataValue(process.read_disk_usage)) }}>{process.read_disk_usage}</Td>
                            <Td style={{ backgroundColor: getIntensityColor(convertDataValue(process.write_disk_usage)) }}>{process.write_disk_usage}</Td>
                            <Td style={{ backgroundColor: getIntensityColor(convertDataValue(process.read_disk_speed)) }}>{process.read_disk_speed}</Td>
                            <Td style={{ backgroundColor: getIntensityColor(convertDataValue(process.write_disk_speed)) }}>{process.write_disk_speed}</Td>
                        </Tr>
                    ))}
                </Tbody>
            </Table>
        </TableContainer>
    );
}

export default Proc;
