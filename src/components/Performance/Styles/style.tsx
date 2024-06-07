import styled from 'styled-components';
const Label = styled.p`
color: #6d6d6d;
margin: 5px;
margin-right: 20px;
margin-left: 20px;
flex-shrink: 0;
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
flex-shrink: 0;
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
flex-shrink: 0;
`;

// Common Name Value
export const NameValue = styled.p`
color: white;
margin: 7px;
font-size: 20px;
flex-shrink: 0;
`;

// Common RealTimeValues
export const RealTimeValues = styled.div`
display: flex;
flex-direction: column;
flex: 1;
min-width: 0;
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
flex-wrap: wrap;
`;

export const FixedValues = styled.div`
flex: 1;
padding: 10px;
text-align: left;
border-left: 2px solid white;
min-width: 0;
`;

export const SpeedUsageContainer = styled.div`
display: flex;
justify-content: space-between;
flex-wrap: wrap;
`;

export const SpeedUsageItem = styled.div`
display: flex;
flex-direction: column;
min-width: 0;
`;

export const FixedValueItem = styled.div`
display: flex;
justify-content: space-between;
align-items: center;
min-width: 0;
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
min-width: 0;
`;

// Memory specific fixed values
export const MemoryFixedValues = styled(FixedValues)`
padding: 8px;
min-width: 0;
`;
