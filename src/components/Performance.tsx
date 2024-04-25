import React, { useState, useEffect } from 'react';
import { invoke } from "@tauri-apps/api/tauri";

import Sidebar from './Sidebar';
import Network from './Network';

interface TotalUsages {
  cpu: number | null;
  memory: number | null;
}


const Performance: React.FC = () => {
  const [totalUsages, setTotalUsages] = useState<TotalUsages>({ cpu: 0, memory: 0 });
  const [cpuUsage, setcpuUsage] = useState<number[]>([]);
  const [memoryUsage, setMemoryUsage] = useState<number[]>([]);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedTotalUsages: TotalUsages = await invoke("get_total_usages");
        setTotalUsages(fetchedTotalUsages);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
    const intervalId = setInterval(fetchData, 1000);

    return () => clearInterval(intervalId);
  }, []);


  useEffect(() => {
    if (totalUsages.cpu !== null) {
      setcpuUsage(prevcpuUsage => [...prevcpuUsage, totalUsages.cpu as number]);
    }
    if (totalUsages.memory !== null) {
      setMemoryUsage(prevMemoryUsage => [...prevMemoryUsage, totalUsages.memory as number]);
    }
  }, [totalUsages]);



  return (
    <div>
    <Sidebar/>
    <Network />
    </div>

  );

};

export default Performance;
