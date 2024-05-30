import styled from "styled-components";

// Styled Components
export const Container = styled.div`
  display: ${props => (props.hidden ? 'none' : 'flex')};
  flex-direction: column;
  width: 100vw;
  height: 100vh;
  padding: 20px;
  background-color: #2b2b2b;
  overflow-y: auto; 
`;

export const Title = styled.h1`
  text-align: center;
  color: #fff;
`;

export const SensorGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
`;

export const SensorGroup = styled.div`
  background-color: #3a3a3a;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);

`;

export const SensorGroupName = styled.h2`
  margin-bottom: 10px;
  color: #007acc;
`;

export const SensorList = styled.ul`
  list-style: none;
  padding: 0;
`;

export const SensorItem = styled.li`
  margin: 5px 0;
  padding: 10px;
  background-color: #4a4a4a;
  border-radius: 4px;
  font-weight: bold;
  display: flex;
  justify-content: space-between;
`;

export const SensorName = styled.span`
  color: #005f99;
`;

export const SensorValue = styled.span`
  color: #ff5722;
`;
