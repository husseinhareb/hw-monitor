//Sidebar.tsx
import React, { useEffect, useState } from 'react';
import { lighten } from 'polished';
import { List, ListItem, SidebarContainer, Title } from '../../styles/sidebar-style';
import { useCpu, useEthernetSpeed, useMaxMemory, useMemory, useWifiSpeed } from "../../services/store";
import Network from './Network';
import Graph from '../Graph';
import Cpu from './Cpu';
import Disks from '../Disks/Disks';
import Memory from './Memory';
import usePerformanceConfig from '../../hooks/usePerformanceConfig';
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
    const [selectedItem, setSelectedItem] = useState('CPU');

    const cpuUsage = useCpu();
    const memory = useMemory();
    const maxMemory = useMaxMemory();
    const [wifiDownloadSpeed, wifiUploadSpeed] = useWifiSpeed();
    const [ethernetDownloadSpeed, ethernetUploadSpeed] = useEthernetSpeed();

    const performanceConfig = usePerformanceConfig();
    
    // Check if maxMemory has been set
    const isMaxMemorySet = maxMemory !== 0;
    const handleItemClick = (itemName: string) => {
        setSelectedItem(itemName);
        setShowCpu(itemName === 'CPU');
        setShowMemory(itemName === 'Memory');
        setShowDisk(itemName === 'DISK');
        setShowWifi(itemName === 'Wi-Fi');
        setShowEthernet(itemName === 'Ethernet');
    };

    useEffect(() => {
        if (interfaceNames && interfaceNames.length > 0) {
            setWifi(interfaceNames.some(name => name.includes("wl")));
            setEthernet(interfaceNames.some(name => name.includes("en") || name.includes("eth")));
        }
    }, [interfaceNames]);

    return (
        <div style={{ height: '100%', width: '100%', display: 'flex' }}>
            <SidebarContainer
                performanceSidebarBackgroundColor={performanceConfig.config.performance_sidebar_background_color}
                performanceSidebarColor={performanceConfig.config.performance_sidebar_color}
            >
                <Title>Performance</Title>
                <List>
                    <ListItem
                        onClick={() => handleItemClick('CPU')}
                        style={{ color: selectedItem === 'CPU' ? lighten(0.1, performanceConfig.config.performance_sidebar_selected_color) : performanceConfig.config.performance_sidebar_selected_color }}
                    >
                        CPU
                        <Graph firstGraphValue={cpuUsage} maxValue={100} height="120px" width="100%" />
                    </ListItem>
                    {isMaxMemorySet && (
                        <ListItem
                            onClick={() => handleItemClick('Memory')}
                            style={{ color: selectedItem === 'Memory' ? lighten(0.15, performanceConfig.config.performance_sidebar_selected_color) : performanceConfig.config.performance_sidebar_selected_color }}
                        >
                            Memory
                            <Graph firstGraphValue={memory} maxValue={maxMemory} height="120px" width="100%" />
                        </ListItem>
                    )}

                    {wifi &&
                        <ListItem
                            onClick={() => handleItemClick('Wi-Fi')}
                            style={{ color: selectedItem === 'Wi-Fi' ? lighten(0.15, performanceConfig.config.performance_sidebar_selected_color) : performanceConfig.config.performance_sidebar_selected_color }}
                        >
                            Wi-Fi
                            <Graph firstGraphValue={wifiDownloadSpeed} secondGraphValue={wifiUploadSpeed} height="120px" width="100%" />
                        </ListItem>}
                    {ethernet &&
                        <ListItem
                            onClick={() => handleItemClick('Ethernet')}
                            style={{ color: selectedItem === 'Ethernet' ? lighten(0.15, performanceConfig.config.performance_sidebar_selected_color) : performanceConfig.config.performance_sidebar_selected_color }}
                        >
                            Ethernet
                            <Graph firstGraphValue={ethernetDownloadSpeed} secondGraphValue={ethernetUploadSpeed} height="120px" width="100%" />
                        </ListItem>}
                </List>
            </SidebarContainer>
            <div style={{ height: '100%', width: '100%', display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
                <Cpu hidden={!showCpu} /> 
                <Memory hidden={!showMemory} />
                <Disks hidden={!showDisk} />
                <Network hidden={!showWifi} interfaceName={interfaceNames.find(name => name.includes("wl")) || ''} />
                <Network hidden={!showEthernet} interfaceName={interfaceNames.find(name => name.includes("en") || name.includes("eth")) || ''} />
            </div>
        </div >
    );
}

export default Sidebar;
