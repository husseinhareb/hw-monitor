// sidebar-style.js
import styled from 'styled-components';
import { safeLighten } from '../utils/safeLighten';

export const SidebarContainer = styled.div<{
  performanceSidebarBackgroundColor: string;
  performanceSidebarColor: string;
  performanceScrollbarColor: string;
  $collapsed: boolean;
}>`
  width: ${(props) => (props.$collapsed ? '0' : '240px')};
  min-width: ${(props) => (props.$collapsed ? '0' : '240px')};
  height: 100%;
  background-color: ${(props) => props.performanceSidebarBackgroundColor};
  color: ${(props) => props.performanceSidebarColor};
  padding: ${(props) => (props.$collapsed ? '0' : '14px')};
  overflow: hidden;
  transition: width 0.2s ease, min-width 0.2s ease, padding 0.2s ease;
  flex-shrink: 0;

  &:hover {
    overflow-y: ${(props) => (props.$collapsed ? 'hidden' : 'auto')};
  }

  &::-webkit-scrollbar {
    width: 10px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: ${(props) => props.performanceScrollbarColor};
    cursor: pointer;
  }

  &::-webkit-scrollbar-thumb:hover {
    background-color: ${(props) => safeLighten(0.1, props.performanceScrollbarColor)};
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  scrollbar-width: none;

  &:hover {
    scrollbar-width: ${(props) => (props.$collapsed ? 'none' : 'thin')};
    scrollbar-color: ${(props) => props.performanceScrollbarColor} transparent;
  }
`;

export const SidebarToggleButton = styled.button<{ performanceSidebarBackgroundColor: string; performanceSidebarColor: string }>`
  position: relative;
  width: 16px;
  flex-shrink: 0;
  align-self: stretch;
  background: transparent;
  color: ${(props) => props.performanceSidebarColor};
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  padding: 0;
  opacity: 0.4;
  transition: opacity 0.15s;
  outline: none;

  &:hover {
    opacity: 1;
  }

  svg {
    display: block;
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
  color: ${(props) => props.isSelected ? safeLighten(0.1, props.performanceSidebarSelectedColor) : props.performanceSidebarSelectedColor};
  background-color: ${(props) => props.isSelected ? safeLighten(0.04, props.performanceSidebarBackgroundColor) : props.performanceSidebarBackgroundColor};

  &:hover {
    background-color: ${(props) => safeLighten(0.04, props.performanceSidebarBackgroundColor)};
  }
`;