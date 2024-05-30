import React from "react";
import useDiskData from "../hooks/useDisksData";
import { Container, DiskCard, DiskTitle, PartitionList, PartitionName, DiskSize, PartitionSize, PartitionItem } from "../styles/disks-style";

interface DisksProps {
    hidden: boolean;
}

const Disks: React.FC<DisksProps> = ({ hidden }) => {
    const { diskData, convertData } = useDiskData();

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
                                    <PartitionSize>
                                        Size: {convertData(partition.size).value} {convertData(partition.size).unit}
                                    </PartitionSize>
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
