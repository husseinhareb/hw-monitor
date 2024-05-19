import React, { useEffect, useState, useMemo } from 'react';
import { invoke } from "@tauri-apps/api/tauri";
import useProcessData, { Process } from '../hooks/useProcessData'; // Import Process interface from the hook

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
            <table>
                <thead>
                    <tr>
                        <th>count</th>
                        <th onClick={() => sortProcesses('user')}>user</th>
                        <th onClick={() => sortProcesses('pid')}>pid</th>
                        <th onClick={() => sortProcesses('ppid')}>ppid</th>
                        <th onClick={() => sortProcesses('name')}>name</th>
                        <th onClick={() => sortProcesses('state')}>state</th>
                        {totalUsages.memory !== null ? (
                            <th onClick={() => sortProcesses('memory')}>
                                {totalUsages.memory}% <br /> memory
                            </th>
                        ) : (
                            <th onClick={() => sortProcesses('memory')}>
                                N/A <br /> memory
                            </th>
                        )}
                        {totalUsages.cpu !== null ? (
                            <th onClick={() => sortProcesses('cpu_usage')}>
                                {totalUsages.cpu}% <br /> CPU usage
                            </th>
                        ) : (
                            <th onClick={() => sortProcesses('cpu_usage')}>
                                N/A <br /> CPU usage
                            </th>
                        )}
                        <th onClick={() => sortProcesses('read_disk_usage')}>Disk Read Total</th>
                        <th onClick={() => sortProcesses('write_disk_usage')}>Disk Write Total</th>
                        <th onClick={() => sortProcesses('read_disk_speed')}>Disk Read Speed</th>
                        <th onClick={() => sortProcesses('write_disk_speed')}>Disk Write Speed</th>
                    </tr>
                </thead>
                <tbody>
                    {sortedProcesses.map((process, index) => (
                        <tr key={index}>
                            <td>{index + 1}</td>
                            <td>{process.user}</td>
                            <td>{process.pid}</td>
                            <td>{process.ppid}</td>
                            <td>{process.name}</td>
                            <td>{process.state}</td>
                            <td>{process.memory}</td>
                            <td>{process.cpu_usage.toString()}%</td>
                            <td>{process.read_disk_usage}</td>
                            <td>{process.write_disk_usage}</td>
                            <td>{process.read_disk_speed}</td>
                            <td>{process.write_disk_speed}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default Proc;
