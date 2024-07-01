// battery-style.tsx
import styled, { keyframes, css } from 'styled-components';

interface DesignProps {
    percentage: number;
    sensorsBatteryBackgroundColor: string;
}

const realPerc = (percentage: number) => {
    return percentage * 94 / 100;
}

export const Item = styled.p<{ sensorsGroupForegroundColor: string; }>`
  color: ${(props) => props.sensorsGroupForegroundColor};
  margin-bottom: 3px;
`;

export const DesignDiv = styled.div`
  flex: 0 0 auto;
  margin-right: 20px;
`;

export const ContentDiv = styled.div`
  flex: 1;
  margin-top: 30px;
`;

const full = keyframes`
  0% {
    height: 0%;
  }
  100% {
    height: var(--percentage);
  }
`;

const calculatePercentage = (percentage: number) => css`
  --percentage: ${realPerc(percentage)}%;
`;

export const Design = styled.div<DesignProps>`
  background-color: rgb(6, 6, 6);
  position: relative;
  margin: 20px auto;
  width: 130px;
  height: 220px;
  border: 10px solid rgba(255, 255, 255, 0.8);
  border-radius: 15px;

  ${({ percentage }) => calculatePercentage(percentage)}

  &::before {
    content: "";
    position: absolute;
    bottom: 6px;
    left: 6px;
    width: 98px;
    height: 0%;
    background-color: ${(props) => props.sensorsBatteryBackgroundColor};
    border-radius: 5px;
    animation: ${full} 2s linear forwards;
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
