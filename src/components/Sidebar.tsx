import React, { useEffect, useState } from 'react';
import { List, ListItem, SidebarContainer, Title } from '../styled-components/sidebar-style';
import { useCpuUsageStore, useMemoryUsageStore, useNetworkUsageStore } from "../services/store";

import Network from './Network';
import Graph from './Graph';
import Cpu from './Cpu';
import Disks from './Disks';
import Memory from './Memory';
import BiGraph from './BiGraph';

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

    // Get network usage data for Wi-Fi and Ethernet from the store
    const wifiData = useNetworkUsageStore((state) => state.interfaces['Wi-Fi']);
    const ethernetData = useNetworkUsageStore((state) => state.interfaces['Ethernet']);
    console.log(wifiData)
    const handleItemClick = (itemName: string) => {
        setShowCpu(itemName === 'CPU' ? !showCpu : false);
        setShowMemory(itemName === 'Memory' ? !showMemory : false);
        setShowDisk(itemName === 'DISK' ? !showDisk : false);
        setShowWifi(itemName === 'Wi-Fi' ? !showWifi: false);
        setShowEthernet(itemName === 'Ethernet' ? !showEthernet: false);
    };
    
    useEffect(() => {
        if (interfaceNames && interfaceNames.length > 0) {
            setWifi(interfaceNames.some(name => name.includes("wl")));
            setEthernet(interfaceNames.some(name => name.includes("en")));
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
                        <BiGraph
                            firstGraphValue={wifiData ? wifiData.download : []}
                            secondGraphValue={wifiData ? wifiData.upload : []}
                        />
                    </ListItem>}
                    {ethernet &&
                    <ListItem onClick={() => handleItemClick('Ethernet')}>
                        Ethernet
                        <BiGraph
                            firstGraphValue={ethernetData ? ethernetData.download : []}
                            secondGraphValue={ethernetData ? ethernetData.upload : []}
                        />
                    </ListItem>}
                </List>
            </SidebarContainer>
            <Cpu hidden={!showCpu} />
            <Memory hidden={!showMemory} />
            <Disks hidden={!showDisk} />
            <Network hidden={!showWifi} interfaceName={interfaceNames.find(name => name.includes("wl")) || ''} />
            <Network hidden={!showEthernet} interfaceName={interfaceNames.find(name => name.includes("en")) || ''} />
        </div>
    );
}

export default Sidebar;
