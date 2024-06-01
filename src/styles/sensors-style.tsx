import styled, { keyframes } from 'styled-components';

interface DesignProps {
  percentage: number;
}

export const Container = styled.div`
  display: flex;
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
  margin-bottom:10px
`;

export const SensorGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 40px;
`;

export const SensorGroup = styled.div`
  background-color: #3a3a3a;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
`;

export const SensorGroupName = styled.h2`
  margin-bottom: 10px;
  color: #006eb8;
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

export const SensorName = styled.h3`
  color: #0088dd;
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
`;

export const SensorValue = styled.span`
  color: #ff5722;
`;

export const BatteryItem = styled.p`
  color:white;
  margin-bottom:3px;
`
export const DesignDiv = styled.div`
  flex: 0 0 auto;
  margin-right: 20px;
`;

export const ContentDiv = styled.div`
  flex: 1;
  margin-top:30px;
`;

const full = keyframes`
  0% {
    height: 0%;
  }
  100% {
    height: var(--percentage);
  }
`;

export const Design = styled.div<DesignProps>`
  background-color: rgb(6, 6, 6);
  position: relative;
  margin: 20px auto;
  width: 150px;
  height: 300px;
  border: 10px solid rgba(255, 255, 255, 0.8);
  border-radius: 15px;

  &::before {
    content: "";
    position: absolute;
    bottom: 6px;
    left: 6px;
    width: 118px;
    height: 0%;
    background-color: #38e740;
    border-radius: 5px;
    animation: ${full} 2s linear forwards;
        --percentage: ${({ percentage }) => `${percentage}%`};
  }

  &::after {
    content: "";
    position: absolute;
    top: -27px;
    left: 50%;
    transform: translateX(-50%);
    width: 60px;
    height: 15px;
    background-color: rgba(255, 255, 255, 0.8);
    border-top-left-radius: 10px; 
    border-top-right-radius: 10px; 
  }
`;
