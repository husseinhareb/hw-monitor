// sidebar-style.js
import styled from 'styled-components';
import { lighten } from 'polished';
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

// Updated ListItem component
export const ListItem = styled.li<{ performanceSidebarBackgroundColor: string; performanceSidebarSelectedColor: string; isSelected: boolean }>`
  font-size: 14px;
  margin-bottom: 10px;
  cursor: pointer;
  padding: 5px;
  border-radius: 5px;
  transition: background-color 0.3s;
  color: ${(props) => props.isSelected ? lighten(0.1, props.performanceSidebarSelectedColor) : props.performanceSidebarSelectedColor};
  background-color: ${(props) => props.isSelected ? lighten(0.04, props.performanceSidebarBackgroundColor) : props.performanceSidebarBackgroundColor};
  transition: background-color 0.3s;

  &:hover {
    background-color: ${(props) => lighten(0.04, props.performanceSidebarBackgroundColor)};
  }
`;