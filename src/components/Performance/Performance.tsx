import React, { useEffect, useState } from 'react';
import { invoke } from "@tauri-apps/api/tauri";
import Sidebar from './Sidebar';
import usePerformanceConfig from '../../hooks/usePerformanceConfig';

const Performance: React.FC = () => {
  const [networkUsages, setNetworkUsages] = useState<string[]>([]);
  const performanceConfig = usePerformanceConfig();


  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedNetworkUsages: string[] = await invoke("get_interfaces");
        setNetworkUsages(fetchedNetworkUsages);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
    const intervalId = setInterval(fetchData, performanceConfig.config.performance_update_time);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div style={{width: '100%', height: '100%'}}>
      <Sidebar 
      interfaceNames={networkUsages} />
    </div>
  );
};

export default Performance;
