import styled from "styled-components";

export const Container = styled.div`
  display: ${props => (props.hidden ? 'none' : 'flex')};
  flex-direction: column;
  width: 100vw;
  height: 100vh;
  padding: 20px;
  background-color: #2b2b2b;
  overflow-y: auto; 
`;

export const DiskCard = styled.div`
  background-color: #3a3a3a;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  padding: 20px;
  margin-bottom: 20px;
  flex-grow: 1; /* Allows the DiskCard to grow and fill available space */
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

export const PartitionBar = styled.div`
    height: 100%;
    background-color: #2b2b2b;
    border-radius: 8px;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 0;
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

export const AvailableSpace = styled.span`
  color: #ffcb6b;
`;

export const TotalSpace = styled.span`
  color: #ff5370;
`;
