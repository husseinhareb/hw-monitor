// sidebar-style.js
import styled from 'styled-components';

// Styled SidebarContainer component
export const SidebarContainer = styled.div<{ performanceSidebarBackgroundColor: string; performanceSidebarColor: string }>`
  width: 240px;
  height: 100%;
  background-color: ${(props) => props.performanceSidebarBackgroundColor};
  color: ${(props) => props.performanceSidebarColor};
  padding: 14px;
  overflow-y: hidden;

  &:hover {
    overflow-y: auto;
  }

  &::-webkit-scrollbar {
    width: 10px;
    opacity: 0;
    transition: opacity 0.3s;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #888;
    border-radius: 4px;
    cursor: pointer;
  }

  &::-webkit-scrollbar-thumb:hover {
    background-color: #555;
    cursor: pointer;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &:hover::-webkit-scrollbar {
    opacity: 1;
  }

  scrollbar-width: none; 
  
  &:hover {
    scrollbar-width: thin; 
    scrollbar-color: #888 transparent; 
  }

  &::-webkit-scrollbar-thumb {
    pointer-events: all;
  }
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
