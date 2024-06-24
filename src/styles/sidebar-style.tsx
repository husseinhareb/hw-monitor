// sidebar-style.js
import styled from 'styled-components';

// Styled SidebarContainer component
export const SidebarContainer = styled.div<{ performanceSidebarBackgroundColor: string; performanceSidebarColor: string }>`
  width: 200px;
  height: 100%;
  background-color: ${(props) => props.performanceSidebarBackgroundColor};
  color: ${(props) => props.performanceSidebarColor};
  padding: 20px;
`;

// Styled Title component
export const Title = styled.h2`
  margin-bottom: 20px;
`;

// Styled List component
export const List = styled.ul`
  list-style-type: none;
  padding: 0;
`;

// Styled ListItem component
export const ListItem = styled.li`
  margin-bottom: 10px;
  cursor: pointer;
  color: #b4b4b4;
  &:hover {
    color: #fff;
  }
`;
