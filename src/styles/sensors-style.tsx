import styled from 'styled-components';

export const Container = styled.div<{ sensorsBackgroundColors: string; }>`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  padding: 20px;
  background-color: ${(props) => props.sensorsBackgroundColors};
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

export const SensorList = styled.div<{ sensorsBoxesBackgroundColor: string; }>`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: ${(props) => props.sensorsBoxesBackgroundColor};
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  min-height: 100px;
  height: 100%; 
  overflow: hidden;
`;

export const SensorGroup = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  width: 100%;
`;

export const SensorItem = styled.div<{ sensorsGroupForegroundColor: string; }>`
  margin: 5px 0;
  border-radius: 4px;
  display: flex;
  justify-content: space-between;
  width: 100%;
  color: ${(props) => props.sensorsGroupForegroundColor};
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

