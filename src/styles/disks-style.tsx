import { styled, keyframes } from "styled-components";

export const Container = styled.div<{ $bodyBackgroundColor: string }>`
  display: flex;
  flex-wrap: wrap;
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
  flex-grow: 1;
  flex-basis: calc(33% - 20px);
  max-height: calc(100vh - 40px);
  box-sizing: border-box;

  @media (max-height: 600px) {
    flex-basis: calc(50% - 20px);
  }

  @media (min-height: 600px) {
    flex-basis: calc(100% - 20px);
  }
`;

export const DiskHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

export const DiskTitle = styled.h3<{ $nameForegroundColor: string }>`
  margin-top: 0;
  color:  ${(props) => props.$nameForegroundColor};
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
  width: min(660px, calc(100vw - 40px));
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
  overflow-y: auto;
  padding: 12px;
  min-height: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  align-content: start;
  align-items: start;
  gap: 10px;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(128, 128, 128, 0.5);
  }
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
  font-weight: 600;
  border-bottom: 1px solid ${(props) => props.$borderColor};
  padding: 7px 10px;
`;

export const DetailRow = styled.div<{ $borderColor: string }>`
  display: grid;
  grid-template-columns: minmax(100px, 0.85fr) minmax(0, 1fr);
  gap: 8px;
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
  display: flex;
  justify-content: space-between;
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
`;


export const FileSystem = styled.span<{ $partitionTypeForegroundColor: string }>`
  color:  ${(props) => props.$partitionTypeForegroundColor};
`;

export const Space = styled.span<{ $partitionUsageForegroundColor: string }>`
  color:  ${(props) => props.$partitionUsageForegroundColor};
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
