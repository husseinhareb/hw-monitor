import { styled, keyframes } from "styled-components";

export const Container = styled.div<{ bodyBackgroundColor: string }>`
  display: ${props => (props.hidden ? 'none' : 'flex')};
  flex-wrap: wrap;
  width: 100%;
  height: 100%;
  padding: 20px;
  background-color: ${(props) => props.bodyBackgroundColor};
  overflow-y: auto;
`;

export const DiskCard = styled.div<{ boxesBackgroundColor: string }>`
  background-color: ${(props) => props.boxesBackgroundColor};
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
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

export const DiskTitle = styled.h3<{ nameForegroundColor: string }>`
  margin-top: 0;
  color:  ${(props) => props.nameForegroundColor};
`;

export const DiskSize = styled.p<{ sizeForegroundColor: string }>`
  font-size: 1.1em;
  color: ${(props) => props.sizeForegroundColor};
`;

export const PartitionList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

export const PartitionContainer = styled.div<{ partitionBackgroundColor: string }>`
  width: 100%;
  height: 40px;
  background-color:  ${(props) => props.partitionBackgroundColor};
  border-radius: 8px;
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

const progressAnimation = keyframes<{ progress: number }>`
  from {
    width: 0%;
  }
  to {
    width: ${props => props.progress}%;
  }
`;

export const PartitionBar = styled.div<{ partitionUsageBackgroundColor: string }>`
  height: 100%;
  background-color:  ${(props) => props.partitionUsageBackgroundColor};
  border-radius: 8px;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 0;
  animation: ${progressAnimation} 1s ease-in-out;
`;

export const PartitionName = styled.span<{ partitionNameForegroundColor: string }>`
  font-weight: bold;
  color:  ${(props) => props.partitionNameForegroundColor};
`;


export const FileSystem = styled.span<{ partitionTypeForegroundColor: string }>`
  color:  ${(props) => props.partitionTypeForegroundColor};
`;

export const Space = styled.span<{ partitionUsageForegroundColor: string }>`
  color:  ${(props) => props.partitionUsageForegroundColor};
`;
