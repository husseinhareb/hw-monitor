import styled from "styled-components";

// Styled Components
export const Container = styled.div`
  padding: 20px;
  background-color: #2B2B2B;
  margin: 0 auto;
`;

export const Title = styled.h1`
  text-align: center;
  color: #333;
`;

export const SensorGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
`;

export const SensorGroup = styled.div`
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
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
  background-color: #e6f7ff;
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
