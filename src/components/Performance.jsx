import React, { useState, useEffect } from 'react';
import { List, ListItem, SidebarContainer, Title } from '../styled-components/sidebar-style';
import { invoke } from "@tauri-apps/api/tauri";
import Cpu from './Cpu';

function Sidebar() {
  const [activeItem, setActiveItem] = useState("CPU");
  const [totalUsages, setTotalUsages] = useState([]);
  const [error, setError] = useState(null);
  const [cpuUsage, setcpuUsage] = useState([]);

  const handleItemClick = (itemName) => {
    setActiveItem(itemName);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedTotalUsages = await invoke("get_total_usages");
        setTotalUsages(fetchedTotalUsages);

      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Error: Failed to fetch data");
      }
    };

    fetchData();
    const intervalId = setInterval(fetchData, 1000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (totalUsages && totalUsages.cpu) {
      setcpuUsage(prevcpuUsage => [...prevcpuUsage, totalUsages.cpu]);
    }
  }, [totalUsages]);

  const renderComponent = () => {
    switch (activeItem) {
      case 'CPU':
        return (
          <div>
            <Cpu cpuUsage={cpuUsage} />
          </div>
        );
      case 'Memory':
        return (
          <div>
            <p>Memory Component</p>
          </div>
        );
      case 'DISK':
        return (
          <div>
            <p>DISK Component</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div style={{ display: 'flex' }}>
      <SidebarContainer>
        <Title>Performance</Title>
        <List>
          <ListItem onClick={() => handleItemClick("CPU")}>CPU</ListItem>
          <ListItem onClick={() => handleItemClick("Memory")}>Memory</ListItem>
          <ListItem onClick={() => handleItemClick("DISK")}>DISK</ListItem>
        </List>
      </SidebarContainer>
      <div>
        {renderComponent()}
      </div>
    </div>
  );
};

export default Sidebar;
