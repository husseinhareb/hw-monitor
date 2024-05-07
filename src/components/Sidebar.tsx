import React, { useEffect, useState } from 'react';
import { List, ListItem, SidebarContainer, Title } from '../styled-components/sidebar-style';
import { useCpu, useMemory } from "../services/store";
import useNetworkData from '../hooks/useNetworkData';
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

    const cpuUsage = useCpu();
    const { memory, maxMemory } = useMemory(); 

    // Find the Wi-Fi and Ethernet interfaces
    const wifiInterface = interfaceNames.find(name => name.includes("wl"));
    const ethernetInterface = interfaceNames.find(name => name.includes("enp"));

    const { download: wifiDownload, upload: wifiUpload} = useNetworkData(wifiInterface || '');
    const { download: ethernetDownload, upload: ethernetUpload } = useNetworkData(ethernetInterface || '');

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
                        <Graph firstGraphValue={cpuUsage} maxValue={100}/>
                    </ListItem>
                    <ListItem onClick={() => handleItemClick('Memory')}>
                        Memory
                        <Graph firstGraphValue={memory} maxValue={maxMemory}/>
                    </ListItem>
                    <ListItem onClick={() => handleItemClick('DISK')}>
                        DISK
                    </ListItem>
                    {wifi &&
                    <ListItem onClick={() => handleItemClick('Wi-Fi')}>
                        Wi-Fi
                        <Graph firstGraphValue={wifiDownload} secondGraphValue={wifiUpload} />
                    </ListItem>}
                    {ethernet &&
                    <ListItem onClick={() => handleItemClick('Ethernet')}>
                        Ethernet
                        <Graph firstGraphValue={ethernetDownload} secondGraphValue={ethernetUpload} />
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
