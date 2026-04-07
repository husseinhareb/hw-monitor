import React, { useEffect, useState } from 'react';
import { invoke } from "@tauri-apps/api/core";
import Sidebar from './Sidebar';
import usePerformanceConfig from '../../hooks/Performance/usePerformanceConfig';
import { notify } from '../../services/store';

const Performance: React.FC = () => {
  const [networkUsages, setNetworkUsages] = useState<string[]>([]);
  const performanceConfig = usePerformanceConfig();


  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedNetworkUsages: string[] = await invoke("get_interfaces", {
          showVirtual: performanceConfig.config.show_virtual_interfaces,
        });
        setNetworkUsages(fetchedNetworkUsages);
      } catch (error) {
        console.error("Error fetching data:", error);
        notify('error.fetch_failed');
      }
    };

    fetchData();
    const intervalId = setInterval(fetchData, performanceConfig.config.performance_update_time);

    return () => clearInterval(intervalId);
  }, [performanceConfig.config.performance_update_time, performanceConfig.config.show_virtual_interfaces]);

  return (
      <Sidebar 
      interfaceNames={networkUsages} />
  );
};

export default Performance;
