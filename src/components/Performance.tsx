import React, { useEffect, useState } from 'react';
import { invoke } from "@tauri-apps/api/tauri";

import Sidebar from './Sidebar';

const Performance: React.FC = () => {
  const [networkUsages, setNetworkUsages] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedNetworkUsages: any = await invoke("get_network");
        setNetworkUsages(fetchedNetworkUsages);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
    const intervalId = setInterval(fetchData, 1000);

    return () => clearInterval(intervalId);
  }, []);

  // Extract interface names
  const interfaceNames = networkUsages ? networkUsages.map((item: any) => item.interface) : [];

  return (
    <div>
      <Sidebar interfaceNames={interfaceNames} />
    </div>
  );
};

export default Performance;
