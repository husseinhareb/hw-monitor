import React, { useEffect, useState } from "react";
import useDiskData, { type DiskData, type PartitionData } from "../../hooks/Disks/useDisksData";
import useSmartData from "../../hooks/Disks/useSmartData";
import { type AtaSmartData, type NvmeSmartData } from "../../hooks/Disks/useSmartData";
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
  PartitionCard,
  PartitionCardHeader,
  SmartHealthBanner,
  SmartHealthDot,
  SmartTable,
  SmartBadge,
  SmartError,
  SmartLoading,
  SmartLimitedBanner,
} from "../../styles/disks-style";
import useDisksConfig from "../../hooks/Disks/useDisksConfig";
import { useTranslation } from "react-i18next";
import { FaCircleInfo } from "react-icons/fa6";

const Disks: React.FC = () => {
  const { diskData, loading, error } = useDiskData();
  const disksConfig = useDisksConfig();
  const { t } = useTranslation();
  const [selectedDisk, setSelectedDisk] = useState<DiskData | null>(null);
  const smart = useSmartData();

  useEffect(() => {
    if (selectedDisk) {
      smart.fetchSmart(selectedDisk.dev_path);
    } else {
      smart.cancel();
    }
  }, [selectedDisk?.dev_path]);

  // Close modal on Escape key
  useEffect(() => {
    if (!selectedDisk) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedDisk(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedDisk]);

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
      return t('disks.na');
    }

    return String(value);
  };

  const showBoolean = (value?: boolean | null) => {
    if (value === undefined || value === null) {
      return t('disks.na');
    }

    return value ? t('yes') : t('no');
  };

  const showList = (value?: string[]) => {
    if (!value || value.length === 0) {
      return t('disks.na');
    }

    return value.join(", ");
  };

  const showBytes = (value?: number | null) => {
    if (value === undefined || value === null) {
      return t('disks.na');
    }

    const data = convertData(value);
    return `${data.value} ${data.unit}`;
  };

  const showNumber = (value?: number | null, unit = "") => {
    if (value === undefined || value === null) {
      return t('disks.na');
    }

    return `${value}${unit ? ` ${unit}` : ""}`;
  };

  const showMajorMinor = (major?: number, minor?: number) => {
    if (major === undefined || minor === undefined) {
      return t('disks.na');
    }

    return `${major}:${minor}`;
  };

  const renderSmartSection = () => {
    if (smart.loading) {
      return (
        <DetailSection $borderColor={modalBorderColor}>
          {renderSectionTitle(t('disks.smart.title'))}
          <SmartLoading>{t('disks.smart.loading')}</SmartLoading>
        </DetailSection>
      );
    }

    if (smart.error) {
      return (
        <DetailSection $borderColor={modalBorderColor}>
          {renderSectionTitle(t('disks.smart.title'))}
          <SmartError>{smart.error}</SmartError>
        </DetailSection>
      );
    }

    if (!smart.data) return null;

    const { data } = smart;

    if (data.type === "Nvme") {
      return renderNvmeSmart(data);
    }

    return renderAtaSmart(data);
  };

  const formatGb = (gb: number) =>
    gb >= 1000
      ? `${(gb / 1000).toFixed(2)} TB`
      : `${gb.toLocaleString()} GB`;

  const renderNvmeSmart = (d: NvmeSmartData) => {
    const warnings: string[] = [];
    if (d.critical_warning & 0x01) warnings.push(t('disks.smart.nvme.spare_below'));
    if (d.critical_warning & 0x02) warnings.push(t('disks.smart.nvme.temp_above'));
    if (d.critical_warning & 0x04) warnings.push(t('disks.smart.nvme.reliability_degraded'));
    if (d.critical_warning & 0x08) warnings.push(t('disks.smart.nvme.read_only'));
    if (d.critical_warning & 0x10) warnings.push(t('disks.smart.nvme.volatile_backup_failed'));

    return (
      <DetailSection $borderColor={modalBorderColor}>
        {renderSectionTitle(t('disks.smart.title'))}
        {d.limited ? (
          <SmartLimitedBanner>
            <span>{t('disks.smart.limited')}</span>
          </SmartLimitedBanner>
        ) : (
          <SmartHealthBanner $pass={d.overall_health} $borderColor={modalBorderColor}>
            <SmartHealthDot $pass={d.overall_health} />
            {d.overall_health ? t('disks.smart.passed') : t('disks.smart.failed')}
          </SmartHealthBanner>
        )}
        {warnings.map((w, i) => renderDetailRow(t('disks.smart.warning'), w, i))}
        {renderDetailRow(t('disks.smart.temperature'), d.temperature_celsius !== null ? `${d.temperature_celsius} °C` : t('disks.na'))}
        {!d.limited && renderDetailRow(t('disks.smart.available_spare'), `${d.available_spare_percent}% (${t('disks.smart.threshold_label')} ${d.available_spare_threshold}%)`)}
        {!d.limited && renderDetailRow(t('disks.smart.percentage_used'), `${d.percentage_used}%`)}
        {!d.limited && renderDetailRow(t('disks.smart.power_on_hours'), d.power_on_hours !== null ? `${d.power_on_hours.toLocaleString()} h` : t('disks.na'))}
        {!d.limited && renderDetailRow(t('disks.smart.power_cycles'), d.power_cycles !== null ? d.power_cycles.toLocaleString() : t('disks.na'))}
        {!d.limited && renderDetailRow(t('disks.smart.unsafe_shutdowns'), d.unsafe_shutdowns !== null ? d.unsafe_shutdowns.toLocaleString() : t('disks.na'))}
        {!d.limited && renderDetailRow(t('disks.smart.media_errors'), d.media_errors !== null ? d.media_errors.toLocaleString() : t('disks.na'))}
        {!d.limited && renderDetailRow(t('disks.smart.data_read'), d.data_units_read_gb !== null ? formatGb(d.data_units_read_gb) : t('disks.na'))}
        {!d.limited && renderDetailRow(t('disks.smart.data_written'), d.data_units_written_gb !== null ? formatGb(d.data_units_written_gb) : t('disks.na'))}
      </DetailSection>
    );
  };

  const renderAtaSmart = (d: AtaSmartData) => (
    <DetailSection $borderColor={modalBorderColor}>
      {renderSectionTitle(t('disks.smart.title'))}
      <SmartHealthBanner $pass={d.overall_health} $borderColor={modalBorderColor}>
        <SmartHealthDot $pass={d.overall_health} />
        {d.overall_health ? t('disks.smart.passed') : t('disks.smart.failed')}
        {d.temperature_celsius !== null && (
          <span style={{ marginLeft: "auto", fontWeight: 400, opacity: 0.8 }}>
            {d.temperature_celsius} °C
          </span>
        )}
        {d.power_on_hours !== null && (
          <span style={{ fontWeight: 400, opacity: 0.8 }}>
            {d.power_on_hours.toLocaleString()} h
          </span>
        )}
        {d.reallocated_sectors !== null && d.reallocated_sectors > 0 && (
          <span style={{ color: "#f0c04a" }}>
            {d.reallocated_sectors} {t('disks.smart.reallocated')}
          </span>
        )}
        {d.pending_sectors !== null && d.pending_sectors > 0 && (
          <span style={{ color: "#d64545" }}>
            {d.pending_sectors} {t('disks.smart.pending')}
          </span>
        )}
      </SmartHealthBanner>
      <SmartTable
        $borderColor={modalBorderColor}
        $labelColor={modalLabelColor}
        $valueColor={modalValueColor}
      >
        <thead>
          <tr>
            <th>{t('disks.smart.id')}</th>
            <th>{t('disks.smart.attribute')}</th>
            <th style={{ textAlign: "right" }}>{t('disks.smart.val')}</th>
            <th style={{ textAlign: "right" }}>{t('disks.smart.wst')}</th>
            <th style={{ textAlign: "right" }}>{t('disks.smart.thr')}</th>
            <th style={{ textAlign: "right" }}>{t('disks.smart.raw')}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {d.attributes.map((attr) => (
            <tr
              key={attr.id}
              className={attr.failed ? "failed" : attr.pre_failure ? "prefail" : ""}
            >
              <td style={{ opacity: 0.55 }}>{attr.id}</td>
              <td>{attr.name}</td>
              <td style={{ textAlign: "right" }}>{attr.current}</td>
              <td style={{ textAlign: "right" }}>{attr.worst}</td>
              <td style={{ textAlign: "right" }}>{attr.threshold}</td>
              <td style={{ textAlign: "right", opacity: 0.7 }}>{attr.raw_string}</td>
              <td>
                <SmartBadge $pass={!attr.failed}>
                  {attr.failed ? t('disks.smart.fail') : t('disks.smart.ok')}
                </SmartBadge>
              </td>
            </tr>
          ))}
        </tbody>
      </SmartTable>
    </DetailSection>
  );

  if (loading) {
    return (
      <Container $bodyBackgroundColor={disksConfig.config.disks_background_color}>
        <p>{t('loading.generic')}</p>
      </Container>
    );
  }

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
        <p>{t('empty.disks')}</p>
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
              role="button"
              tabIndex={0}
              aria-label={t('disks.details_title')}
              onClick={() => setSelectedDisk(disk)}
              onKeyDown={(e: React.KeyboardEvent) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setSelectedDisk(disk);
                }
              }}
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
            {disk.mounts.map((mount) => (
              <PartitionContainer
                $partitionBackgroundColor={disksConfig.config.disks_partition_background_color}
                key={`${disk.name}:${mount.mount_point}`}
              >
                {mount.used_space != null && mount.total_space != null && mount.total_space > 0 && (
                  <PartitionBar
                    $partitionUsageBackgroundColor={disksConfig.config.disks_partition_usage_background_color}
                    style={{ width: `${usagePercentage(mount.used_space, mount.total_space)}%` }}
                  />
                )}
                <PartitionItem>
                  <PartitionName
                    $partitionNameForegroundColor={disksConfig.config.disks_partition_name_foreground_color}
                  >{disk.name}</PartitionName>
                  <FileSystem
                    $partitionTypeForegroundColor={disksConfig.config.disks_partition_type_foreground_color}
                  >{mount.mount_point}</FileSystem>
                  <FileSystem
                    $partitionTypeForegroundColor={disksConfig.config.disks_partition_type_foreground_color}
                  >{mount.file_system}</FileSystem>
                  {mount.used_space != null && mount.total_space != null && (
                    <Space
                      $partitionUsageForegroundColor={disksConfig.config.disks_partition_usage_foreground_color}
                    >
                      {showBytes(mount.used_space)} / {showBytes(mount.total_space)}
                    </Space>
                  )}
                </PartitionItem>
              </PartitionContainer>
            ))}
            {disk.partitions.map((partition) => (
              <PartitionContainer
                $partitionBackgroundColor={disksConfig.config.disks_partition_background_color}
                key={partition.name}
              >
                {partition.used_space != null && partition.total_space != null && partition.total_space > 0 && (
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
                  {partition.mounts.length === 0 && (
                    <Space
                      $partitionUsageForegroundColor={disksConfig.config.disks_partition_usage_foreground_color}
                    >
                      {(() => { const d = convertData(partition.size); return `${d.value} ${d.unit}`; })()}
                    </Space>
                  )}
                  {partition.mounts.length > 0 && (
                    <FileSystem
                      $partitionTypeForegroundColor={disksConfig.config.disks_partition_type_foreground_color}
                    >{partition.mounts.map((mount) => mount.mount_point).join(", ")}</FileSystem>
                  )}
                  {partition.mounts.length > 0 && (
                    <FileSystem
                      $partitionTypeForegroundColor={disksConfig.config.disks_partition_type_foreground_color}
                    >{[...new Set(partition.mounts.map((mount) => mount.file_system))].join(", ")}</FileSystem>
                  )}
                  {partition.mount_point && partition.used_space != null && partition.total_space != null && (
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
        <ModalOverlay
          role="dialog"
          aria-modal="true"
          aria-label={t('disks.details_title')}
          onClick={() => setSelectedDisk(null)}
        >
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
                {renderDetailRow(t('disks.device'), selectedDisk.dev_path || `/dev/${selectedDisk.name}`)}
                {renderDetailRow(t('disks.major_minor'), showMajorMinor(selectedDisk.major, selectedDisk.minor))}
                {renderDetailRow(t('disks.transport'), showValue(selectedDisk.transport))}
                {renderDetailRow(t('disks.state'), showValue(selectedDisk.device_state))}
                {renderDetailRow(t('disks.vendor'), selectedDisk.vendor || t('disks.na'))}
                {renderDetailRow(t('disks.model'), selectedDisk.model || t('disks.na'))}
                {renderDetailRow(t('disks.serial'), selectedDisk.serial || t('disks.na'))}
                {renderDetailRow(t('disks.size'), (() => { const d = convertData(selectedDisk.size); return `${d.value} ${d.unit}`; })())}
                {renderDetailRow(t('disks.type'), selectedDisk.rotational ? t('disks.type_hdd') : t('disks.type_ssd'))}
                {renderDetailRow(t('disks.physical_block_size'), `${selectedDisk.physical_block_size} B`)}
                {renderDetailRow(t('disks.logical_block_size'), `${selectedDisk.logical_block_size} B`)}
                {renderDetailRow(t('disks.sysfs_path'), showValue(selectedDisk.sysfs_path))}
              </DetailSection>

              {renderSmartSection()}

              <DetailSection $borderColor={modalBorderColor}>
                {renderSectionTitle(t('disks.section_advanced'))}
                {renderDetailRow(t('disks.firmware'), selectedDisk.firmware_rev || t('disks.na'))}
                {renderDetailRow(t('disks.wwid'), selectedDisk.wwid || t('disks.na'))}
                {renderDetailRow(t('disks.removable'), selectedDisk.removable ? t('yes') : t('no'))}
                {renderDetailRow(t('disks.read_only'), selectedDisk.read_only ? t('yes') : t('no'))}
                {renderDetailRow(t('disks.trim'), selectedDisk.trim_supported ? t('yes') : t('no'))}
                {renderDetailRow(t('disks.active_scheduler'), showValue(selectedDisk.active_scheduler))}
                {renderDetailRow(t('disks.available_schedulers'), showList(selectedDisk.available_schedulers))}
                {renderDetailRow(t('disks.scheduler'), selectedDisk.scheduler || t('disks.na'))}
                {renderDetailRow(t('disks.write_cache'), showValue(selectedDisk.write_cache))}
                {renderDetailRow(t('disks.queue_depth'), showNumber(selectedDisk.queue_depth))}
                {renderDetailRow(t('disks.read_ahead'), showNumber(selectedDisk.read_ahead_kb, "KB"))}
                {renderDetailRow(t('disks.max_sectors'), showNumber(selectedDisk.max_sectors_kb, "KB"))}
                {renderDetailRow(t('disks.max_hardware_sectors'), showNumber(selectedDisk.max_hw_sectors_kb, "KB"))}
                {renderDetailRow(t('disks.minimum_io_size'), showNumber(selectedDisk.minimum_io_size, "B"))}
                {renderDetailRow(t('disks.optimal_io_size'), showNumber(selectedDisk.optimal_io_size, "B"))}
                {renderDetailRow(t('disks.fua'), showBoolean(selectedDisk.fua))}
                {renderDetailRow(t('disks.dax'), showBoolean(selectedDisk.dax))}
                {renderDetailRow(t('disks.zoned'), showValue(selectedDisk.zoned))}
                {renderDetailRow(t('disks.zone_count'), showNumber(selectedDisk.nr_zones))}
              </DetailSection>

              <DetailSection $borderColor={modalBorderColor}>
                {renderSectionTitle(t('disks.section_discard'))}
                {renderDetailRow(t('disks.discard_granularity'), showNumber(selectedDisk.discard_granularity, "B"))}
                {renderDetailRow(t('disks.max_discard'), showBytes(selectedDisk.discard_max_bytes))}
                {renderDetailRow(t('disks.discard_zeroes_data'), showBoolean(selectedDisk.discard_zeroes_data))}
                {renderDetailRow(t('disks.total_discarded'), showBytes(selectedDisk.total_discarded))}
                {renderDetailRow(t('disks.discard_operations'), showNumber(selectedDisk.total_discards))}
              </DetailSection>

              <DetailSection $borderColor={modalBorderColor}>
                {renderSectionTitle(t('disks.section_controller'))}
                {renderDetailRow(t('disks.numa_node'), showNumber(selectedDisk.numa_node))}
                {renderDetailRow(t('disks.queue_count'), showNumber(selectedDisk.queue_count))}
                {renderDetailRow(t('disks.controller_id'), showValue(selectedDisk.controller_id))}
                {renderDetailRow(t('disks.controller_address'), showValue(selectedDisk.controller_address))}
                {renderDetailRow(t('disks.subsystem_nqn'), showValue(selectedDisk.subsystem_nqn))}
                {renderDetailRow(t('disks.holders'), showList(selectedDisk.holders))}
                {renderDetailRow(t('disks.slaves'), showList(selectedDisk.slaves))}
              </DetailSection>

              {selectedDisk.mounts.length > 0 && (
                <DetailSection $borderColor={modalBorderColor}>
                  {renderSectionTitle(t('disks.section_filesystems'))}
                  {selectedDisk.mounts.map((mount, index) => (
                    <PartitionCard key={`${mount.mount_point}:${index}`} $borderColor={modalBorderColor}>
                      <PartitionCardHeader $color={modalSectionColor} $borderColor={modalBorderColor}>
                        <span>{mount.mount_point}</span>
                        <span>{mount.file_system}</span>
                      </PartitionCardHeader>
                      {mount.total_space != null && renderDetailRow(
                        t('disks.used'),
                        `${showBytes(mount.used_space)} / ${showBytes(mount.total_space)}`,
                      )}
                    </PartitionCard>
                  ))}
                </DetailSection>
              )}

              <DetailSection $borderColor={modalBorderColor}>
                {renderSectionTitle(t('disks.section_performance'))}
                {renderDetailRow(t('disks.read_speed'), `${selectedDisk.read_speed} KB/s`)}
                {renderDetailRow(t('disks.write_speed'), `${selectedDisk.write_speed} KB/s`)}
                {renderDetailRow(t('disks.read_iops'), `${selectedDisk.read_iops} ops/s`)}
                {renderDetailRow(t('disks.write_iops'), `${selectedDisk.write_iops} ops/s`)}
                {renderDetailRow(t('disks.io_busy'), `${selectedDisk.io_busy_percent}%`)}
                {renderDetailRow(t('disks.io_in_progress'), showNumber(selectedDisk.io_in_progress))}
                {renderDetailRow(t('disks.total_read'), (() => { const d = convertData(selectedDisk.total_read); return `${d.value} ${d.unit}`; })())}
                {renderDetailRow(t('disks.total_write'), (() => { const d = convertData(selectedDisk.total_write); return `${d.value} ${d.unit}`; })())}
                {renderDetailRow(t('disks.read_operations'), showNumber(selectedDisk.total_reads))}
                {renderDetailRow(t('disks.write_operations'), showNumber(selectedDisk.total_writes))}
                {renderDetailRow(t('disks.flush_operations'), showNumber(selectedDisk.total_flushes))}
                {renderDetailRow(t('disks.io_time'), showNumber(selectedDisk.io_time_ms, "ms"))}
                {renderDetailRow(t('disks.weighted_io_time'), showNumber(selectedDisk.weighted_io_time_ms, "ms"))}
              </DetailSection>

              <DetailSection $borderColor={modalBorderColor}>
                {renderSectionTitle(t('disks.section_partitions'))}
                {selectedDisk.partitions.length === 0
                  ? renderDetailRow(t('disks.partitions'), t('disks.na'))
                  : selectedDisk.partitions.map((partition: PartitionData) => (
                    <PartitionCard key={partition.name} $borderColor={modalBorderColor}>
                      <PartitionCardHeader $color={modalSectionColor} $borderColor={modalBorderColor}>
                        <span>{partition.name}</span>
                        <span>{showBytes(partition.size)}</span>
                      </PartitionCardHeader>
                      {renderDetailRow(t('disks.device'), partition.dev_path || `/dev/${partition.name}`)}
                      {renderDetailRow(t('disks.major_minor'), showMajorMinor(partition.major, partition.minor))}
                      {partition.mounts.map((mount, index) => (
                        <React.Fragment key={`${mount.mount_point}:${index}`}>
                          {renderDetailRow(`${t('disks.mount')} ${index + 1}`, mount.mount_point)}
                          {renderDetailRow(t('disks.filesystem'), mount.file_system)}
                          {mount.total_space != null && renderDetailRow(
                            t('disks.used'),
                            `${showBytes(mount.used_space)} / ${showBytes(mount.total_space)}`,
                          )}
                        </React.Fragment>
                      ))}
                      {partition.partuuid && renderDetailRow(t('disks.part_uuid'), partition.partuuid)}
                      {partition.read_only != null && renderDetailRow(t('disks.read_only'), showBoolean(partition.read_only))}
                      {!!partition.holders?.length && renderDetailRow(t('disks.holders'), showList(partition.holders))}
                    </PartitionCard>
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
