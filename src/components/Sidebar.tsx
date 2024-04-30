//sidebar.tsx
import React from 'react';
import { List, ListItem, SidebarContainer, Title } from '../styled-components/sidebar-style';
import { useTotalUsagesStore } from "../services/store";

import Network from './Network';

import Cpu from './Cpu';
import Graph from './Graph';

const Sidebar: React.FC = () => {

    const totalCpu = useTotalUsagesStore((state) => state.cpu);
    console.log(totalCpu);
    return (
        <div style={{ display: 'flex' }}>
            <SidebarContainer>
                <Title>Performance</Title>
                <List>
                    <ListItem>
                        CPU 
                        <Graph currentValue={totalCpu} maxValue={100} />
                    </ListItem>
                    <ListItem>Memory</ListItem>
                    <ListItem>DISK</ListItem>
                    <ListItem>Wi-Fi<Network /></ListItem>
                </List>
            </SidebarContainer>
            <Cpu />
        </div>
    );
}

export default Sidebar;
