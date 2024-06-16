import styled from 'styled-components';

export const StyledNav = styled.nav`
    background-color: #222222;
    width: 100%;
    height:30px;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
`;

export const ConfigButtonContainer = styled.div`
    position: absolute;
    left: 1em;
`;

export const StyledButton = styled.button<{ active: boolean }>`
  background-color: ${({ active }) => (active ? "#f3eae8" : "transparent")};
  color: ${({ active }) => (active ? "#212830" : "#f3eae8")};
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
    color: #212830;
    background-color: #f3eae8;
  }
  svg {
    margin-right: 8px;
  }
`;

export const StyledSearchButton = styled.button`
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
  &:hover {
    color: #212830;
    background-color: #f3eae8;
  }
  position: absolute;
  right: 1em;
`;

export const SearchInput = styled.input`
    position: absolute;
    right: 5em;
    padding: 2px 4px;
    border-radius: 2px;
    border: none;
    outline: none;
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
  height:100%;
  width:100%
`;
