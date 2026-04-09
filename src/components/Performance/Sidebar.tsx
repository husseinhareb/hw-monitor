// src/components/Performance/Sidebar.tsx

import React, { useEffect, useMemo, useState } from 'react';
import { List, ListItem, SidebarContainer, Title } from '../../styles/sidebar-style';
import {
  useCpu,
  useGpuUsages,
  useMaxMemory,
  useMemory,
  useNetworkSpeeds,
  usePaused,
  useSetCpu,
  useSetCpuCores,
  useSetGpuUsage,
  useSetMemory,
  useSetNetworkSpeed,
  useSetNetworkFullData,
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
import useGpuData from '../../hooks/Performance/useGpuData';
import useNetworkData from '../../hooks/Performance/useNetworkData';
import useDataConverter from '../../helpers/useDataConverter';
import { useTranslation } from 'react-i18next';

/** Null-rendering component — keeps one network interface polled and pushed to the store. */
const NetworkPoller: React.FC<{ interfaceName: string }> = ({ interfaceName }) => {
  const { download, upload, totalDownload, totalUpload } = useNetworkData(interfaceName);
  const setNetworkSpeed = useSetNetworkSpeed();
  const setNetworkFullData = useSetNetworkFullData();
  const downloadValues = useMemo(() => download.map(d => d.value), [download]);
  const uploadValues = useMemo(() => upload.map(u => u.value), [upload]);
  useEffect(() => {
    setNetworkSpeed(interfaceName, downloadValues, uploadValues);
  }, [interfaceName, downloadValues, uploadValues, setNetworkSpeed]);
  useEffect(() => {
    setNetworkFullData(interfaceName, { download, upload, totalDownload: totalDownload ?? 0, totalUpload: totalUpload ?? 0 });
  }, [interfaceName, download, upload, totalDownload, totalUpload, setNetworkFullData]);
  return null;
};

interface SidebarProps {
  interfaceNames: string[];
}

const Sidebar: React.FC<SidebarProps> = ({ interfaceNames }) => {
  // which panel is selected
  const [selectedItem, setSelectedItem] = useState('CPU');

  // shared tick for all graphs
  const perf = usePerformanceConfig();
  const updateInterval = perf.config.performance_update_time;
  const paused = usePaused();
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => {
      setTick((t) => t + 1);
    }, updateInterval);
    return () => window.clearInterval(id);
  }, [updateInterval, paused]);

  // raw metrics from store (for sidebar mini-graphs)
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

  // --- Always-running data pumps (keep all sidebar mini-graphs updated) ---

  // CPU pump: fetch raw data -> accumulate history -> push to store
  const { cpuData } = useCpuData();
  const [cpuUsageHistory, setCpuUsageHistory] = useState<number[]>([]);
  const [coreUsageHistories, setCoreUsageHistories] = useState<number[][]>([]);
  const [cpuViewMode, setCpuViewMode] = useState<'overall' | 'per-core'>('overall');
  const setCpuStore = useSetCpu();
  const setCpuCoresStore = useSetCpuCores();
  useEffect(() => {
    if (cpuData?.usage != null) {
      setCpuUsageHistory(prev => [...prev, cpuData.usage as number].slice(-20));
    }
  }, [cpuData]);
  useEffect(() => {
    if (cpuData?.core_usages != null) {
      setCoreUsageHistories(prev => {
        const coreCount = cpuData.core_usages!.length;
        const updated = [...prev];
        // Ensure we have enough arrays
        while (updated.length < coreCount) updated.push([]);
        // Trim if core count shrunk (unlikely but safe)
        if (updated.length > coreCount) updated.length = coreCount;
        for (let i = 0; i < coreCount; i++) {
          updated[i] = [...updated[i], cpuData.core_usages![i]].slice(-20);
        }
        return updated;
      });
    }
  }, [cpuData]);
  useEffect(() => {
    if (cpuUsageHistory.length > 0) setCpuStore(cpuUsageHistory);
  }, [cpuUsageHistory, setCpuStore]);
  useEffect(() => {
    if (coreUsageHistories.length > 0) setCpuCoresStore(coreUsageHistories);
  }, [coreUsageHistories, setCpuCoresStore]);

  // Memory pump: fetch raw data → accumulate history → push to store
  const memoryRaw = useMemoryData();
  const convertData = useDataConverter();
  const [activeMemHistory, setActiveMemHistory] = useState<number[]>([]);
  const setMemoryStore = useSetMemory();
  useEffect(() => {
    if (memoryRaw?.total != null && memoryRaw.active != null) {
      const totalConverted = convertData(memoryRaw.total).value;
      const activeValue = (memoryRaw.active / memoryRaw.total) * totalConverted;
      setActiveMemHistory(prev => [...prev, activeValue].slice(-20));
    }
  }, [memoryRaw, convertData]);
  useEffect(() => {
    if (activeMemHistory.length > 0) setMemoryStore(activeMemHistory);
  }, [activeMemHistory, setMemoryStore]);

  // GPU pump: gpuList already fetched by useGpuData above → accumulate per-GPU history → push to store
  const [gpuUsageHistories, setGpuUsageHistories] = useState<Record<string, number[]>>({});
  const setGpuUsageStore = useSetGpuUsage();
  useEffect(() => {
    if (gpuList.length === 0) return;
    setGpuUsageHistories(prev => {
      const updated = { ...prev };
      gpuList.forEach(gpu => {
        if (gpu.id && gpu.utilization != null) {
          const parsed = parseInt(gpu.utilization as string);
          const val = isNaN(parsed) ? 0 : parsed;
          const history = updated[gpu.id] ?? [];
          updated[gpu.id] = [...history, val].slice(-20);
        }
      });
      return updated;
    });
  }, [gpuList]);
  useEffect(() => {
    Object.entries(gpuUsageHistories).forEach(([id, history]) => {
      if (history.length > 0) setGpuUsageStore(id, history);
    });
  }, [gpuUsageHistories, setGpuUsageStore]);

  const handleItemClick = (name: string) => {
    setSelectedItem(name);
  };

  // Render only the selected detail component
  const renderDetailPane = () => {
    if (selectedItem === 'CPU') {
      return (
        <Cpu
          performanceConfig={perf}
          tick={tick}
          cpuData={cpuData}
          cpuUsage={cpuUsageHistory}
          coreUsageHistories={coreUsageHistories}
          viewMode={cpuViewMode}
          onToggleView={() => setCpuViewMode(m => m === 'overall' ? 'per-core' : 'overall')}
        />
      );
    }
    if (selectedItem === 'Memory') {
      return <Memory performanceConfig={perf} tick={tick} memoryUsage={memoryRaw} activeMem={activeMemHistory} />;
    }
    for (let i = 0; i < gpuList.length; i++) {
      const gpuKey = `GPU-${gpuList[i].id || i}`;
      if (selectedItem === gpuKey) {
        return <Gpu gpuData={gpuList[i]} gpuIndex={i} performanceConfig={perf} tick={tick} gpuUsage={gpuUsageHistories[gpuList[i].id ?? ''] ?? []} />;
      }
    }
    for (const name of interfaceNames) {
      const netKey = `Net-${name}`;
      if (selectedItem === netKey) {
        return <Network interfaceName={name} performanceConfig={perf} tick={tick} />;
      }
    }
    for (const name of diskNames) {
      if (selectedItem === name) {
        const hist = diskHistories[name] || { readHistory: [], writeHistory: [], total_read: 0, total_write: 0 };
        return <Disk diskName={name} performanceConfig={perf} tick={tick} diskHist={hist} />;
      }
    }
    return null;
  };

  return (
    <div style={{ display: 'flex', height: '100%', width: '100%' }}>
      {/* Background network pollers — render null, keep all interfaces polled */}
      {interfaceNames.map(name => <NetworkPoller key={name} interfaceName={name} />)}
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

      {/* Detail Pane — only the selected component is rendered */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {renderDetailPane()}
      </div>
    </div>
  );
};

export default Sidebar;
