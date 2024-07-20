import React, { useEffect, useState } from 'react';
import { List, ListItem, SidebarContainer, Title } from '../../styles/sidebar-style';
import { useCpu, useEthernetSpeed, useGpu, useMaxMemory, useMemory, useWifiSpeed } from "../../services/store";
import Network from './Network';
import Graph from '../Graph/Graph';
import Cpu from './Cpu';
import Gpu from './Gpu';
import Memory from './Memory';
import usePerformanceConfig from '../../hooks/Performance/usePerformanceConfig';

interface SidebarProps {
    interfaceNames: string[];
}

const Sidebar: React.FC<SidebarProps> = ({ interfaceNames }) => {
    const [showCpu, setShowCpu] = useState(true);
    const [showMemory, setShowMemory] = useState(false);
    const [showGpu, setShowGpu] = useState(false);
    const [wifi, setWifi] = useState(false);
    const [ethernet, setEthernet] = useState(false);
    const [showWifi, setShowWifi] = useState(false);
    const [showEthernet, setShowEthernet] = useState(false);
    const [selectedItem, setSelectedItem] = useState('CPU');

    const cpuUsage = useCpu();
    const memory = useMemory();
    const maxMemory = useMaxMemory();
    const gpuUsage = useGpu();
    const [wifiDownloadSpeed, wifiUploadSpeed] = useWifiSpeed();
    const [ethernetDownloadSpeed, ethernetUploadSpeed] = useEthernetSpeed();

    const performanceConfig = usePerformanceConfig();

    // Check if maxMemory has been set
    const isMaxMemorySet = maxMemory !== 0;

    const handleItemClick = (itemName: string) => {
        setSelectedItem(itemName);
        setShowCpu(itemName === 'CPU');
        setShowMemory(itemName === 'Memory');
        setShowGpu(itemName === 'GPU');
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
        <div style={{ height: '100%', width: '100%', display: 'flex', overflow: 'hidden' }}>
            <SidebarContainer
                performanceSidebarBackgroundColor={performanceConfig.config.performance_sidebar_background_color}
                performanceSidebarColor={performanceConfig.config.performance_sidebar_color}
            >
                <Title>Performance</Title>
                <List>
                    <ListItem
                        performanceSidebarBackgroundColor={performanceConfig.config.performance_sidebar_background_color}
                        performanceSidebarSelectedColor={performanceConfig.config.performance_sidebar_selected_color}
                        isSelected={selectedItem === 'CPU'}
                        onClick={() => handleItemClick('CPU')}
                    >
                        CPU
                        <Graph firstGraphValue={cpuUsage} maxValue={100} height="120px" width="100%" />
                    </ListItem>
                    {isMaxMemorySet && (
                        <ListItem
                            performanceSidebarBackgroundColor={performanceConfig.config.performance_sidebar_background_color}
                            performanceSidebarSelectedColor={performanceConfig.config.performance_sidebar_selected_color}
                            isSelected={selectedItem === 'Memory'}
                            onClick={() => handleItemClick('Memory')}
                        >
                            Memory
                            <Graph firstGraphValue={memory} maxValue={maxMemory} height="120px" width="100%" />
                        </ListItem>
                    )}
                    <ListItem
                        performanceSidebarBackgroundColor={performanceConfig.config.performance_sidebar_background_color}
                        performanceSidebarSelectedColor={performanceConfig.config.performance_sidebar_selected_color}
                        isSelected={selectedItem === 'GPU'}
                        onClick={() => handleItemClick('GPU')}
                    >
                        GPU
                        <Graph firstGraphValue={gpuUsage} maxValue={100} height="120px" width="100%" />
                    </ListItem>
                    {wifi &&
                        <ListItem
                            performanceSidebarBackgroundColor={performanceConfig.config.performance_sidebar_background_color}
                            performanceSidebarSelectedColor={performanceConfig.config.performance_sidebar_selected_color}
                            isSelected={selectedItem === 'Wi-Fi'}
                            onClick={() => handleItemClick('Wi-Fi')}
                        >
                            Wi-Fi
                            <Graph firstGraphValue={wifiDownloadSpeed} secondGraphValue={wifiUploadSpeed} height="120px" width="100%" />
                        </ListItem>}
                    {ethernet &&
                        <ListItem
                            performanceSidebarBackgroundColor={performanceConfig.config.performance_sidebar_background_color}
                            performanceSidebarSelectedColor={performanceConfig.config.performance_sidebar_selected_color}
                            isSelected={selectedItem === 'Ethernet'}
                            onClick={() => handleItemClick('Ethernet')}
                        >
                            Ethernet
                            <Graph firstGraphValue={ethernetDownloadSpeed} secondGraphValue={ethernetUploadSpeed} height="120px" width="100%" />
                        </ListItem>}
                </List>
            </SidebarContainer>
            <div style={{ height: '100%', width: '100%', display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
                <Cpu hidden={!showCpu} performanceConfig={performanceConfig} />
                <Memory hidden={!showMemory} performanceConfig={performanceConfig} />
                <Gpu hidden={!showGpu} performanceConfig={performanceConfig} />
                <Network hidden={!showWifi} interfaceName={interfaceNames.find(name => name.includes("wl")) || ''} performanceConfig={performanceConfig} />
                <Network hidden={!showEthernet} interfaceName={interfaceNames.find(name => name.includes("en") || name.includes("eth")) || ''} performanceConfig={performanceConfig} />
            </div>
        </div>
    );
}

export default Sidebar;
