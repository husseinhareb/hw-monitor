import styled from 'styled-components';

export const CPU = styled.nav`
    background-color: #2B2B2B;
    width: 100%;
`;

export const NameContainer = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 0;
`;

export const NameLabel = styled.p`
    color: rgb(255, 255, 255);
    font-size: 40px;
    margin: 5px;
`;

export const NameValue = styled.p`
    color: white;
    margin: 5px;
    font-size: 20px;
`;

export const Label = styled.p`
    color: rgb(255, 255, 255);
    font-size: 20px;
    margin: 5px;
`;

export const Value = styled.p`
    color: #575050;
    margin: 5px;
    font-size: 20px;
`;

export const RealTimeValues = styled.div`
    display: flex;
    flex-direction: column;
    flex: 1;
`;

export const FixedValues = styled.div`
    flex: 1;
    padding: 10px;
    text-align: left;
    border-left: 2px solid white;
`;

export const SpeedUsageContainer = styled.div`
    display: flex;
    justify-content: space-between;
`;

export const SpeedUsageItem = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
`;

export const FixedValueItem = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
`;
