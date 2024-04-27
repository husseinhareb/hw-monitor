import React, { useState } from 'react';
import { List, ListItem, SidebarContainer, Title } from '../styled-components/sidebar-style';

import Cpu from './Cpu';
import Memory from './Memory';
import Graph from './Graph';
import Network from './Network';
import Disks from './Disks';
import NetworkGraph from './BiGraph';
import { act } from 'react-dom/test-utils';

interface PerformanceProps {
    cpuUsage: number[];
    memoryUsage: number[];
    download: number[];
    upload: number;
  }
  
    const Sidebar: React.FC<PerformanceProps> = ({cpuUsage,memoryUsage}) => {
    const [activeItem, setActiveItem] = useState<string>("CPU");

    const handleItemClick = (itemName: string) => {
        setActiveItem(itemName);
    };

    return (
        <div style={{ display: 'flex' }}>
            <SidebarContainer>
                <Title>Performance</Title>
                <List>
                    <ListItem onClick={() => handleItemClick("CPU")}>CPU<Graph currentValue={cpuUsage} maxValue={100} /></ListItem>
                    <ListItem onClick={() => handleItemClick("Memory")}>Memory<Graph currentValue={memoryUsage} maxValue={100} /></ListItem>
                    <ListItem onClick={() => handleItemClick("DISK")}>DISK</ListItem>
                    <ListItem onClick={() => handleItemClick("Network")}>Wi-Fi<Network activeItem={activeItem} /></ListItem>

                </List>
            </SidebarContainer>
            <Cpu activeItem={activeItem}  />
            <Memory activeItem={activeItem}/>
            <Network activeItem={activeItem} />
        </div>
    );
}

export default Sidebar;
