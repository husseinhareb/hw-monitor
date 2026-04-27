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
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
`;

export const ModalContent = styled.div<{ $backgroundColor: string; $textColor: string }>`
  background: ${(props) => props.$backgroundColor};
  color: ${(props) => props.$textColor};
  padding: 30px;
  border-radius: 12px;
  width: 50%;
  height: 50%;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
  position: relative;
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(255, 255, 255, 0.1);

  @media (max-width: 1024px) {
    width: 70%;
    height: 70%;
  }

  @media (max-width: 600px) {
    width: 90%;
    height: 90%;
  }
`;

export const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 2px solid rgba(128, 128, 128, 0.2);
  padding-bottom: 15px;

  h3 {
    margin: 0;
    font-size: 1.5em;
    letter-spacing: 0.5px;
  }
`;

export const CloseButton = styled.div`
  cursor: pointer;
  font-size: 2em;
  line-height: 1;
  transition: transform 0.2s;
  
  &:hover {
    transform: scale(1.1);
  }
`;

export const ModalBody = styled.div`
  flex: 1;
  overflow-y: auto;
  padding-right: 10px;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(128, 128, 128, 0.5);
    border-radius: 3px;
  }
`;

export const DetailSection = styled.div`
  margin-bottom: 25px;
`;

export const SectionTitle = styled.h4`
  margin: 0 0 12px 0;
  opacity: 0.7;
  text-transform: uppercase;
  font-size: 0.85em;
  letter-spacing: 1px;
  border-left: 3px solid currentColor;
  padding-left: 10px;
`;

export const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid rgba(128, 128, 128, 0.1);
  
  &:last-child {
    border-bottom: none;
  }
`;

export const DetailLabel = styled.span`
  opacity: 0.8;
`;

export const DetailValue = styled.span`
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-weight: 500;
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
