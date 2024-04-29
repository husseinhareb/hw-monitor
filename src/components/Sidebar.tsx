//sidebar.tsx
import React from 'react';
import { List, ListItem, SidebarContainer, Title } from '../styled-components/sidebar-style';


import Network from './Network';

import Cpu from './Cpu';

const Sidebar: React.FC = () => {

    return (
        <div style={{ display: 'flex' }}>
            <SidebarContainer>
                <Title>Performance</Title>
                <List>
                    <ListItem>CPU</ListItem>
                    <ListItem>Memory</ListItem>
                    <ListItem>DISK</ListItem>
                    <ListItem>Wi-Fi<Network /></ListItem>

                </List>
            </SidebarContainer>
            <Cpu/>
        </div>
    );
}

export default Sidebar;
