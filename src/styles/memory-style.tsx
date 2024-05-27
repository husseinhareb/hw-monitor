import styled from "styled-components";

export const MemoryContainer = styled.div<{ hidden: boolean }>`
    background-color: #2B2B2B;
    width: 100%;
`;

export const MemoryInfo = styled.div`
    margin-top: 20px;
`;

export const MemoryInfoItem = styled.p`
    color: rgb(255, 255, 255);
    margin: 5px;
    margin-right:20px;
    margin-left:20px;
`;
