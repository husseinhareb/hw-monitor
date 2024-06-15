import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  padding: 20px;
  background-color: #2b2b2b;
  overflow-y: auto;
`;

export const Title = styled.h1`
  text-align: center;
  color: #fff;
  margin-bottom: 10px;
`;

export const SensorGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(330px, 1fr));
  gap: 20px;
`;

export const SensorGroup = styled.div`
  background-color: #3a3a3a;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
`;

export const SensorList = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  width: 100%;
  height: 100%;
  min-height: 300px;
  overflow: hidden;
`;

export const SensorItem = styled.div`
  margin: 5px 0;
  padding: 10px;
  background-color: #4a4a4a;
  border-radius: 4px;
  font-weight: bold;
  display: flex;
  justify-content: space-between;
  width: 100%;
`;

export const SensorName = styled.h3`
  color: #0088dd;
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
`;

export const ContentDiv = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  overflow-y: auto;
`;

export const SensorValue = styled.span`
  color: #ff5722;
`;
