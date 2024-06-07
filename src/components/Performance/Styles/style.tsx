import styled from 'styled-components';

// Common Label Style
const Label = styled.p`
    color: #6d6d6d;
    margin: 5px;
    margin-right: 20px;
    margin-left: 20px;
`;

export const RightLabel = styled(Label)`
    font-size: 18px;
`;

export const LeftLabel = styled(Label)`
    font-size: 14px;
`;

// Common Value Style
const Value = styled.p`
    color: white;
    margin: 5px;
    margin-left: 20px;
    margin-right: 20px;
`;

export const RightValue = styled(Value)`
    font-size: 18px;
`;

export const LeftValue = styled(Value)`
    font-size: 20px;
`;

// Common Name Label
export const NameLabel = styled.p`
    color: rgb(255, 255, 255);
    font-size: 40px;
    margin: 7px;
`;

// Common Name Value
export const NameValue = styled.p`
    color: white;
    margin: 7px;
    font-size: 20px;
`;

// Common RealTimeValues
export const RealTimeValues = styled.div`
    display: flex;
    flex-direction: column;
    flex: 1;
`;

// CPU Specific Styles
export const CPU = styled.div`
    background-color: #2B2B2B;
    width: 100%;
`;

export const NameContainer = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 0;
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
`;

export const FixedValueItem = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

// Memory Specific Styles
export const MemoryContainer = styled.div<{ hidden: boolean }>`
    background-color: #2B2B2B;
    width: 100%;
`;

export const MemoryTypes = styled.div`
    color: white;
    margin: 7px;
    font-size: 24px;
    display: flex;
    align-items: center;
`;

// Memory specific fixed values
export const MemoryFixedValues = styled(FixedValues)`
    padding: 8px;
`;
