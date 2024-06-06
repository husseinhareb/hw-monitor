import styled, { keyframes } from 'styled-components';

interface DesignProps {
    percentage: number;
  }
  
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
  width: 130px;
  height: 220px;
  border: 10px solid rgba(255, 255, 255, 0.8);
  border-radius: 15px;

  &::before {
    content: "";
    position: absolute;
    bottom: 6px;
    left: 6px;
    width: 98px;
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