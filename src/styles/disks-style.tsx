import { styled, keyframes } from "styled-components";

export const Container = styled.div`
  display: ${props => (props.hidden ? 'none' : 'flex')};
  flex-wrap: wrap;
  width: 100%;
  height: 100%;
  padding: 20px;
  background-color: #2b2b2b;
  overflow-y: auto;
`;

export const DiskCard = styled.div`
  background-color: #3a3a3a;
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

export const DiskTitle = styled.h3`
  margin-top: 0;
  color: #fff;
`;

export const DiskSize = styled.p`
  font-size: 1.1em;
  color: #ccc;
`;

export const PartitionList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

export const PartitionContainer = styled.div`
  width: 100%;
  height: 40px;
  background-color: #4a4a4a;
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

export const PartitionBar = styled.div`
  height: 100%;
  background-color: #2b2b2b;
  border-radius: 8px;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 0;
  animation: ${progressAnimation} 1s ease-in-out;
`;

export const PartitionName = styled.span`
  font-weight: bold;
  color: #61dafb;
`;

export const PartitionSize = styled.span`
  color: #ff6b6b;
`;

export const FileSystem = styled.span`
  color: #a3be8c;
`;

export const Space = styled.span`
  color: #ffcb6b;
`;
