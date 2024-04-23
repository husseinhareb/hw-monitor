import React, { useState, useEffect } from 'react';
import { List, ListItem, SidebarContainer, Title } from '../styled-components/sidebar-style';
import { invoke } from "@tauri-apps/api/tauri";
import Cpu from './Cpu';
import Memory from './Memory';
import Graph from './Graph';
import Network from './Network';
import Disks from './Disks';
interface TotalUsages {
  cpu: number | null;
  memory: number | null;
}

const Performance: React.FC = () => {
  const [activeItem, setActiveItem] = useState<string>("Memory");
  const [totalUsages, setTotalUsages] = useState<TotalUsages>({ cpu: null, memory: null });
  const [cpuUsage, setcpuUsage] = useState<number[]>([]);
  const [memoryUsage, setMemoryUsage] = useState<number[]>([]);

  const handleItemClick = (itemName: string) => {
    setActiveItem(itemName);
  };

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

  useEffect(() => {
    // Reset CPU and memory usage data when switching between components
    setcpuUsage([]);
    setMemoryUsage([]);
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
        return <Network />
      default:
        return null;
    }
  };

  return (
    <div style={{ display: 'flex' }}>
      <SidebarContainer>
        <Title>Performance</Title>
        <List>
          <ListItem onClick={() => handleItemClick("CPU")}>CPU<Graph currentValue={cpuUsage} /></ListItem>
          <ListItem onClick={() => handleItemClick("Memory")}>Memory<Graph currentValue={memoryUsage} /></ListItem>
          <ListItem onClick={() => handleItemClick("DISK")}>DISK</ListItem>
          <ListItem onClick={() => handleItemClick("Network")}>Wi-Fi</ListItem>

        </List>
      </SidebarContainer>
      <div>{renderComponent()}</div>
    </div>
  );
};

export default Performance;
