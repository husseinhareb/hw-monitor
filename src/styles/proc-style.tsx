import styled from 'styled-components';

export const TableContainer = styled.div`
    width: 100%;
    overflow: hidden;
`;

export const Table = styled.table`
    width: 100%;
    table-layout: fixed;
    border-collapse: collapse;
    background-color: #1e1e1e;
    color: #d4d4d4;
`;

export const Thead = styled.thead`
    background-color: #252526;
    color: #ffffff;
    text-align: left;
`;

export const Th = styled.th`
    padding: 8px;
    border: 1px solid #2d2d2d;
    cursor: pointer;
    font-weight: bold;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    position: relative;
    &:hover {
        background-color: #3e3e3e;
    }
`;

export const Resizer = styled.div`
    width: px;
    height: 100%;
    background: #000;
    position: absolute;
    top: 0;
    right: 0;
    cursor: col-resize;
    user-select: none;
`;

export const Tbody = styled.tbody`
    background-color: #2d2d2d;
`;

export const Tr = styled.tr``;

export const Td = styled.td`
    padding: 8px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    border: 1px solid #333;
    &:hover {
        background-color: #3e3e3e;
    }
`;
