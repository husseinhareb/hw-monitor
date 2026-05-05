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

  const modalBorderColor = disksConfig.config.disks_partition_background_color;
  const modalSectionColor = disksConfig.config.disks_name_foreground_color;
  const modalLabelColor = disksConfig.config.disks_partition_type_foreground_color;
  const modalValueColor = disksConfig.config.disks_partition_usage_foreground_color;

  const renderDetailRow = (label: React.ReactNode, value: React.ReactNode, key?: React.Key) => (
    <DetailRow key={key} $borderColor={modalBorderColor}>
      <DetailLabel $color={modalLabelColor}>{label}</DetailLabel>
      <DetailValue $color={modalValueColor}>{value}</DetailValue>
    </DetailRow>
  );

  const renderSectionTitle = (title: React.ReactNode) => (
    <SectionTitle
      $backgroundColor={modalBorderColor}
      $borderColor={modalBorderColor}
      $color={modalSectionColor}
    >
      {title}
    </SectionTitle>
  );

  const showValue = (value: unknown) => {
    if (value === undefined || value === null || value === "") {
      return "N/A";
    }

    return String(value);
  };

  const showBoolean = (value?: boolean) => {
    if (value === undefined || value === null) {
      return "N/A";
    }

    return value ? t('yes') : t('no');
  };

  const showList = (value?: string[]) => {
    if (!value || value.length === 0) {
      return "N/A";
    }

    return value.join(", ");
  };

  const showBytes = (value?: number | null) => {
    if (value === undefined || value === null) {
      return "N/A";
    }

    const data = convertData(value);
    return `${data.value} ${data.unit}`;
  };

  const showNumber = (value?: number | null, unit = "") => {
    if (value === undefined || value === null) {
      return "N/A";
    }

    return `${value}${unit ? ` ${unit}` : ""}`;
  };

  const showMajorMinor = (major?: number, minor?: number) => {
    if (major === undefined || minor === undefined) {
      return "N/A";
    }

    return `${major}:${minor}`;
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
            $borderColor={modalBorderColor}
            onClick={(e) => e.stopPropagation()}
          >
            <ModalHeader
              $borderColor={modalBorderColor}
              $headerBackgroundColor={disksConfig.config.disks_partition_background_color}
            >
              <h3>{selectedDisk.name} {t('disks.details_title')}</h3>
              <CloseButton
                type="button"
                $borderColor={modalBorderColor}
                $color={disksConfig.config.disks_name_foreground_color}
                onClick={() => setSelectedDisk(null)}
              >
                &times;
              </CloseButton>
            </ModalHeader>
            <ModalBody>
              <DetailSection $borderColor={modalBorderColor}>
                {renderSectionTitle(t('disks.section_info'))}
                {renderDetailRow("Device", selectedDisk.dev_path || `/dev/${selectedDisk.name}`)}
                {renderDetailRow("Major:Minor", showMajorMinor(selectedDisk.major, selectedDisk.minor))}
                {renderDetailRow("Transport", showValue(selectedDisk.transport))}
                {renderDetailRow("State", showValue(selectedDisk.device_state))}
                {renderDetailRow(t('disks.vendor'), selectedDisk.vendor || 'N/A')}
                {renderDetailRow(t('disks.model'), selectedDisk.model || 'N/A')}
                {renderDetailRow(t('disks.serial'), selectedDisk.serial || 'N/A')}
                {renderDetailRow(t('disks.size'), (() => { const d = convertData(selectedDisk.size); return `${d.value} ${d.unit}`; })())}
                {renderDetailRow(t('disks.type'), selectedDisk.rotational ? t('disks.type_hdd') : t('disks.type_ssd'))}
                {renderDetailRow(t('disks.physical_block_size'), `${selectedDisk.physical_block_size} B`)}
                {renderDetailRow(t('disks.logical_block_size'), `${selectedDisk.logical_block_size} B`)}
                {renderDetailRow("Sysfs path", showValue(selectedDisk.sysfs_path))}
              </DetailSection>

              <DetailSection $borderColor={modalBorderColor}>
                {renderSectionTitle(t('disks.section_advanced'))}
                {renderDetailRow(t('disks.firmware'), selectedDisk.firmware_rev || 'N/A')}
                {renderDetailRow(t('disks.wwid'), selectedDisk.wwid || 'N/A')}
                {renderDetailRow(t('disks.removable'), selectedDisk.removable ? t('yes') : t('no'))}
                {renderDetailRow(t('disks.read_only'), selectedDisk.read_only ? t('yes') : t('no'))}
                {renderDetailRow(t('disks.trim'), selectedDisk.trim_supported ? t('yes') : t('no'))}
                {renderDetailRow("Active scheduler", showValue(selectedDisk.active_scheduler))}
                {renderDetailRow("Available schedulers", showList(selectedDisk.available_schedulers))}
                {renderDetailRow(t('disks.scheduler'), selectedDisk.scheduler || 'N/A')}
                {renderDetailRow("Write cache", showValue(selectedDisk.write_cache))}
                {renderDetailRow("Queue depth", showNumber(selectedDisk.queue_depth))}
                {renderDetailRow("Read ahead", showNumber(selectedDisk.read_ahead_kb, "KB"))}
                {renderDetailRow("Max sectors", showNumber(selectedDisk.max_sectors_kb, "KB"))}
                {renderDetailRow("Max hardware sectors", showNumber(selectedDisk.max_hw_sectors_kb, "KB"))}
                {renderDetailRow("Minimum I/O size", showNumber(selectedDisk.minimum_io_size, "B"))}
                {renderDetailRow("Optimal I/O size", showNumber(selectedDisk.optimal_io_size, "B"))}
                {renderDetailRow("FUA", showBoolean(selectedDisk.fua))}
                {renderDetailRow("DAX", showBoolean(selectedDisk.dax))}
                {renderDetailRow("Zoned", showValue(selectedDisk.zoned))}
                {renderDetailRow("Zone count", showNumber(selectedDisk.nr_zones))}
              </DetailSection>

              <DetailSection $borderColor={modalBorderColor}>
                {renderSectionTitle("Discard")}
                {renderDetailRow("Discard granularity", showNumber(selectedDisk.discard_granularity, "B"))}
                {renderDetailRow("Max discard", showBytes(selectedDisk.discard_max_bytes))}
                {renderDetailRow("Discard zeroes data", showBoolean(selectedDisk.discard_zeroes_data))}
                {renderDetailRow("Total discarded", showBytes(selectedDisk.total_discarded))}
                {renderDetailRow("Discard operations", showNumber(selectedDisk.total_discards))}
              </DetailSection>

              <DetailSection $borderColor={modalBorderColor}>
                {renderSectionTitle("Controller")}
                {renderDetailRow("NUMA node", showNumber(selectedDisk.numa_node))}
                {renderDetailRow("Queue count", showNumber(selectedDisk.queue_count))}
                {renderDetailRow("Controller ID", showValue(selectedDisk.controller_id))}
                {renderDetailRow("Controller address", showValue(selectedDisk.controller_address))}
                {renderDetailRow("Subsystem NQN", showValue(selectedDisk.subsystem_nqn))}
                {renderDetailRow("Holders", showList(selectedDisk.holders))}
                {renderDetailRow("Slaves", showList(selectedDisk.slaves))}
              </DetailSection>

              <DetailSection $borderColor={modalBorderColor}>
                {renderSectionTitle(t('disks.section_performance'))}
                {renderDetailRow(t('disks.read_speed'), `${selectedDisk.read_speed} KB/s`)}
                {renderDetailRow(t('disks.write_speed'), `${selectedDisk.write_speed} KB/s`)}
                {renderDetailRow("Read IOPS", `${selectedDisk.read_iops} ops/s`)}
                {renderDetailRow("Write IOPS", `${selectedDisk.write_iops} ops/s`)}
                {renderDetailRow("I/O busy", `${selectedDisk.io_busy_percent}%`)}
                {renderDetailRow("I/O in progress", showNumber(selectedDisk.io_in_progress))}
                {renderDetailRow(t('disks.total_read'), (() => { const d = convertData(selectedDisk.total_read); return `${d.value} ${d.unit}`; })())}
                {renderDetailRow(t('disks.total_write'), (() => { const d = convertData(selectedDisk.total_write); return `${d.value} ${d.unit}`; })())}
                {renderDetailRow("Read operations", showNumber(selectedDisk.total_reads))}
                {renderDetailRow("Write operations", showNumber(selectedDisk.total_writes))}
                {renderDetailRow("Flush operations", showNumber(selectedDisk.total_flushes))}
                {renderDetailRow("I/O time", showNumber(selectedDisk.io_time_ms, "ms"))}
                {renderDetailRow("Weighted I/O time", showNumber(selectedDisk.weighted_io_time_ms, "ms"))}
              </DetailSection>

              <DetailSection $borderColor={modalBorderColor}>
                {renderSectionTitle("Partitions")}
                {selectedDisk.partitions.length === 0
                  ? renderDetailRow("Partitions", "N/A")
                  : selectedDisk.partitions.map((partition: any) => renderDetailRow(
                    partition.name,
                    [
                      showBytes(partition.size),
                      `dev ${partition.dev_path || `/dev/${partition.name}`}`,
                      `major:minor ${showMajorMinor(partition.major, partition.minor)}`,
                      partition.partition_number !== undefined ? `part ${partition.partition_number}` : null,
                      partition.start_sector !== undefined ? `start ${partition.start_sector}` : null,
                      partition.partuuid ? `partuuid ${partition.partuuid}` : null,
                      partition.file_system ? `fs ${partition.file_system}` : null,
                      partition.mount_point ? `mount ${partition.mount_point}` : null,
                      partition.total_space !== undefined ? `used ${showBytes(partition.used_space)} / ${showBytes(partition.total_space)}` : null,
                      partition.read_only !== undefined ? `ro ${showBoolean(partition.read_only)}` : null,
                      partition.holders?.length ? `holders ${showList(partition.holders)}` : null,
                    ].filter(Boolean).join(" | "),
                    partition.name
                  ))}
              </DetailSection>
            </ModalBody>
          </ModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
};

export default Disks;
