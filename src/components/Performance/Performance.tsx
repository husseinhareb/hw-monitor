import React, { useEffect, useState } from 'react';
import { invoke } from "@tauri-apps/api/tauri";

import Sidebar from './Sidebar';

const Performance: React.FC = () => {
  const [networkUsages, setNetworkUsages] = useState<string[]>([]);

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
    const intervalId = setInterval(fetchData, 1000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div style={{width: '100%', height: '100%'}}>
      <Sidebar interfaceNames={networkUsages} />
    </div>
  );
};

export default Performance;
