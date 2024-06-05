import styled, { keyframes } from 'styled-components';

interface DesignProps {
  percentage: number;
}

export const BatteryItem = styled.p`
  color: white;
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

const animate = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

export const Design = styled.div<DesignProps>`
  position: relative;
  width: 100%;
  height: 100%;
  background: #38e740;
  box-shadow: inset 0 0 50px rgba(0, 0, 0, 0.5);

  &::before {
    content: "";
    position: absolute;
    bottom: 6px;  
    left: 6px;
    width: calc(100% - 12px);
    height: 0%;
    background-color: #38e740;
    border-radius: 5px;
    animation: ${full} 2s linear forwards;
    --percentage: ${({ percentage }) => `${percentage}%`};
  }

  &::after {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    width: 120%;
    height: 120%;
    transform: translate(-50%, -50%);
    background: rgba(0, 0, 0, 0.2);
    border-radius: 50%;
    animation: ${animate} 10s linear infinite;
  }
`;

export const Frame = styled.div`
  position: relative;
  width: 130px;
  height: 220px;
  border: 10px solid rgba(255, 255, 255, 0.8);
  border-radius: 15px;
  overflow: hidden;
`;
