import styled from "styled-components";

export const MemoryContainer = styled.div<{ hidden: boolean }>`
    background-color: #2B2B2B;
    width: 100%;
`;

export const FixedValues = styled.div`
    flex: 1;
    padding: 8px;
    text-align: left;
        border-left: 2px solid white;

`;

export const MemoryTypes = styled.div`
    color: white;
    margin: 7px;
    font-size: 24px;
    display: flex;
    align-items: center;
`;
export const NameValue = styled.p`
    color: white;
    margin: 7px;
    font-size: 20px;
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

//Label Style
const Label = styled.p`
    color: #6d6d6d;
    margin: 5px;
    margin-right:20px;
    margin-left:20px;
`;

export const RightLabel = styled(Label)`
    font-size:18px;
`;

export const LeftLabel = styled(Label)`
    font-size:18px;
`;
//Value Style
const Value = styled.p`
    color: white;
    margin: 5px;
    margin-left:20px;
    margin-right:20px;

`;

export const RightValue = styled(Value)`
    font-size: 18px;
`;
export const LeftValue = styled(Value)`
    font-size: 18px;
`;

export const NameLabel = styled.p`
    color: rgb(255, 255, 255);
    font-size: 40px;
    margin: 7px;
`;

export const RealTimeValues = styled.div`
    display: flex;
    flex-direction: column;
    flex: 1;
`;