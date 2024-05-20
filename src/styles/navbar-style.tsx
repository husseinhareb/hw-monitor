import styled from 'styled-components';

export const StyledNav = styled.nav`
    background-color: #222222;
    padding: 1rem 0;
    position: fixed;
    width: 100%;
    top: 0;
    left: 0;
    z-index: 1000;
`;

export const StyledButton = styled.button`
    display: flex;
    font-weight:bold;
    align-items: center;
    background-color: transparent;
    border-radius: 6px;
    color: white;
    border: none;
    font-size: 18px;
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

export const StyledUl = styled.ul`
    display: flex;
    justify-content: center;
    align-items: center;
    list-style: none;
    padding: 0;
    margin: 0;
`;
