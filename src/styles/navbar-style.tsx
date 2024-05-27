// navbar-style.tsx
import styled from 'styled-components';

export const StyledNav = styled.nav`
    background-color: #222222;
    position: fixed;
    top: 0;
    left: 0;
    z-index: 1000;
    width: 100%;
    height: 30px;
`;

export const StyledButton = styled.button`
    display: flex;
    align-items: center;
    background-color: transparent;
    border-radius: 6px;
    color: white;
    border: none;
    font-size: 14px;
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
    height: 100%; 
`;

// Additional styles for main content
export const MainContent = styled.main`
    margin-top: 60px; /* Adjust this to match the height of your navbar */
    padding: 1rem;
`;

// You can export a wrapper component to use in your main layout
export const Wrapper = styled.div`
    overflow-x: hidden; /* Prevent horizontal scroll */
`;

