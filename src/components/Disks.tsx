import React, { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/tauri";

interface DisksProps {
    hidden: boolean;
}

interface DiskData {
    name: string;
    partitions: string[];
}

const Disks: React.FC<DisksProps> = ({ hidden }) => {
    const [diskData, setDiskData] = useState<DiskData[]>([]);

    useEffect(() => {
        fetchDiskData();
    }, []); // Fetch data when component mounts

    const fetchDiskData = async () => {
        try {
            const fetchedDiskData: DiskData[] = await invoke("get_disks");
            setDiskData(fetchedDiskData);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    return (
        <div style={{ display: hidden ? 'none' : 'block', width: '100%' }}>
            <h2>Disk Information</h2>
            {diskData.map((disk, index) => (
                <div key={index}>
                    <h3>{disk.name}</h3>
                    <ul>
                        {disk.partitions.map((partition, partitionIndex) => (
                            <li key={partitionIndex}>{partition}</li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    );
};

export default Disks;
