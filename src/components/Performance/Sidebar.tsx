// src/components/Performance/Sidebar.tsx

import React, { useEffect, useState } from 'react';
import { List, ListItem, SidebarContainer, Title } from '../../styles/sidebar-style';
import {
  useCpu,
  useEthernetSpeed,
  useGpu,
  useMaxMemory,
  useMemory,
  useWifiSpeed,
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
  const gpuUsage = useGpu();
  const { gpuData } = useGpuData();
  const [wifiDownload, wifiUpload] = useWifiSpeed();
  const [ethDownload, ethUpload] = useEthernetSpeed();

  // translation
  const { t } = useTranslation();

  // disk histories and names
  const diskHistories = useDiskData(updateInterval);
  const diskNames = Object.keys(diskHistories);

  // detect which network interfaces we actually have
  const [showWifi, setShowWifi] = useState(false);
  const [showEthernet, setShowEthernet] = useState(false);
  useEffect(() => {
    setShowWifi(interfaceNames.some((n) => n.startsWith('wl')));
    setShowEthernet(interfaceNames.some((n) => n.startsWith('en') || n.startsWith('eth')));
  }, [interfaceNames]);

  const isMaxMemSet = maxMemory > 0;
  const hasGpu = Boolean(gpuData && gpuData.name !== t('sidebar.no_gpu_detected'));

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

          {/* GPU */}
          {hasGpu && (
            <ListItem
              performanceSidebarBackgroundColor={perf.config.performance_sidebar_background_color}
              performanceSidebarSelectedColor={perf.config.performance_sidebar_selected_color}
              isSelected={selectedItem === 'GPU'}
              onClick={() => handleItemClick('GPU')}
            >
              {t('sidebar.gpu')}
              <Graph
                tick={tick}
                firstGraphValue={gpuUsage}
                maxValue={100}
                height="120px"
                width="100%"
              />
            </ListItem>
          )}

          {/* Wi-Fi */}
          {showWifi && (
            <ListItem
              performanceSidebarBackgroundColor={perf.config.performance_sidebar_background_color}
              performanceSidebarSelectedColor={perf.config.performance_sidebar_selected_color}
              isSelected={selectedItem === 'Wi-Fi'}
              onClick={() => handleItemClick('Wi-Fi')}
            >
              {t('sidebar.wifi')}
              <Graph
                tick={tick}
                firstGraphValue={wifiDownload}
                secondGraphValue={wifiUpload}
                height="120px"
                width="100%"
              />
            </ListItem>
          )}

          {/* Ethernet */}
          {showEthernet && (
            <ListItem
              performanceSidebarBackgroundColor={perf.config.performance_sidebar_background_color}
              performanceSidebarSelectedColor={perf.config.performance_sidebar_selected_color}
              isSelected={selectedItem === 'Ethernet'}
              onClick={() => handleItemClick('Ethernet')}
            >
              {t('sidebar.ethernet')}
              <Graph
                tick={tick}
                firstGraphValue={ethDownload}
                secondGraphValue={ethUpload}
                height="120px"
                width="100%"
              />
            </ListItem>
          )}

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
        <Gpu hidden={selectedItem !== 'GPU'} performanceConfig={perf} />
        <Network
          hidden={selectedItem !== 'Wi-Fi'}
          interfaceName={interfaceNames.find((n) => n.startsWith('wl')) || ''}
          performanceConfig={perf}
        />
        <Network
          hidden={selectedItem !== 'Ethernet'}
          interfaceName={
            interfaceNames.find((n) => n.startsWith('en') || n.startsWith('eth')) || ''
          }
          performanceConfig={perf}
        />
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
