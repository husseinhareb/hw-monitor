import React, { useState } from 'react';
import { List, ListItem, SidebarContainer, Title } from '../styled-components/sidebar-style';
import { useCpuUsageStore, useMemoryUsageStore, useNetworkSpeedStore } from "../services/store";

import Network from './Network';
import Graph from './Graph';
import Cpu from './Cpu';
import Disks from './Disks';
import Memory from './Memory';

const Sidebar: React.FC = () => {
    const [showCpu, setShowCpu] = useState(false);
    const [showMemory, setShowMemory] = useState(false);
    const [showNetwork, setShowNetwork] = useState(false);
    const [showDisk, setShowDisk] = useState(false);

    const cpuUsage = useCpuUsageStore((state) => state.cpu);
    const memoryUsage = useMemoryUsageStore((state) => state.memory);
    const downloadSpeed = useNetworkSpeedStore((state) => state.download);

    const handleItemClick = (itemName: string) => {
        // Toggle the clicked item and set others to false
        setShowCpu(itemName === 'CPU' ? !showCpu : false);
        setShowMemory(itemName === 'Memory' ? !showMemory : false);
        setShowDisk(itemName === 'DISK' ? !showDisk : false);
        setShowNetwork(itemName === 'Wi-Fi' ? !showNetwork : false);
    };

    return (
        <div style={{ display: 'flex' }}>
            <SidebarContainer>
                <Title>Performance</Title>
                <List>
                    <ListItem onClick={() => handleItemClick('CPU')}>
                        CPU
                        {showCpu && <Graph currentValue={cpuUsage} />}
                    </ListItem>
                    <ListItem onClick={() => handleItemClick('Memory')}>
                        Memory
                        {showMemory && <Graph currentValue={memoryUsage} />}
                    </ListItem>
                    <ListItem onClick={() => handleItemClick('DISK')}>
                        DISK
                        {showDisk && <Disks/>} 
                    </ListItem>
                    <ListItem onClick={() => handleItemClick('Wi-Fi')}>
                        Wi-Fi
                        {showNetwork && <Graph currentValue={downloadSpeed} />}
                    </ListItem>
                </List>
            </SidebarContainer>
            <Cpu hidden={!showCpu} />
            <Memory hidden={!showMemory} />
            <Disks hidden={!showDisk} />
            <Network hidden={!showNetwork} />
        </div>
    );
}

export default Sidebar;
