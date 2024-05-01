import React, { useEffect, useState } from 'react';
import { List, ListItem, SidebarContainer, Title } from '../styled-components/sidebar-style';
import { useCpuUsageStore, useMemoryUsageStore, useNetworkSpeedStore } from "../services/store";

import Network from './Network';
import Graph from './Graph';
import Cpu from './Cpu';
import Disks from './Disks';
import Memory from './Memory';

interface SidebarProps {
    interfaceNames: string[];
}
const Sidebar: React.FC<SidebarProps> = ({ interfaceNames }) => {
    const [showCpu, setShowCpu] = useState(true);
    const [showMemory, setShowMemory] = useState(false);
    const [showDisk, setShowDisk] = useState(false);
    const [wifi, setWifi] = useState(false);
    const [ethernet, setEthernet] = useState(false);
    const [showWifi, setShowWifi] = useState(false);
    const [showEthernet, setShowEthernet] = useState(false);

    const cpuUsage = useCpuUsageStore((state) => state.cpu);
    const memoryUsage = useMemoryUsageStore((state) => state.memory);
    const downloadSpeed = useNetworkSpeedStore((state) => state.download);

    const handleItemClick = (itemName: string) => {
        setShowCpu(itemName === 'CPU' ? !showCpu : false);
        setShowMemory(itemName === 'Memory' ? !showMemory : false);
        setShowDisk(itemName === 'DISK' ? !showDisk : false);
        setShowWifi(itemName === 'Wi-Fi' ? !showWifi: false);
        setShowEthernet(itemName === 'Ethernet' ? !showEthernet: false);
    };
    
    useEffect(() => {
        if (interfaceNames.find(name => name.includes("wl"))) {
            setWifi(true);
        }
        if (interfaceNames.find(name => name.includes("en"))){
            setEthernet(true);
        }
    }, [interfaceNames]);

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
                    </ListItem>
                    {wifi &&
                    <ListItem onClick={() => handleItemClick('Wi-Fi')}>
                        Wi-Fi
                        <Graph currentValue={downloadSpeed} />
                    </ListItem>}
                    {ethernet &&
                    <ListItem onClick={() => handleItemClick('Ethernet')}>
                        Ethernet
                        <Graph currentValue={downloadSpeed} />
                    </ListItem>}
                </List>
            </SidebarContainer>
            <Cpu hidden={!showCpu} />
            <Memory hidden={!showMemory} />
            <Disks hidden={!showDisk} />
            {showWifi && 
            <Network hidden={!showWifi} interfaceName={interfaceNames.find(name => name.includes("wl"))} />}
            {showEthernet && 
            <Network hidden={!showEthernet} interfaceName={interfaceNames.find(name => name.includes("en"))} />}
        </div>
    );
}

export default Sidebar;
