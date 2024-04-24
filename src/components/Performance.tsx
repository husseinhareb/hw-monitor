import React, { useState, useEffect } from 'react';
import { List, ListItem, SidebarContainer, Title } from '../styled-components/sidebar-style';
import { invoke } from "@tauri-apps/api/tauri";
import Cpu from './Cpu';
import Memory from './Memory';
import Graph from './Graph';
import Network from './Network';
import Disks from './Disks';
import NetworkGraph from './NetworkGraph';
interface TotalUsages {
  cpu: number | null;
  memory: number | null;
}

interface NetworkUsages {
  download: number | null;
  upload: number | null;
}

const Performance: React.FC = () => {
  const [activeItem, setActiveItem] = useState<string>("Memory");

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


  const handleItemClick = (itemName: string) => {
    setActiveItem(itemName);
  };

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

  useEffect(() => {
    // Reset CPU and memory usage data when switching between components
    setcpuUsage([]);
    setMemoryUsage([]);
    setDownload([]);
    setupload([]);
  }, [activeItem]);

  const renderComponent = () => {
    switch (activeItem) {
      case 'CPU':
        return <Cpu cpuUsage={cpuUsage} />;
      case 'Memory':
        return <Memory memoryUsage={memoryUsage} />;
      case 'DISK':
        return <Disks />;
      case 'Network':
        return <Network download={download} upload={upload} />
      default:
        return null;
    }
  };

  return (
    <div style={{ display: 'flex' }}>
      <SidebarContainer>
        <Title>Performance</Title>
        <List>
          <ListItem onClick={() => handleItemClick("CPU")}>CPU<Graph currentValue={cpuUsage} maxValue={100} /></ListItem>
          <ListItem onClick={() => handleItemClick("Memory")}>Memory<Graph currentValue={memoryUsage} maxValue={100} /></ListItem>
          <ListItem onClick={() => handleItemClick("DISK")}>DISK</ListItem>
          <ListItem onClick={() => handleItemClick("Network")}>Wi-Fi<NetworkGraph download={download} upload={upload} /></ListItem>

        </List>
      </SidebarContainer>
      <div>{renderComponent()}</div>
    </div>
  );
};

export default Performance;
