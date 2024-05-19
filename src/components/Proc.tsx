import React, { useEffect, useState, useMemo } from 'react';
import { invoke } from "@tauri-apps/api/tauri";
import useProcessData, { Process } from '../hooks/useProcessData'; // Import Process interface from the hook
import { Table, Tbody, Td, Th, Thead, Tr } from '../styled-components/proc-style';

interface TotalUsages {
    memory: number | null;
    cpu: number | null;
}

const Proc: React.FC = () => {
    const [sortBy, setSortBy] = useState<string | null>(null);
    const [sortOrder, setSortOrder] = useState<string>('asc'); // Default sort order is ascending
    const [totalUsages, setTotalUsages] = useState<TotalUsages>({ memory: null, cpu: null });
    const { processes } = useProcessData();

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch total usages
                const fetchedTotalUsages: TotalUsages = await invoke("get_total_usages");
                setTotalUsages(fetchedTotalUsages);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
        const intervalId = setInterval(fetchData, 1000);

        return () => clearInterval(intervalId);
    }, []);

    const sortProcessesByColumn = (processes: Process[], column: string, order: string): Process[] => {
        if (!column) return processes;

        return [...processes].sort((a, b) => {
            let valueA: any;
            let valueB: any;

            if (column === "memory" || column === "read_disk_usage" || column === "write_disk_usage") {
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
                return valueA < valueB ? -1 : 1;
            } else {
                return valueA > valueB ? -1 : 1;
            }
        });
    };

    const convertDataValue = (usageStr: string): number => {
        if (typeof usageStr !== 'string') {
            return 0;
        }

        const match = usageStr.match(/([\d.]+)\s*(\w+)/);
        if (match) {
            const value = parseFloat(match[1]);
            const unit = match[2].toLowerCase();
            if (unit === "gb") return value * 1024 * 1024; // Convert to KB
            if (unit === "mb") return value * 1024; // Convert to KB
            if (unit === "kb") return value; // Already in KB
            if (unit === "b") return value / 1024; // Convert to KB
        }
        return parseFloat(usageStr);
    };

    const sortedProcesses = useMemo(() => {
        if (sortBy) {
            return sortProcessesByColumn(processes, sortBy, sortOrder);
        } else {
            return [...processes];
        }
    }, [sortBy, sortOrder, processes]);

    const sortProcesses = (column: string) => {
        const newSortOrder = column === sortBy && sortOrder === 'asc' ? 'desc' : 'asc';
        setSortBy(column);
        setSortOrder(newSortOrder);
    };

    return (
        <div>
            <Table>
                <Thead>
                    <tr>
                        <Th>count</Th>
                        <Th onClick={() => sortProcesses('user')}>user</Th>
                        <Th onClick={() => sortProcesses('pid')}>pid</Th>
                        <Th onClick={() => sortProcesses('ppid')}>ppid</Th>
                        <Th onClick={() => sortProcesses('name')}>name</Th>
                        <Th onClick={() => sortProcesses('state')}>state</Th>
                        {totalUsages.memory !== null ? (
                            <Th onClick={() => sortProcesses('memory')}>
                                {totalUsages.memory}% <br /> memory
                            </Th>
                        ) : (
                            <Th onClick={() => sortProcesses('memory')}>
                                N/A <br /> memory
                            </Th>
                        )}
                        {totalUsages.cpu !== null ? (
                            <Th onClick={() => sortProcesses('cpu_usage')}>
                                {totalUsages.cpu}% <br /> CPU usage
                            </Th>
                        ) : (
                            <Th onClick={() => sortProcesses('cpu_usage')}>
                                N/A <br /> CPU usage
                            </Th>
                        )}
                        <Th onClick={() => sortProcesses('read_disk_usage')}>Disk Read Total</Th>
                        <Th onClick={() => sortProcesses('write_disk_usage')}>Disk Write Total</Th>
                        <Th onClick={() => sortProcesses('read_disk_speed')}>Disk Read Speed</Th>
                        <Th onClick={() => sortProcesses('write_disk_speed')}>Disk Write Speed</Th>
                    </tr>
                </Thead>
                <Tbody>
                    {sortedProcesses.map((process, index) => (
                        <Tr key={index}>
                            <Td>{index + 1}</Td>
                            <Td>{process.user}</Td>
                            <Td>{process.pid}</Td>
                            <Td>{process.ppid}</Td>
                            <Td>{process.name}</Td>
                            <Td>{process.state}</Td>
                            <Td>{process.memory}</Td>
                            <Td>{process.cpu_usage.toString()}%</Td>
                            <Td>{process.read_disk_usage}</Td>
                            <Td>{process.write_disk_usage}</Td>
                            <Td>{process.read_disk_speed}</Td>
                            <Td>{process.write_disk_speed}</Td>
                        </Tr>
                    ))}
                </Tbody>
            </Table>
        </div>
    );
}

export default Proc;
