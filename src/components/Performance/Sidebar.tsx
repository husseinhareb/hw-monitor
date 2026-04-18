import React, { useEffect, useMemo, useState } from 'react';
import { List, ListItem, SidebarContainer, Title } from '../../styles/sidebar-style';
import {
  useCpu,
  useCpuCores,
  useGpuUsages,
  useMaxMemory,
  useMemory,
  useNetworkSpeeds,
  useAppendCpu,
  useAppendCpuCores,
  useAppendGpuUsage,
  useAppendMemory,
} from '../../services/store';
import Graph from '../Graph/Graph';
import Cpu from './Cpu';
import Memory from './Memory';
import Gpu from './Gpu';
import Network from './Network';
import Disk from './Disk';
import useDiskData from '../../hooks/Performance/useDiskData';
import usePerformanceConfig from '../../hooks/Performance/usePerformanceConfig';
import useCpuData from '../../hooks/Performance/useCpuData';
import useMemoryData from '../../hooks/Performance/useMemoryData';
import { useMemoryHardwareInfo } from '../../hooks/Performance/useMemoryData';
import useGpuData from '../../hooks/Performance/useGpuData';
import { convertData } from '../../helpers/useDataConverter';
import { useTranslation } from 'react-i18next';

interface SidebarProps {
  interfaceNames: string[];
}

const Sidebar: React.FC<SidebarProps> = ({ interfaceNames }) => {
  // which panel is selected
  const [selectedItem, setSelectedItem] = useState('CPU');

  const perf = usePerformanceConfig();
  const updateInterval = perf.config.performance_update_time;

  // raw metrics from store (for sidebar mini-graphs)
  const cpuUsage = useCpu();
  const cpuCores = useCpuCores();
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
  const validSelections = useMemo(
    () => new Set([
      'CPU',
      'Memory',
      ...gpuList.map((gpu, index) => `GPU-${gpu.id || index}`),
      ...interfaceNames.map((name) => `Net-${name}`),
      ...diskNames,
    ]),
    [diskNames, gpuList, interfaceNames],
  );

  const isMaxMemSet = maxMemory > 0;

  // --- Always-running data pumps (push directly to Zustand store) ---

  // CPU pump: fetch raw data -> append to store
  const { cpuData } = useCpuData();
  const [cpuViewMode, setCpuViewMode] = useState<'overall' | 'per-core'>('overall');
  const appendCpu = useAppendCpu();
  const appendCpuCores = useAppendCpuCores();
  useEffect(() => {
    if (cpuData?.usage != null) {
      appendCpu(cpuData.usage as number);
    }
  }, [cpuData, appendCpu]);
  useEffect(() => {
    if (cpuData?.core_usages != null) {
      appendCpuCores(cpuData.core_usages);
    }
  }, [cpuData, appendCpuCores]);

  // Memory pump: fetch raw data → append to store
  const memoryRaw = useMemoryData();
  const memoryHardwareInfo = useMemoryHardwareInfo();
  const appendMemory = useAppendMemory();
  useEffect(() => {
    if (memoryRaw?.total != null && memoryRaw.active != null) {
      const totalConverted = convertData(memoryRaw.total).value;
      const activeValue = (memoryRaw.active / memoryRaw.total) * totalConverted;
      appendMemory(activeValue);
    }
  }, [memoryRaw, appendMemory]);

  // GPU pump: gpuList already fetched by useGpuData above → append per-GPU to store
  const appendGpuUsage = useAppendGpuUsage();
  useEffect(() => {
    if (gpuList.length === 0) return;
    gpuList.forEach(gpu => {
      if (gpu.id && gpu.utilization != null) {
        const parsed = parseInt(gpu.utilization as string);
        const val = isNaN(parsed) ? 0 : parsed;
        appendGpuUsage(gpu.id, val);
      }
    });
  }, [gpuList, appendGpuUsage]);

  const handleItemClick = (name: string) => {
    setSelectedItem(name);
  };

  useEffect(() => {
    if (!validSelections.has(selectedItem)) {
      setSelectedItem('CPU');
    }
  }, [selectedItem, validSelections]);

  // Render only the selected detail component
  const renderDetailPane = () => {
    if (selectedItem === 'CPU') {
      return (
        <Cpu
          performanceConfig={perf}
          cpuData={cpuData}
          cpuUsage={cpuUsage}
          coreUsageHistories={cpuCores}
          viewMode={cpuViewMode}
          onToggleView={() => setCpuViewMode(m => m === 'overall' ? 'per-core' : 'overall')}
        />
      );
    }
    if (selectedItem === 'Memory') {
      return <Memory performanceConfig={perf} memoryUsage={memoryRaw} activeMem={memory} hardwareInfo={memoryHardwareInfo} />;
    }
    for (let i = 0; i < gpuList.length; i++) {
      const gpuKey = `GPU-${gpuList[i].id || i}`;
      if (selectedItem === gpuKey) {
        return <Gpu gpuData={gpuList[i]} performanceConfig={perf} gpuUsage={gpuUsages[gpuList[i].id ?? ''] ?? []} />;
      }
    }
    for (const name of interfaceNames) {
      const netKey = `Net-${name}`;
      if (selectedItem === netKey) {
        return <Network interfaceName={name} performanceConfig={perf} />;
      }
    }
    for (const name of diskNames) {
      if (selectedItem === name) {
        const hist = diskHistories[name] || { readHistory: [], writeHistory: [], total_read: 0, total_write: 0 };
        return <Disk diskName={name} performanceConfig={perf} diskHist={hist} />;
      }
    }
    return null;
  };

  return (
    <div style={{ display: 'flex', height: '100%', width: '100%' }}>
      {/* Sidebar List */}
      <SidebarContainer
        performanceSidebarBackgroundColor={perf.config.performance_sidebar_background_color}
        performanceSidebarColor={perf.config.performance_sidebar_color}
        performanceScrollbarColor={perf.config.performance_scrollbar_color}
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
                firstGraphValue={diskHistories[name].readHistory}
                secondGraphValue={diskHistories[name].writeHistory}
                height="120px"
                width="100%"
              />
            </ListItem>
          ))}
        </List>
      </SidebarContainer>

      {/* Detail Pane — only the selected component is rendered */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'auto' }}>
        {renderDetailPane()}
      </div>
    </div>
  );
};

export default Sidebar;
