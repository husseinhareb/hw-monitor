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
        setShowCpu(itemName === 'CPU' ? true : false);
        setShowMemory(itemName === 'Memory' ? true : false);
        setShowDisk(itemName === 'DISK' ? true : false);
        setShowNetwork(itemName === 'Wi-Fi' ? true : false);
    };

    return (
        <div style={{ display: 'flex' }}>
            <SidebarContainer>
                <Title>Performance</Title>
                <List>
                    <ListItem onClick={() => handleItemClick('CPU')}>
                        CPU
                        <Graph currentValue={cpuUsage} />
                    </ListItem>
                    <ListItem onClick={() => handleItemClick('Memory')}>
                        Memory
                        <Graph currentValue={memoryUsage} />
                    </ListItem>
                    <ListItem onClick={() => handleItemClick('DISK')}>
                        DISK
                       <Disks/> 
                    </ListItem>
                    <ListItem onClick={() => handleItemClick('Wi-Fi')}>
                        Wi-Fi
                        <Graph currentValue={downloadSpeed} />
                    </ListItem>
                </List>
            </SidebarContainer>
            {showCpu && <Cpu />}
            {showMemory && <Memory />}
            {showDisk && <Disks/>}
            {showNetwork && <Network/>}
        </div>
    );
}

export default Sidebar;
