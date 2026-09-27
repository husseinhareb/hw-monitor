import { styled, keyframes } from "styled-components";

// Cards per row follow the available width; 560px keeps a partition row (name, mount, fs, usage) on one line
export const Container = styled.div<{ $bodyBackgroundColor: string }>`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(560px, 100%), 1fr));
  align-content: start;
  width: 100%;
  height: 100%;
  padding: 20px;
  background-color: ${(props) => props.$bodyBackgroundColor};
  overflow-y: auto;
`;

export const DiskCard = styled.div<{ $boxesBackgroundColor: string }>`
  background-color: ${(props) => props.$boxesBackgroundColor};
  padding: 20px;
  margin: 10px;
  box-sizing: border-box;
  min-width: 0;
`;

export const DiskHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

export const DiskTitle = styled.h3<{ $nameForegroundColor: string }>`
  margin-top: 0;
  color: ${(props) => props.$nameForegroundColor};
`;

export const DetailsIcon = styled.div<{ $color: string }>`
  cursor: pointer;
  color: ${(props) => props.$color};
  font-size: 1.2em;
  display: flex;
  align-items: center;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.7;
  }
`;

export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

export const ModalContent = styled.div<{
  $backgroundColor: string;
  $textColor: string;
  $borderColor: string;
}>`
  background: ${(props) => props.$backgroundColor};
  color: ${(props) => props.$textColor};
  width: min(1200px, calc(100vw - 40px));
  max-height: calc(100vh - 60px);
  position: relative;
  display: flex;
  flex-direction: column;
  border: 1px solid ${(props) => props.$borderColor};
  box-sizing: border-box;

  @media (max-width: 600px) {
    width: 100%;
    max-height: 100%;
  }
`;

export const ModalHeader = styled.div<{
  $borderColor: string;
  $headerBackgroundColor: string;
}>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid ${(props) => props.$borderColor};
  background: ${(props) => props.$headerBackgroundColor};
  padding: 12px 14px;
  flex-shrink: 0;

  h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

export const CloseButton = styled.button<{ $color: string; $borderColor: string }>`
  background: transparent;
  border: 1px solid ${(props) => props.$borderColor};
  color: ${(props) => props.$color};
  cursor: pointer;
  font-size: 20px;
  line-height: 1;
  width: 28px;
  height: 28px;
  padding: 0;
  flex-shrink: 0;
  
  &:hover {
    opacity: 0.72;
  }
`;

export const ModalBody = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 12px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  align-content: start;
  gap: 10px;
  scrollbar-width: thin;
  scrollbar-color: color-mix(in srgb, currentColor 15%, transparent) transparent;
  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb { background: color-mix(in srgb, currentColor 15%, transparent); }
`;

export const DetailSection = styled.div<{ $borderColor: string }>`
  border: 1px solid ${(props) => props.$borderColor};
  min-width: 0;
`;

export const SectionTitle = styled.h4<{
  $backgroundColor: string;
  $color: string;
  $borderColor: string;
}>`
  margin: 0;
  background: ${(props) => props.$backgroundColor};
  color: ${(props) => props.$color};
  text-transform: uppercase;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  border-bottom: 1px solid ${(props) => props.$borderColor};
  padding: 6px 10px;
`;

export const DetailRow = styled.div<{ $borderColor: string }>`
  display: grid;
  /* Labels are short; give values the room so models and paths wrap less */
  grid-template-columns: max-content minmax(0, 1fr);
  gap: 16px;
  padding: 5px 10px;
  border-bottom: 1px solid ${(props) => props.$borderColor};
  min-width: 0;

  &:last-child {
    border-bottom: none;
  }

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
    gap: 2px;
  }
`;

export const DetailLabel = styled.span<{ $color: string }>`
  color: ${(props) => props.$color};
  font-size: 12px;
  opacity: 0.75;
  min-width: 0;
`;

export const DetailValue = styled.span<{ $color: string }>`
  color: ${(props) => props.$color};
  font-size: 12px;
  text-align: right;
  min-width: 0;
  overflow-wrap: anywhere;

  @media (max-width: 600px) {
    text-align: left;
  }
`;

export const DiskSize = styled.p<{ $sizeForegroundColor: string }>`
  font-size: 1.1em;
  color: ${(props) => props.$sizeForegroundColor};
