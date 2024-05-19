import styled from 'styled-components';

// Styled components
export const Table = styled.table`
    width: 100%;
    border-collapse: collapse;
    font-family: Arial, sans-serif;
    background-color: #f9f9f9;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    border-radius: 10px;
    overflow: hidden;
`;

export const Thead = styled.thead`
    background-color: #333;
    color: #fff;
    text-align: left;
`;

export const Th = styled.th`
    padding: 15px;
    cursor: pointer;
    &:hover {
        background-color: #555;
    }
`;

export const Tbody = styled.tbody`
    tr:nth-child(even) {
        background-color: #f2f2f2;
    }
`;

export const Tr = styled.tr`
    &:hover {
        background-color: #ddd;
    }
`;

export const Td = styled.td`
    padding: 15px;
`;