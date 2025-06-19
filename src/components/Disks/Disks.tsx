import React from "react";
import useDiskData from "../../hooks/Disks/useDisksData";
import {
  Container,
  DiskCard,
  DiskTitle,
  PartitionList,
  PartitionName,
  DiskSize,
  PartitionItem,
  FileSystem,
  Space,
  PartitionContainer,
  PartitionBar,
} from "../../styles/disks-style";
import useDisksConfig from "../../hooks/Disks/useDisksConfig";
import { useTranslation } from "react-i18next";

interface DisksProps {
  hidden: boolean;
}

const Disks: React.FC<DisksProps> = ({ hidden }) => {
  const { diskData, convertData } = useDiskData();
  const disksConfig = useDisksConfig();
  const { t } =useTranslation(); 


  const usagePercentage = (used: number, total: number) => {
    return (used / total) * 100;
  };

  return (
    <Container
      hidden={hidden}
      bodyBackgroundColor={disksConfig.config.disks_background_color}
    >
      {diskData.length === 0 ? (
        <p >Loading...</p>
      ) : (
        diskData.map((disk, index) => (
          <DiskCard
            key={index}
            boxesBackgroundColor={disksConfig.config.disks_boxes_background_color}
          >
            <DiskTitle
              nameForegroundColor={disksConfig.config.disks_name_foreground_color}
            >{disk.name}</DiskTitle>
            <DiskSize
              sizeForegroundColor={disksConfig.config.disks_size_foreground_color}
            >
              {t('disks.size')}: {convertData(disk.size).value} {convertData(disk.size).unit}
            </DiskSize>
            <PartitionList>
              {disk.partitions.map((partition, partitionIndex) => (
                <PartitionContainer
                  partitionBackgroundColor={disksConfig.config.disks_partition_background_color}
                  key={partitionIndex}
                >
                  {partition.used_space && partition.total_space && (
                    <PartitionBar
                      partitionUsageBackgroundColor={disksConfig.config.disks_partition_usage_background_color}
                      style={{
                        width: `${usagePercentage(
                          partition.used_space,
                          partition.total_space
                        )}%`,
                      }}
                    ></PartitionBar>
                  )}
                  <PartitionItem>
                    <PartitionName
                      partitionNameForegroundColor={disksConfig.config.disks_partition_name_foreground_color}
                    >{partition.name}</PartitionName>
                    {!partition.total_space && (
                      <Space
                        partitionUsageForegroundColor={disksConfig.config.disks_partition_usage_foreground_color}
                      >
                        {convertData(partition.size).value}{" "}
                        {convertData(partition.size).unit}
                      </Space>
                    )}
                    {partition.mount_point && (
                      <FileSystem
                        partitionTypeForegroundColor={disksConfig.config.disks_partition_type_foreground_color}
                      >{partition.mount_point}</FileSystem>
                    )}
                    {partition.file_system && (
                      <FileSystem
                        partitionTypeForegroundColor={disksConfig.config.disks_partition_type_foreground_color}
                      >{partition.file_system}</FileSystem>
                    )}
                    {partition.used_space && partition.total_space && (
                      <Space
                        partitionUsageForegroundColor={disksConfig.config.disks_partition_usage_foreground_color}
                      >
                        {convertData(partition.used_space).value}{" "}
                        {convertData(partition.used_space).unit} /{" "}
                        {convertData(partition.total_space).value}{" "}
                        {convertData(partition.total_space).unit}
                      </Space>
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
