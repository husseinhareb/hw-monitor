import React, { useState, useEffect } from 'react';
import { invoke } from "@tauri-apps/api/tauri";

import Sidebar from './Sidebar';
interface TotalUsages {
  cpu: number | null;
  memory: number | null;
}

interface NetworkUsages {
  download: number | null;
  upload: number | null;
}

const Performance: React.FC = () => {
  const [totalUsages, setTotalUsages] = useState<TotalUsages>({ cpu: null, memory: null });
  const [cpuUsage, setcpuUsage] = useState<number[]>([]);
  const [memoryUsage, setMemoryUsage] = useState<number[]>([]);

  const [networkUsages, setNetworkUsages] = useState<NetworkUsages>({ download: null, upload: null });
  const [download, setDownload] = useState<number[]>([]);
  const [upload, setupload] = useState<number[]>([]);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedNetworkUsages: NetworkUsages = await invoke("get_network");
        setNetworkUsages(fetchedNetworkUsages);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
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
    if (networkUsages.download !== null) {
      setDownload(prevDownload => {
        const newDownload = [...prevDownload, networkUsages.download as number];
        return newDownload;
      });
    }
    if (networkUsages.upload !== null) {
      setupload(prevupload => [...prevupload, networkUsages.upload as number]);
    }
  }, [networkUsages]);





  useEffect(() => {
    if (totalUsages.cpu !== null) {
      setcpuUsage(prevcpuUsage => [...prevcpuUsage, totalUsages.cpu as number]);
    }
    if (totalUsages.memory !== null) {
      setMemoryUsage(prevMemoryUsage => [...prevMemoryUsage, totalUsages.memory as number]);
    }
  }, [totalUsages]);



  return (
    <Sidebar cpuUsage={cpuUsage} memoryUsage={memoryUsage} download={download} upload={upload} />
  );

};

export default Performance;
