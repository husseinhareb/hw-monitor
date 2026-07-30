import styled from 'styled-components';
import { safeLighten } from '../utils/safeLighten';

const baseFontSize = 15; // Base font size in pixels

// Calculate font size dynamically based on column count
const calculateFontSize = (columnCount: number): number => {
    const base = baseFontSize;
    return base - Math.min(columnCount * 0.5, 4);
};

export const TableContainer = styled.div`
    width: 100%;
    height: 80vh; 
    overflow-y: auto; 
    position: relative;
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
    position: sticky;
    top: 0; 
    z-index: 1; 
`;

export const Th = styled.th<{ headBackgroundColor: string; headColor: string; columnCount: number; borderColor: string; }>`
    padding: 8px;
    border: 1px solid ${(props) => props.borderColor};
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
        color: ${(props) => safeLighten(0.2, props.headColor)};
    }

    .label {
        margin-top: 2px;
    }

    &:hover {
        background-color: ${(props) => safeLighten(0.1, props.headBackgroundColor)};
    }
`;

export const Tbody = styled.tbody<{ bodyBackgroundColor: string; bodyColor: string }>`
    background-color: ${(props) => props.bodyBackgroundColor};
    color: ${(props) => props.bodyColor};
`;

export const Tr = styled.tr<{ bodyBackgroundColor?: string }>`
    &:hover > td {
        background-color: ${(props) => props.bodyBackgroundColor ? safeLighten(0.05, props.bodyBackgroundColor) : 'inherit'};
    }
`;

export const Td = styled.td<{ bodyBackgroundColor: string; bodyColor: string; columnCount: number; borderColor: string; }>`
    padding: 8px;
    font-size: ${(props) => calculateFontSize(props.columnCount)}px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    border: 1px solid ${(props) => props.borderColor};
    max-width: 140px;
`;

export const BottomBar = styled.div<{ bottomBarBackgroundColor: string }>`
    position: fixed;
    bottom: 0;
    left: 0;
    height:4%;
    width: 100%;
    background-color: ${(props) => props.bottomBarBackgroundColor};
    padding: 4px;
    display: flex;
    justify-content: flex-end;
    align-items: center;
`;

export const KillButton = styled.button<{ killButtonBackgroundColor: string; killButtonColor: string }>`
    background-color: ${(props) => props.killButtonBackgroundColor};
    color: ${(props) => props.killButtonColor};
    border: none;
    padding: 4px 10px;
    font-size: 12px;
    cursor: pointer;
    &:hover {
        background-color: ${(props) => safeLighten(0.01, props.killButtonBackgroundColor)};
    }
    &:disabled {
        opacity: 0.45;
        cursor: default;
    }
    &:disabled:hover {
        background-color: ${(props) => props.killButtonBackgroundColor};
    }
`;

/* ── Process management modal ───────────────────────────────────────────── */

export const ManageModalOverlay = styled.div`
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.65);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
`;

export const ManageModalContent = styled.div<{ $backgroundColor: string; $color: string }>`
    background: ${(props) => props.$backgroundColor};
    color: ${(props) => props.$color};
    border: 1px solid rgba(255, 255, 255, 0.1);
    width: min(520px, calc(100vw - 40px));
    max-height: min(640px, calc(100vh - 80px));
    display: flex;
    flex-direction: column;
    overflow: hidden;
`;

export const ManageModalHeader = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 14px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    flex-shrink: 0;
`;

export const ManageModalTitle = styled.span`
    font-size: 13px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

export const ManageModalClose = styled.button`
    background: transparent;
    border: 1px solid rgba(255, 255, 255, 0.14);
    color: inherit;
    cursor: pointer;
    font-size: 16px;
    line-height: 1;
    width: 26px;
    height: 26px;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    outline: none;
    flex-shrink: 0;
    &:hover { background: rgba(255, 255, 255, 0.08); }
`;

export const ManageModalBody = styled.div`
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding: 14px;
    display: flex;
    flex-direction: column;
    gap: 18px;
`;

export const ManageSection = styled.section`
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

export const ManageSectionTitle = styled.h4`
    margin: 0;
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    opacity: 0.75;
`;

export const ManageRow = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
`;

export const ManageHint = styled.span`
    font-size: 11px;
    opacity: 0.6;
`;

export const ManageRangeInput = styled.input`
    flex: 1;
    min-width: 120px;
`;

export const ManageNumberInput = styled.input`
    width: 64px;
    background: rgba(0, 0, 0, 0.25);
    border: 1px solid rgba(255, 255, 255, 0.13);
    color: inherit;
    padding: 4px 6px;
    font-size: 12px;
    outline: none;
    &:focus {
        border-color: rgba(255, 255, 255, 0.3);
    }
`;

export const ManageActionButton = styled.button<{ $danger?: boolean }>`
    background-color: ${(props) => (props.$danger ? 'rgba(220, 60, 60, 0.85)' : 'rgba(255, 255, 255, 0.1)')};
    color: ${(props) => (props.$danger ? '#fff' : 'inherit')};
    border: 1px solid ${(props) => (props.$danger ? 'rgba(220, 60, 60, 0.9)' : 'rgba(255, 255, 255, 0.14)')};
    padding: 5px 12px;
    font-size: 12px;
    cursor: pointer;
    &:hover {
        opacity: 0.85;
    }
    &:disabled {
        opacity: 0.4;
        cursor: default;
    }
`;

export const AffinityGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(46px, 1fr));
    gap: 6px;
`;

export const AffinityCpuButton = styled.button<{ $selected: boolean }>`
    background-color: ${(props) => (props.$selected ? 'rgba(9, 255, 255, 0.18)' : 'rgba(255, 255, 255, 0.06)')};
    border: 1px solid ${(props) => (props.$selected ? 'rgba(9, 255, 255, 0.6)' : 'rgba(255, 255, 255, 0.12)')};
    color: inherit;
    padding: 6px 0;
    font-size: 11px;
    font-variant-numeric: tabular-nums;
    cursor: pointer;
    &:hover {
        border-color: rgba(9, 255, 255, 0.5);
    }
    &:disabled {
        opacity: 0.4;
        cursor: default;
    }
`;

export const ManageErrorText = styled.div`
    font-size: 11px;
    color: #ff8080;
`;
