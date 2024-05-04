import React, { useEffect, useState } from 'react';
import { invoke } from "@tauri-apps/api/tauri";

import Sidebar from './Sidebar';

interface TotalUsages {
  cpu: number | null;
  processes: number | null;
  memory: number | null;
}

const Performance: React.FC = () => {
  const [networkUsages, setNetworkUsages] = useState<any>(null);
  const [totalUsages, setTotalUsages] = useState<TotalUsages | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedNetworkUsages: any = await invoke("get_network");
        setNetworkUsages(fetchedNetworkUsages);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
      try {
        const fetchedTotalUsages: TotalUsages = await invoke("get_total_usages");
        setTotalUsages(fetchedTotalUsages);
    } catch (error) {
        console.error("Error fetching total usages:", error);
    }
    };

    fetchData();
    const intervalId = setInterval(fetchData, 1000);

    return () => clearInterval(intervalId);
  }, []);




  const interfaceNames = networkUsages ? networkUsages.map((item: any) => item.interface) : [];

  return (
    <div>
      <Sidebar interfaceNames={interfaceNames} />
    </div>
  );
};

export default Performance;
