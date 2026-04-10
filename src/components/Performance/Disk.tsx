// src/components/Sidebar/Disk.tsx

import React from 'react';
import Graph from '../Graph/Graph';
import useDataConverter from '../../helpers/useDataConverter';
import {
  MemoryContainer,
  NameContainer,
  NameLabel,
  NameValue,
  RealTimeValues,
  MemoryTypes,
  FixedValueItem,
  LeftLabel,
  LeftValue,
  FixedValues,
  RightLabel,
  RightValue,
} from "./Styles/style";
import { useTranslation } from 'react-i18next';

interface DiskHist {
  readHistory: number[];
  writeHistory: number[];
  total_read: number;
  total_write: number;
}

interface DiskProps {
  diskName: string;
  performanceConfig: any;
  tick: number;
  diskHist: DiskHist;
}

const Disk: React.FC<DiskProps> = ({ diskName, performanceConfig, tick, diskHist }) => {
  const hist = diskHist;
  const convertData = useDataConverter();
  const { t } = useTranslation();

  const readValues  = hist.readHistory;
  const writeValues = hist.writeHistory;
  const totalRead   = hist.total_read;
  const totalWrite  = hist.total_write;

  // Convert a speed in KB/s into human-readable unit per second
  const formatSpeed = (kbPerSec: number) => {
    // kbPerSec * 1000 = bytes per second (decimal KB, consistent with useDataConverter)
    const bytesPerSec = Math.round(kbPerSec * 1000);
    const { value, unit } = convertData(bytesPerSec);
    return `${value} ${unit}${t('network.bytes_per_sec')}`;
  };

  return (
    <MemoryContainer
      performanceBackgroundColor={performanceConfig.config.performance_background_color}
    >
      <NameContainer>
        <NameLabel performanceTitleColor={performanceConfig.config.performance_title_color}>
          {t('disk.title')}
        </NameLabel>
        <NameValue performanceTitleColor={performanceConfig.config.performance_title_color}>
          {diskName}
        </NameValue>
      </NameContainer>

      <div style={{ flex: 1, minHeight: 0, width: '98%', margin: '0 auto' }}>
        <Graph
          firstGraphValue={readValues}
          secondGraphValue={writeValues}
          width="100%"
          tick={tick}
        />
      </div>

      <div style={{ display: 'flex', marginTop: '16px', padding: '0 10px', flexWrap: 'wrap', flexShrink: 0 }}>
        <RealTimeValues>
          <MemoryTypes performanceValueColor={performanceConfig.config.performance_value_color}>
            {t('disk.usage')}
          </MemoryTypes>
          <FixedValueItem>
            <LeftLabel performanceLabelColor={performanceConfig.config.performance_label_color}>
              {t('disk.read')}
            </LeftLabel>
            <LeftValue performanceValueColor={performanceConfig.config.performance_value_color}>
              {(() => {
                const { value, unit } = convertData(totalRead ?? null);
                return `${value} ${unit}`;
              })()}
            </LeftValue>
          </FixedValueItem>
          <FixedValueItem>
            <LeftLabel performanceLabelColor={performanceConfig.config.performance_label_color}>
              {t('disk.write')}
            </LeftLabel>
            <LeftValue performanceValueColor={performanceConfig.config.performance_value_color}>
              {(() => {
                const { value, unit } = convertData(totalWrite ?? null);
                return `${value} ${unit}`;
              })()}
            </LeftValue>
          </FixedValueItem>
        </RealTimeValues>

        <FixedValues>
          <MemoryTypes performanceValueColor={performanceConfig.config.performance_value_color}>
            {t('disk.speed')}
          </MemoryTypes>
          <FixedValueItem>
            <RightLabel performanceLabelColor={performanceConfig.config.performance_label_color}>
              {t('disk.read')}
            </RightLabel>
            <RightValue performanceValueColor={performanceConfig.config.performance_value_color}>
              {readValues.length > 0
                ? formatSpeed(readValues[readValues.length - 1])
                : `0 KB${t('network.bytes_per_sec')}`}
            </RightValue>
          </FixedValueItem>
          <FixedValueItem>
            <RightLabel performanceLabelColor={performanceConfig.config.performance_label_color}>
              {t('disk.write')}
            </RightLabel>
            <RightValue performanceValueColor={performanceConfig.config.performance_value_color}>
              {writeValues.length > 0
                ? formatSpeed(writeValues[writeValues.length - 1])
                : `0 KB${t('network.bytes_per_sec')}`}
            </RightValue>
          </FixedValueItem>
        </FixedValues>
      </div>
    </MemoryContainer>
  );
};

export default Disk;
