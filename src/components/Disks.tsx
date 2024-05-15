import React from "react";
import useDiskData from "../hooks/useDisksData";

interface DisksProps {
    hidden: boolean;
}

const Disks: React.FC<DisksProps> = ({ hidden }) => {
    const { diskData, convertData } = useDiskData();

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
