import React from "react";
import useDiskData from "../hooks/useDisksData";
import {
    Container,
    DiskCard,
    DiskTitle,
    PartitionList,
    PartitionName,
    DiskSize,
    PartitionSize,
    PartitionItem,
    FileSystem,
    AvailableSpace,
    PartitionContainer,
    PartitionBar
} from "../styles/disks-style";

interface DisksProps {
    hidden: boolean;
}

const Disks: React.FC<DisksProps> = ({ hidden }) => {
    const { diskData, convertData } = useDiskData();

    const usagePercentage = (used: number, total: number) => {
        return (used / total) * 100;
    };

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
                                <PartitionContainer key={partitionIndex}>
                                    <PartitionBar style={{ width: `${usagePercentage(partition.used_space, partition.total_space)}%` }}>
                                    </PartitionBar>
                                    <PartitionItem>
                                            <PartitionName>{partition.name}</PartitionName>
                                            {!partition.total_space && (
                                                <PartitionSize>
                                                    Size: {convertData(partition.size).value} {convertData(partition.size).unit}
                                                </PartitionSize>
                                            )}
                                            {partition.mount_point && <FileSystem>{partition.mount_point}</FileSystem>}
                                            {partition.file_system && <FileSystem>{partition.file_system}</FileSystem>}
                                            {partition.used_space && partition.total_space && (
                                                <AvailableSpace>
                                                    {convertData(partition.used_space).value} {convertData(partition.used_space).unit} / {convertData(partition.total_space).value} {convertData(partition.total_space).unit}
                                                </AvailableSpace>
                                            )}
                                        </PartitionItem>
                                </PartitionContainer>
                            ))}
                        </PartitionList>
                    </DiskCard>
                ))
            )}
        </Container>
    );
};

export default Disks;
