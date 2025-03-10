// src/components/Performance/Sidebar.tsx

import React, { useEffect, useState } from 'react';
import { List, ListItem, SidebarContainer, Title } from '../../styles/sidebar-style';
import {
  useCpu,
  useGpuUsages,
  useMaxMemory,
  useMemory,
  useNetworkSpeeds,
} from '../../services/store';
import Graph from '../Graph/Graph';
import Cpu from './Cpu';
import Memory from './Memory';
import Gpu from './Gpu';
import Network from './Network';
import Disk from './Disk';
import useDiskData from '../../hooks/Performance/useDiskData';
import usePerformanceConfig from '../../hooks/Performance/usePerformanceConfig';
import useGpuData from '../../hooks/Performance/useGpuData';
import { useTranslation } from 'react-i18next';

interface SidebarProps {
  interfaceNames: string[];
}

const Sidebar: React.FC<SidebarProps> = ({ interfaceNames }) => {
  // which panel is selected
  const [selectedItem, setSelectedItem] = useState('CPU');

  // shared tick for all graphs
  const perf = usePerformanceConfig();
  const updateInterval = perf.config.performance_update_time;
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => {
      setTick((t) => t + 1);
    }, updateInterval);
    return () => window.clearInterval(id);
  }, [updateInterval]);

  // raw metrics from hooks
  const cpuUsage = useCpu();
  const memory = useMemory();
  const maxMemory = useMaxMemory();
  const gpuUsages = useGpuUsages();
  const { gpuList } = useGpuData();
  const networkSpeeds = useNetworkSpeeds();

  // translation
  const { t } = useTranslation();

  // disk histories and names
  const diskHistories = useDiskData(updateInterval);
  const diskNames = Object.keys(diskHistories);

  const isMaxMemSet = maxMemory > 0;

  const handleItemClick = (name: string) => {
    setSelectedItem(name);
  };

  return (
    <div style={{ display: 'flex', height: '100%', width: '100%' }}>
      {/* Sidebar List */}
      <SidebarContainer
        performanceSidebarBackgroundColor={perf.config.performance_sidebar_background_color}
        performanceSidebarColor={perf.config.performance_sidebar_color}
      >
        <Title>{t('sidebar.performance')}</Title>
        <List>
          {/* CPU */}
          <ListItem
            performanceSidebarBackgroundColor={perf.config.performance_sidebar_background_color}
            performanceSidebarSelectedColor={perf.config.performance_sidebar_selected_color}
            isSelected={selectedItem === 'CPU'}
            onClick={() => handleItemClick('CPU')}
          >
            {t('sidebar.cpu')}
            <Graph
              tick={tick}
              firstGraphValue={cpuUsage}
              maxValue={100}
              height="120px"
              width="100%"
            />
          </ListItem>

          {/* Memory */}
          {isMaxMemSet && (
            <ListItem
              performanceSidebarBackgroundColor={perf.config.performance_sidebar_background_color}
              performanceSidebarSelectedColor={perf.config.performance_sidebar_selected_color}
              isSelected={selectedItem === 'Memory'}
              onClick={() => handleItemClick('Memory')}
            >
              {t('sidebar.memory')}
              <Graph
                tick={tick}
                firstGraphValue={memory}
                maxValue={maxMemory}
                height="120px"
                width="100%"
              />
            </ListItem>
          )}

          {/* GPUs */}
          {gpuList.map((gpu, index) => {
            const gpuKey = `GPU-${gpu.id || index}`;
            const gpuHistory = gpu.id ? (gpuUsages[gpu.id] || []) : [];
            return (
              <ListItem
                key={gpuKey}
                performanceSidebarBackgroundColor={perf.config.performance_sidebar_background_color}
                performanceSidebarSelectedColor={perf.config.performance_sidebar_selected_color}
                isSelected={selectedItem === gpuKey}
                onClick={() => handleItemClick(gpuKey)}
              >
                {gpu.name || `${t('sidebar.gpu')} ${index}`}
                <Graph
                  tick={tick}
                  firstGraphValue={gpuHistory}
                  maxValue={100}
                  height="120px"
                  width="100%"
                />
              </ListItem>
            );
          })}

          {/* Network Interfaces */}
          {interfaceNames.map((name) => {
            const netKey = `Net-${name}`;
            const speeds = networkSpeeds[name];
            return (
              <ListItem
                key={netKey}
                performanceSidebarBackgroundColor={perf.config.performance_sidebar_background_color}
                performanceSidebarSelectedColor={perf.config.performance_sidebar_selected_color}
                isSelected={selectedItem === netKey}
                onClick={() => handleItemClick(netKey)}
              >
                {name}
                <Graph
                  tick={tick}
                  firstGraphValue={speeds?.download || []}
                  secondGraphValue={speeds?.upload || []}
                  height="120px"
                  width="100%"
                />
              </ListItem>
            );
          })}

          {/* Disks */}
          {diskNames.map((name) => (
            <ListItem
              key={name}
              performanceSidebarBackgroundColor={perf.config.performance_sidebar_background_color}
              performanceSidebarSelectedColor={perf.config.performance_sidebar_selected_color}
              isSelected={selectedItem === name}
              onClick={() => handleItemClick(name)}
            >
              {name}
              <Graph
                tick={tick}
                firstGraphValue={diskHistories[name].readHistory}
                secondGraphValue={diskHistories[name].writeHistory}
                height="120px"
                width="100%"
              />
            </ListItem>
          ))}
        </List>
      </SidebarContainer>

      {/* Detail Pane (always rendered, just hidden via `hidden`) */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Cpu hidden={selectedItem !== 'CPU'} performanceConfig={perf} />
        <Memory hidden={selectedItem !== 'Memory'} performanceConfig={perf} />
        {gpuList.map((gpu, index) => {
          const gpuKey = `GPU-${gpu.id || index}`;
          return (
            <Gpu
              key={gpuKey}
              hidden={selectedItem !== gpuKey}
              gpuData={gpu}
              gpuIndex={index}
              performanceConfig={perf}
            />
          );
        })}
        {interfaceNames.map((name) => {
          const netKey = `Net-${name}`;
          return (
            <Network
              key={netKey}
              hidden={selectedItem !== netKey}
              interfaceName={name}
              performanceConfig={perf}
            />
          );
        })}
        {diskNames.map((name) => (
          <Disk
            key={name}
            hidden={selectedItem !== name}
            diskName={name}
            performanceConfig={perf}
          />
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
