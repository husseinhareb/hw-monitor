// battery-style.tsx
import styled, { keyframes, css } from 'styled-components';

interface DesignProps {
    percentage: number;
    sensorsBatteryBackgroundColor: string;
    sensorsBatteryFrameColor: string;
    sensorsBatteryCaseColor: string;
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
`;

export const BatteryContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 24px;
  width: 100%;
  align-items: center;

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
`;

export const ContentDiv = styled.div`
  flex: 1 1 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
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
  background-color: ${(props) => props.sensorsBatteryCaseColor};
  position: relative;
  margin: 10px 0;
  width: 130px;
  height: 220px;
  border: 10px solid ${(props) => props.sensorsBatteryFrameColor + "CC"};

  ${({ percentage }) => calculatePercentage(percentage)}

  &::before {
    content: "";
    position: absolute;
    bottom: 6px;
    left: 6px;
    width: 98px;
    height: 0%;
    background-color: ${(props) => props.sensorsBatteryBackgroundColor};
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
    background-color: ${(props) => props.sensorsBatteryFrameColor + "CC"};
  }
`;
