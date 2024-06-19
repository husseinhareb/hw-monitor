// StyledComponents.js
import styled from 'styled-components';
import { lighten } from 'polished';

export const TableContainer = styled.div`
    width: 100%;
    overflow-x: auto;
`;

export const Table = styled.table<{ bodyBackgroundColor: string; bodyColor: string; headBackgroundColor: string; headColor: string }>`
    width: 100%;
    table-layout: auto;
    border-collapse: collapse;
    background-color: ${(props) => props.bodyBackgroundColor};
    color: ${(props) => props.bodyColor};
`;

export const Thead = styled.thead<{ headBackgroundColor: string; headColor: string }>`
    background-color: ${(props) => props.headBackgroundColor};
    color: ${(props) => props.headColor};
    text-align: left;
`;

export const Th = styled.th<{ headBackgroundColor: string; headColor: string }>`
    padding: 8px;
    border: 1px solid #2d2d2d;
    cursor: pointer;
    font-weight: bold;
    white-space: nowrap;
    overflow: hidden;
    font-size:14px;
    text-overflow: ellipsis;
    position: relative;
    &:hover {
        background-color: ${(props) => lighten(0.1, props.headBackgroundColor)};
}
`;

export const Resizer = styled.div`
    width: 5px;
    height: 100%;
    background: #000;
    position: absolute;
    top: 0;
    right: 0;
    cursor: col-resize;
    user-select: none;
`;

export const Tbody = styled.tbody<{ bodyBackgroundColor: string; bodyColor: string }>`
    background-color: ${(props) => props.bodyBackgroundColor};
    color: ${(props) => props.bodyColor};
`;

export const Tr = styled.tr``;

export const Td = styled.td<{ bodyBackgroundColor: string; bodyColor: string }>`
    padding: 8px;
    font-size: 14px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    border: 1px solid #333;
    &:hover {
        background-color: ${(props) => lighten(0.1, props.bodyBackgroundColor)};
}
`;