`;

export const PartitionList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

export const PartitionContainer = styled.div<{ $partitionBackgroundColor: string }>`
  width: 100%;
  height: 40px;
  background-color:  ${(props) => props.$partitionBackgroundColor};
  margin: 20px 0;
  position: relative;
`;

export const PartitionItem = styled.li`
  font-size: 0.95em;
  display: grid;
  /* Same columns in every row so they line up; filesystem and size get fixed widths that fit
     "fuseblk" and "338.14 GB / 511.31 GB", so a narrow card squeezes the mount path instead */
  grid-template-columns: minmax(6.5em, 1fr) minmax(0, 2fr) 5.5em 11.5em;
  gap: 12px;
  padding: 10px;
  position: relative;
  z-index: 1;
`;

const progressAnimation = keyframes`
  from {
    transform: scaleX(0);
  }
  to {
    transform: scaleX(1);
  }
`;

export const PartitionBar = styled.div<{ $partitionUsageBackgroundColor: string }>`
  height: 100%;
  background-color:  ${(props) => props.$partitionUsageBackgroundColor};
  position: absolute;
  top: 0;
  left: 0;
  z-index: 0;
  transform-origin: left;
  animation: ${progressAnimation} 1s ease-in-out;
`;

export const PartitionName = styled.span<{ $partitionNameForegroundColor: string }>`
  font-weight: bold;
  color:  ${(props) => props.$partitionNameForegroundColor};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;


export const FileSystem = styled.span<{ $partitionTypeForegroundColor: string }>`
  color:  ${(props) => props.$partitionTypeForegroundColor};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const Space = styled.span<{ $partitionUsageForegroundColor: string }>`
  color:  ${(props) => props.$partitionUsageForegroundColor};
  text-align: right;
  white-space: nowrap;
`;

export const PartitionCard = styled.div<{ $borderColor: string }>`
  &:not(:first-child) {
    border-top: 1px solid ${(props) => props.$borderColor};
  }
`;

export const PartitionCardHeader = styled.div<{ $color: string; $borderColor: string }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 10px;
  border-bottom: 1px solid ${(props) => props.$borderColor};
  color: ${(props) => props.$color};
  font-size: 12px;
  font-weight: 700;
`;

export const SmartHealthBanner = styled.div<{ $color: string; $borderColor: string }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 10px;
  border-bottom: 1px solid ${(props) => props.$borderColor};
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  background: color-mix(in srgb, ${(props) => props.$color} 12%, transparent);
  color: ${(props) => props.$color};
`;

export const SmartHealthDot = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
  flex-shrink: 0;
`;

export const SmartTable = styled.table<{ $borderColor: string; $labelColor: string; $valueColor: string; $warningColor: string; $failColor: string }>`
  width: 100%;
  border-collapse: collapse;
  font-size: 11px;
  color: ${(props) => props.$valueColor};

  th {
    padding: 4px 6px;
    text-align: left;
    font-weight: 600;
    font-size: 10px;
    text-transform: uppercase;
    color: ${(props) => props.$labelColor};
    border-bottom: 1px solid ${(props) => props.$borderColor};
    white-space: nowrap;
  }

  td {
    padding: 3px 6px;
    border-bottom: 1px solid ${(props) => props.$borderColor};
    white-space: nowrap;
  }

  tr:last-child td {
    border-bottom: none;
  }

  tr.prefail td:first-child {
    border-left: 2px solid ${(props) => props.$warningColor};
    padding-left: 4px;
  }

  tr.failed td:first-child {
    border-left: 2px solid ${(props) => props.$failColor};
    padding-left: 4px;
  }
`;

export const SmartBadge = styled.span<{ $color: string }>`
  display: inline-flex;
  align-items: center;
  padding: 1px 5px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  background: color-mix(in srgb, ${(props) => props.$color} 20%, transparent);
  color: ${(props) => props.$color};
`;

export const SmartError = styled.div`
  padding: 10px;
  font-size: 12px;
  opacity: 0.65;
  font-style: italic;
`;

export const SmartLimitedBanner = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 8px 10px;
  font-size: 12px;
  opacity: 0.75;
`;



export const SmartLoading = styled.div`
  padding: 10px;
  font-size: 12px;
  opacity: 0.55;
`;
