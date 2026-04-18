import React from "react";
import useDiskData from "../../hooks/Disks/useDisksData";
import { convertData } from "../../helpers/useDataConverter";
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

const Disks: React.FC = () => {
  const { diskData, error } = useDiskData();
  const disksConfig = useDisksConfig();
  const { t } =useTranslation(); 


  const usagePercentage = (used: number, total: number) => {
    return (used / total) * 100;
  };

  return (
    <Container
      $bodyBackgroundColor={disksConfig.config.disks_background_color}
    >
      {error ? (
        <p>{t('error.disks_failed')}</p>
      ) : diskData.length === 0 ? (
        <p>{t('loading.generic')}</p>
      ) : (
        diskData.map((disk) => (
          <DiskCard
            key={disk.name}
            $boxesBackgroundColor={disksConfig.config.disks_boxes_background_color}
          >
            <DiskTitle
              $nameForegroundColor={disksConfig.config.disks_name_foreground_color}
            >{disk.name}</DiskTitle>
            <DiskSize
              $sizeForegroundColor={disksConfig.config.disks_size_foreground_color}
            >
              {(() => { const d = convertData(disk.size); return `${t('disks.size')}: ${d.value} ${d.unit}`; })()}
            </DiskSize>
            <PartitionList>
              {disk.partitions.map((partition) => (
                <PartitionContainer
                  $partitionBackgroundColor={disksConfig.config.disks_partition_background_color}
                  key={partition.name}
                >
                  {partition.used_space !== undefined && partition.total_space !== undefined && partition.total_space > 0 && (
                    <PartitionBar
                      $partitionUsageBackgroundColor={disksConfig.config.disks_partition_usage_background_color}
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
                      $partitionNameForegroundColor={disksConfig.config.disks_partition_name_foreground_color}
                    >{partition.name}</PartitionName>
                    {partition.total_space === undefined && (
                      <Space
                        $partitionUsageForegroundColor={disksConfig.config.disks_partition_usage_foreground_color}
                      >
                        {(() => { const d = convertData(partition.size); return `${d.value} ${d.unit}`; })()}
                      </Space>
                    )}
                    {partition.mount_point && (
                      <FileSystem
                        $partitionTypeForegroundColor={disksConfig.config.disks_partition_type_foreground_color}
                      >{partition.mount_point}</FileSystem>
                    )}
                    {partition.file_system && (
                      <FileSystem
                        $partitionTypeForegroundColor={disksConfig.config.disks_partition_type_foreground_color}
                      >{partition.file_system}</FileSystem>
                    )}
                    {partition.used_space !== undefined && partition.total_space !== undefined && (
                      <Space
                        $partitionUsageForegroundColor={disksConfig.config.disks_partition_usage_foreground_color}
                      >
                        {(() => {
                          const used = convertData(partition.used_space);
                          const total = convertData(partition.total_space);
                          return `${used.value} ${used.unit} / ${total.value} ${total.unit}`;
                        })()}
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
