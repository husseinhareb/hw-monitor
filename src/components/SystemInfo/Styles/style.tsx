import styled from "styled-components";

interface ThemeProps {
    $bg: string;
    $boxesBg: string;
    $titleColor: string;
    $labelColor: string;
    $valueColor: string;
    $borderColor: string;
}

export const Container = styled.div<{ $bg: string }>`
    background-color: ${(p) => p.$bg};
    height: 100%;
    padding: 20px 20px 28px 20px;
    overflow-y: auto;
    box-sizing: border-box;
`;

export const TopBar = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
`;

export const PageTitle = styled.h2<{ $color: string }>`
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: ${(p) => p.$color};
`;

export const RefreshButton = styled.button<{ $bg: string; $fg: string; $border: string }>`
    background: ${(p) => p.$bg};
    color: ${(p) => p.$fg};
    border: 1px solid ${(p) => p.$border};
    padding: 6px 14px;
    font-size: 12px;
    cursor: pointer;
    border-radius: 4px;
    &:hover {
        opacity: 0.85;
    }
    &:active {
        opacity: 0.7;
    }
`;

export const SectionGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
    gap: 16px;
`;

export const SystemCard = styled.div<ThemeProps>`
    background-color: ${(p) => p.$boxesBg};
    border: 1px solid ${(p) => p.$borderColor};
    border-radius: 6px;
    padding: 0;
    overflow: hidden;
`;

export const CardTitle = styled.div<{ $titleColor: string; $borderColor: string }>`
    color: ${(p) => p.$titleColor};
    font-size: 13px;
    font-weight: 600;
    padding: 10px 14px;
    border-bottom: 1px solid ${(p) => p.$borderColor};
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

export const InfoGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 0;
`;

export const InfoItem = styled.div<{ $borderColor: string }>`
    padding: 10px 14px;
    border-bottom: 1px solid ${(p) => p.$borderColor}66;
    min-width: 0;
    &:last-child {
        border-bottom: none;
    }
`;

export const InfoLabel = styled.div<{ $labelColor: string }>`
    font-size: 10px;
    color: ${(p) => p.$labelColor};
    text-transform: uppercase;
    margin-bottom: 3px;
    letter-spacing: 0.3px;
`;

export const InfoValue = styled.div<{ $valueColor: string }>`
    font-size: 13px;
    color: ${(p) => p.$valueColor};
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    line-height: 1.3;
`;

// Multi-value variant that wraps when there are many entries
export const InfoValueWrap = styled.div<{ $valueColor: string }>`
    font-size: 13px;
    color: ${(p) => p.$valueColor};
    line-height: 1.4;
    word-break: break-word;
`;
