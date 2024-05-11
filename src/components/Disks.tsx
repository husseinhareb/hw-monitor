import React, { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import useDataConverter from "../hooks/useDataConverter";

interface DisksProps {
    hidden: boolean;
}

interface PartitionData {
    name: string;
    size: number;
}

interface DiskData {
    name: string;
    partitions: PartitionData[];
    size: number;
}

const Disks: React.FC<DisksProps> = ({ hidden }) => {
    const [diskData, setDiskData] = useState<DiskData[]>([]);
    const convertData = useDataConverter();
    useEffect(() => {
        fetchDiskData();
    }, []); // Fetch data when component mounts

    const fetchDiskData = async () => {
        try {
            const fetchedDiskData: DiskData[] = await invoke("get_disks");
            setDiskData(fetchedDiskData);
            console.log(fetchedDiskData);
        } catch (error) {
            console.error("Error fetching data:", error);
            setDiskData([]); // Clear data if error occurs
        }
    };

    return (
        <div style={{ display: hidden ? 'none' : 'block', width: '100%' }}>
            {diskData.length === 0 ? (
                <p>No disk information available.</p>
            ) : (
                diskData.map((disk, index) => (
                    <div key={index}>
                        <h3>{disk.name}</h3>
                        <p>Size: {convertData(disk.size).value} {convertData(disk.size).unit}</p>
                        <ul>
                            {disk.partitions.map((partition, partitionIndex) => (
                                <li key={partitionIndex}>
                                    {partition.name} (Size: {convertData(partition.size).value} {convertData(partition.size).unit} )
                                </li>
                            ))}
                        </ul>
                    </div>
                ))
            )}
        </div>
    );
};

export default Disks;
