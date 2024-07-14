import styled from 'styled-components';

export const StyledNav = styled.nav<{ navbarBackgroundColor: string }>`
    background-color: ${(props) => props.navbarBackgroundColor};
    width: 100%;
    height: 30px;
    display: flex;
    justify-content: center;
    align-items: center;
    position: fixed;
    top: 0; 
    left: 0;  
    z-index: 1000;  
`;


export const ConfigButtonContainer = styled.div`
    position: absolute;
    left: 1em;
`;

export const StyledButton = styled.button<{ active: boolean; navbarButtonsForegroundColor: string; navbarButtonsBackgroundColor:string }>`
  background-color: ${({ active }) => (active ? (props) => props.navbarButtonsBackgroundColor : "transparent")};
  color: ${({ active }) => (active ? (props) => props.navbarButtonsForegroundColor : (props) => props.navbarButtonsBackgroundColor)};
  display: flex;
  align-items: center;
  border-radius: 4px;
  border: none;
  font-size: 12px;
  cursor: pointer;
  outline: none;
  padding: 4px 8px;
  margin: 0 5px;
  &:hover {
    color: ${(props) => props.navbarButtonsForegroundColor};
    background-color: ${(props) => props.navbarButtonsBackgroundColor};
  }
  svg {
    margin-right: 8px;
  }
`;

export const StyledSearchButton = styled.button<{ navbarButtonsForegroundColor: string; navbarButtonsBackgroundColor:string }>`
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 4px;
  border: none;
  font-size: 12px;
  cursor: pointer;
  outline: none;
  padding: 4px 8px;
  margin: 0 5px;
  color: ${(props) => props.navbarButtonsForegroundColor};
  background-color: ${(props) => props.navbarButtonsBackgroundColor};
  
  position: absolute;
  right: 1em;
`;

export const SearchInput = styled.input<{ navbarSearchBackgroundColor: string; navbarSearchForegroundColor:string }>`
    position: absolute;
    right: 5em;
    padding: 2px 4px;
    border-radius: 2px;
    border: none;
    color: ${(props) => props.navbarSearchForegroundColor};
    background-color: ${(props) => props.navbarSearchBackgroundColor};
    outline: none;
    width:15%;
`;

export const StyledUl = styled.ul`
    display: flex;
    justify-content: center;
    align-items: center;
    list-style: none;
    padding: 0;
    margin: 0;
    height: 100%;
`;

export const ContentContainer = styled.div`
  height: 100%;
  width: 100%;
  padding-top: 30px; 
`;
