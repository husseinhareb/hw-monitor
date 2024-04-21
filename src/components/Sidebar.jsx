import React from 'react';
import { List, ListItem, SidebarContainer, Title } from '../styled-components/sidebar-style';

function Sidebar() {
  return (
    <SidebarContainer>
      <Title>Sidebar</Title>
      <List>
        <ListItem>CPU</ListItem>
        <ListItem>Link 2</ListItem>
        <ListItem>Link 3</ListItem>
      </List>
    </SidebarContainer>
  );
};

export default Sidebar;
