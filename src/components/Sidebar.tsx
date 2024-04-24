import React, { useState } from 'react';
import { List, ListItem, SidebarContainer, Title } from '../styled-components/sidebar-style';

import Cpu from './Cpu';
import Memory from './Memory';
import Graph from './Graph';
import Network from './Network';
import Disks from './Disks';
import NetworkGraph from './NetworkGraph';

interface PerformanceProps {
    cpuUsage: number[];
    memoryUsage: number[];
    download: number[];
    upload: number;
  }
  
const Sidebar: React.FC<PerformanceProps> = ({cpuUsage,memoryUsage,download,upload}) => {
    const [activeItem, setActiveItem] = useState<string>("CPU");

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
                    <ListItem onClick={() => handleItemClick("Network")}>Wi-Fi<NetworkGraph download={download} upload={upload} /></ListItem>

                </List>
            </SidebarContainer>
            <div>{renderComponent()}</div>
        </div>
    );
}

export default Sidebar;
