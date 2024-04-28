import React from 'react';
import { List, ListItem, SidebarContainer, Title } from '../styled-components/sidebar-style';


import Graph from './Graph';
import Network from './Network';


interface PerformanceProps {
    cpuUsage: number[];
    memoryUsage: number[];
    download: number[];
    upload: number;
  }
  
    const Sidebar: React.FC<PerformanceProps> = ({cpuUsage,memoryUsage}) => {


    return (
        <div style={{ display: 'flex' }}>
            <SidebarContainer>
                <Title>Performance</Title>
                <List>
                    <ListItem>CPU<Graph currentValue={cpuUsage} maxValue={100} /></ListItem>
                    <ListItem>Memory<Graph currentValue={memoryUsage} maxValue={100} /></ListItem>
                    <ListItem>DISK</ListItem>
                    <ListItem>Wi-Fi<Network/></ListItem>

                </List>
            </SidebarContainer>
        </div>
    );
}

export default Sidebar;
