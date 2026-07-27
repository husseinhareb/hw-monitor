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
  const { diskData, error } = useDiskData();
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDisk?.dev_path]);

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

  const showBoolean = (value?: boolean | null) => {
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

  const renderSmartSection = () => {
    if (smart.loading) {
      return (
        <DetailSection $borderColor={modalBorderColor}>
          {renderSectionTitle("SMART Health")}
          <SmartLoading>Reading SMART data…</SmartLoading>
        </DetailSection>
      );
    }

    if (smart.error) {
      return (
        <DetailSection $borderColor={modalBorderColor}>
          {renderSectionTitle("SMART Health")}
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
    if (d.critical_warning & 0x01) warnings.push("Available spare below threshold");
    if (d.critical_warning & 0x02) warnings.push("Temperature above threshold");
    if (d.critical_warning & 0x04) warnings.push("NVM subsystem reliability degraded");
    if (d.critical_warning & 0x08) warnings.push("Media in read-only mode");
    if (d.critical_warning & 0x10) warnings.push("Volatile memory backup failed");

    return (
      <DetailSection $borderColor={modalBorderColor}>
        {renderSectionTitle("SMART Health")}
        {d.limited ? (
          <SmartLimitedBanner>
            <span>Limited data — full SMART is not available to this user.</span>
          </SmartLimitedBanner>
        ) : (
          <SmartHealthBanner $pass={d.overall_health} $borderColor={modalBorderColor}>
            <SmartHealthDot $pass={d.overall_health} />
            {d.overall_health ? "PASSED" : "FAILED"}
          </SmartHealthBanner>
        )}
        {warnings.map((w, i) => renderDetailRow("Warning", w, i))}
        {renderDetailRow("Temperature", d.temperature_celsius !== null ? `${d.temperature_celsius} °C` : "N/A")}
        {!d.limited && renderDetailRow("Available Spare", `${d.available_spare_percent}% (threshold: ${d.available_spare_threshold}%)`)}
        {!d.limited && renderDetailRow("Percentage Used", `${d.percentage_used}%`)}
        {!d.limited && renderDetailRow("Power-On Hours", d.power_on_hours !== null ? `${d.power_on_hours.toLocaleString()} h` : "N/A")}
        {!d.limited && renderDetailRow("Power Cycles", d.power_cycles !== null ? d.power_cycles.toLocaleString() : "N/A")}
        {!d.limited && renderDetailRow("Unsafe Shutdowns", d.unsafe_shutdowns !== null ? d.unsafe_shutdowns.toLocaleString() : "N/A")}
        {!d.limited && renderDetailRow("Media Errors", d.media_errors !== null ? d.media_errors.toLocaleString() : "N/A")}
        {!d.limited && renderDetailRow("Data Read", d.data_units_read_gb !== null ? formatGb(d.data_units_read_gb) : "N/A")}
        {!d.limited && renderDetailRow("Data Written", d.data_units_written_gb !== null ? formatGb(d.data_units_written_gb) : "N/A")}
      </DetailSection>
    );
  };

  const renderAtaSmart = (d: AtaSmartData) => (
    <DetailSection $borderColor={modalBorderColor}>
      {renderSectionTitle("SMART Health")}
      <SmartHealthBanner $pass={d.overall_health} $borderColor={modalBorderColor}>
        <SmartHealthDot $pass={d.overall_health} />
        {d.overall_health ? "PASSED" : "FAILED"}
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
            {d.reallocated_sectors} reallocated
          </span>
        )}
        {d.pending_sectors !== null && d.pending_sectors > 0 && (
          <span style={{ color: "#d64545" }}>
            {d.pending_sectors} pending
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
            <th>ID</th>
            <th>Attribute</th>
            <th style={{ textAlign: "right" }}>Val</th>
            <th style={{ textAlign: "right" }}>Wst</th>
            <th style={{ textAlign: "right" }}>Thr</th>
            <th style={{ textAlign: "right" }}>Raw</th>
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
                  {attr.failed ? "FAIL" : "OK"}
                </SmartBadge>
              </td>
            </tr>
          ))}
        </tbody>
      </SmartTable>
    </DetailSection>
  );

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

              {renderSmartSection()}

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

              {selectedDisk.mounts.length > 0 && (
                <DetailSection $borderColor={modalBorderColor}>
                  {renderSectionTitle("Filesystems")}
                  {selectedDisk.mounts.map((mount, index) => (
                    <PartitionCard key={`${mount.mount_point}:${index}`} $borderColor={modalBorderColor}>
                      <PartitionCardHeader $color={modalSectionColor} $borderColor={modalBorderColor}>
                        <span>{mount.mount_point}</span>
                        <span>{mount.file_system}</span>
                      </PartitionCardHeader>
                      {mount.total_space != null && renderDetailRow(
                        "Used",
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
                  : selectedDisk.partitions.map((partition: PartitionData) => (
                    <PartitionCard key={partition.name} $borderColor={modalBorderColor}>
                      <PartitionCardHeader $color={modalSectionColor} $borderColor={modalBorderColor}>
                        <span>{partition.name}</span>
                        <span>{showBytes(partition.size)}</span>
                      </PartitionCardHeader>
                      {renderDetailRow("Device", partition.dev_path || `/dev/${partition.name}`)}
                      {renderDetailRow("Major:Minor", showMajorMinor(partition.major, partition.minor))}
                      {partition.mounts.map((mount, index) => (
                        <React.Fragment key={`${mount.mount_point}:${index}`}>
                          {renderDetailRow(`Mount ${index + 1}`, mount.mount_point)}
                          {renderDetailRow("Filesystem", mount.file_system)}
                          {mount.total_space != null && renderDetailRow(
                            "Used",
                            `${showBytes(mount.used_space)} / ${showBytes(mount.total_space)}`,
                          )}
                        </React.Fragment>
                      ))}
                      {partition.partuuid && renderDetailRow("Part UUID", partition.partuuid)}
                      {partition.read_only != null && renderDetailRow("Read only", showBoolean(partition.read_only))}
                      {!!partition.holders?.length && renderDetailRow("Holders", showList(partition.holders))}
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
