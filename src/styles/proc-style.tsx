import styled from 'styled-components';
import { lighten } from 'polished';

const baseFontSize = 15; // Base font size in pixels

// Calculate font size dynamically based on column count
const calculateFontSize = (columnCount: number): number => {
    const base = baseFontSize;
    return base - Math.min(columnCount * 0.5, 4);
};

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

export const Th = styled.th<{ headBackgroundColor: string; headColor: string; columnCount: number; }>`
    padding: 8px;
    border: 1px solid #2d2d2d;
    cursor: pointer;
    font-weight: bold;
    white-space: nowrap;
    overflow: hidden;
    max-width: 140px;
    font-size: ${(props) => calculateFontSize(props.columnCount)}px;
    text-overflow: ellipsis;
    position: relative;
    align-items: center;
    justify-content: space-between;

    .header-content {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
    }

    .header-label {
        display: flex;
        align-items: center;
    }

    .percentage {
        font-size: 0.8em;
        color: ${(props) => lighten(0.2, props.headColor)};
    }

    .label {
        margin-top: 2px;
    }

    &:hover {
        background-color: ${(props) => lighten(0.1, props.headBackgroundColor)};
    }
`;

export const Tbody = styled.tbody<{ bodyBackgroundColor: string; bodyColor: string }>`
    background-color: ${(props) => props.bodyBackgroundColor};
    color: ${(props) => props.bodyColor};
`;

export const Tr = styled.tr``;

export const Td = styled.td<{ bodyBackgroundColor: string; bodyColor: string; columnCount: number; }>`
    padding: 8px;
    font-size: ${(props) => calculateFontSize(props.columnCount)}px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    border: 1px solid #333;

    &:hover {
        background-color: ${(props) => lighten(0.1, props.bodyBackgroundColor)};
    }
    max-width: 140px;
`;
