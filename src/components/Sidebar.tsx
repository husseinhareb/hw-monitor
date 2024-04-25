import React from 'react';
import { List, ListItem, SidebarContainer, Title } from '../styled-components/sidebar-style';



const Sidebar: React.FC = () => {

    return (
        <div style={{ display: 'flex' }}>
            <SidebarContainer>
                <Title>Performance</Title>
                <List>
                    <ListItem >CPU</ListItem>
                   <ListItem>Memory</ListItem>
                    <ListItem>DISK</ListItem>
                    <ListItem>Wi-Fi</ListItem>
                </List>
            </SidebarContainer>
            </div>
    );
}

export default Sidebar;
