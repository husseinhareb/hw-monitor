import React, { useState } from "react";
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
  DiskHeader,
  DetailsIcon,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  CloseButton,
  DetailRow,
  DetailLabel,
  DetailValue,
  DetailSection,
  SectionTitle,
} from "../../styles/disks-style";
import useDisksConfig from "../../hooks/Disks/useDisksConfig";
import { useTranslation } from "react-i18next";
import { FaCircleInfo } from "react-icons/fa6";

const Disks: React.FC = () => {
  const { diskData, error } = useDiskData();
  const disksConfig = useDisksConfig();
  const { t } = useTranslation(); 
  const [selectedDisk, setSelectedDisk] = useState<any>(null);

  const usagePercentage = (used: number, total: number) => {
    return Math.min(Math.max((used / total) * 100, 0), 100);
  };

  if (error) {
    return (
      <Container $bodyBackgroundColor={disksConfig.config.disks_background_color}>
        <p>{t('error.disks_failed')}</p>
      </Container>
    );
  }

  if (diskData.length === 0) {
    return (
      <Container $bodyBackgroundColor={disksConfig.config.disks_background_color}>
        <p>{t('loading.generic')}</p>
      </Container>
    );
  }

  return (
    <Container
      $bodyBackgroundColor={disksConfig.config.disks_background_color}
    >
      {diskData.map((disk) => (
        <DiskCard
          key={disk.name}
          $boxesBackgroundColor={disksConfig.config.disks_boxes_background_color}
        >
          <DiskHeader>
            <DiskTitle
              $nameForegroundColor={disksConfig.config.disks_name_foreground_color}
            >{disk.name} {disk.model && `- ${disk.model}`}</DiskTitle>
            <DetailsIcon 
              $color={disksConfig.config.disks_name_foreground_color}
              onClick={() => setSelectedDisk(disk)}
            >
              <FaCircleInfo />
            </DetailsIcon>
          </DiskHeader>
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
                  {!partition.mount_point && (
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
                  {partition.mount_point && partition.used_space !== undefined && partition.total_space !== undefined && (
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
      ))}
      {selectedDisk && (
        <ModalOverlay onClick={() => setSelectedDisk(null)}>
          <ModalContent 
            $backgroundColor={disksConfig.config.disks_boxes_background_color}
            $textColor={disksConfig.config.disks_name_foreground_color}
            onClick={(e) => e.stopPropagation()}
          >
            <ModalHeader>
              <h3>{selectedDisk.name} {t('disks.details_title')}</h3>
              <CloseButton onClick={() => setSelectedDisk(null)}>&times;</CloseButton>
            </ModalHeader>
            <ModalBody>
              <DetailSection>
                <SectionTitle>{t('disks.section_info')}</SectionTitle>
                <DetailRow>
                  <DetailLabel>{t('disks.vendor')}</DetailLabel>
                  <DetailValue>{selectedDisk.vendor || 'N/A'}</DetailValue>
                </DetailRow>
                <DetailRow>
                  <DetailLabel>{t('disks.model')}</DetailLabel>
                  <DetailValue>{selectedDisk.model || 'N/A'}</DetailValue>
                </DetailRow>
                <DetailRow>
                  <DetailLabel>{t('disks.serial')}</DetailLabel>
                  <DetailValue>{selectedDisk.serial || 'N/A'}</DetailValue>
                </DetailRow>
                <DetailRow>
                  <DetailLabel>{t('disks.size')}</DetailLabel>
                  <DetailValue>
                    {(() => { const d = convertData(selectedDisk.size); return `${d.value} ${d.unit}`; })()}
                  </DetailValue>
                </DetailRow>
                <DetailRow>
                  <DetailLabel>{t('disks.type')}</DetailLabel>
                  <DetailValue>{selectedDisk.rotational ? t('disks.type_hdd') : t('disks.type_ssd')}</DetailValue>
                </DetailRow>
                <DetailRow>
                  <DetailLabel>{t('disks.physical_block_size')}</DetailLabel>
                  <DetailValue>{selectedDisk.physical_block_size} B</DetailValue>
                </DetailRow>
                <DetailRow>
                  <DetailLabel>{t('disks.logical_block_size')}</DetailLabel>
                  <DetailValue>{selectedDisk.logical_block_size} B</DetailValue>
                </DetailRow>
              </DetailSection>

              <DetailSection>
                <SectionTitle>{t('disks.section_advanced')}</SectionTitle>
                <DetailRow>
                  <DetailLabel>{t('disks.firmware')}</DetailLabel>
                  <DetailValue>{selectedDisk.firmware_rev || 'N/A'}</DetailValue>
                </DetailRow>
                <DetailRow>
                  <DetailLabel>{t('disks.wwid')}</DetailLabel>
                  <DetailValue>{selectedDisk.wwid || 'N/A'}</DetailValue>
                </DetailRow>
                <DetailRow>
                  <DetailLabel>{t('disks.removable')}</DetailLabel>
                  <DetailValue>{selectedDisk.removable ? t('yes') : t('no')}</DetailValue>
                </DetailRow>
                <DetailRow>
                  <DetailLabel>{t('disks.read_only')}</DetailLabel>
                  <DetailValue>{selectedDisk.read_only ? t('yes') : t('no')}</DetailValue>
                </DetailRow>
                <DetailRow>
                  <DetailLabel>{t('disks.trim')}</DetailLabel>
                  <DetailValue>{selectedDisk.trim_supported ? t('yes') : t('no')}</DetailValue>
                </DetailRow>
                <DetailRow>
                  <DetailLabel>{t('disks.scheduler')}</DetailLabel>
                  <DetailValue>{selectedDisk.scheduler || 'N/A'}</DetailValue>
                </DetailRow>
              </DetailSection>

              <DetailSection>
                <SectionTitle>{t('disks.section_performance')}</SectionTitle>
                <DetailRow>
                  <DetailLabel>{t('disks.read_speed')}</DetailLabel>
                  <DetailValue>{selectedDisk.read_speed} KB/s</DetailValue>
                </DetailRow>
                <DetailRow>
                  <DetailLabel>{t('disks.write_speed')}</DetailLabel>
                  <DetailValue>{selectedDisk.write_speed} KB/s</DetailValue>
                </DetailRow>
                <DetailRow>
                  <DetailLabel>{t('disks.total_read')}</DetailLabel>
                  <DetailValue>
                    {(() => { const d = convertData(selectedDisk.total_read); return `${d.value} ${d.unit}`; })()}
                  </DetailValue>
                </DetailRow>
                <DetailRow>
                  <DetailLabel>{t('disks.total_write')}</DetailLabel>
                  <DetailValue>
                    {(() => { const d = convertData(selectedDisk.total_write); return `${d.value} ${d.unit}`; })()}
                  </DetailValue>
                </DetailRow>
              </DetailSection>
            </ModalBody>
          </ModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
};

export default Disks;
