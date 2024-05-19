import styled from 'styled-components';

export const StyledNav = styled.nav`
    background-color: #1B202C;
    padding: 1rem 0;
`;

export const StyledButton = styled.button`
    color: red;
    &:hover {
        color: #cbd5e0;
    }
    &:focus {
        outline: none;
    }
`;

export const StyledUl = styled.ul`
    display: flex;
    justify-content: center;
    list-style: none;
    padding: 0;
    margin: 0;
`;
