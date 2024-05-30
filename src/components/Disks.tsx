import React from "react";
import useDiskData from "../hooks/useDisksData";
import { Container, DiskCard, DiskTitle, PartitionList, PartitionName, DiskSize, PartitionSize, PartitionItem, FileSystem, AvailableSpace } from "../styles/disks-style";

interface DisksProps {
    hidden: boolean;
}

const Disks: React.FC<DisksProps> = ({ hidden }) => {
    const { diskData, convertData } = useDiskData();
    console.log(diskData)
    return (
        <Container hidden={hidden}>
            {diskData.length === 0 ? (
                <p>No disk information available.</p>
            ) : (
                diskData.map((disk, index) => (
                    <DiskCard key={index}>
                        <DiskTitle>{disk.name}</DiskTitle>
                        <DiskSize>Size: {convertData(disk.size).value} {convertData(disk.size).unit}</DiskSize>
                        <PartitionList>
                            {disk.partitions.map((partition, partitionIndex) => (
                                <PartitionItem key={partitionIndex}>
                                    <PartitionName>{partition.name}</PartitionName>
                                    {!partition.total_space && <PartitionSize>
                                        Size: {convertData(partition.size).value} {convertData(partition.size).unit}
                                    </PartitionSize>}
                                    {partition.file_system && 
                                    <FileSystem>File System: {partition.file_system}</FileSystem>}
                                    {partition.used_space  &&  
                                    partition.total_space &&
                                    <AvailableSpace> {convertData(partition.used_space).value} {convertData(partition.used_space).unit} / {convertData(partition.total_space).value} {convertData(partition.total_space).unit}</AvailableSpace>}
                                </PartitionItem>
                            ))}
                        </PartitionList>
                    </DiskCard>
                ))
            )}
        </Container>
    );
};

export default Disks;
