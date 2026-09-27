import styled from 'styled-components';

const Label = styled.p<{ performanceLabelColor: string; }>`
color: ${(props) => props.performanceLabelColor};
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

export const TitleLabel = styled(Label)`
font-size: 20px;
`;

// Common Value Style
const Value = styled.p<{ performanceValueColor: string; }>`
color: ${(props) => props.performanceValueColor};
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
export const NameLabel = styled.p<{ performanceTitleColor: string }>`
color: ${(props) => props.performanceTitleColor};
font-size: 30px;
margin: 7px;
flex-shrink: 0;
`;

// Common Name Value
export const NameValue = styled.p<{ performanceTitleColor: string }>`
color: ${(props) => props.performanceTitleColor};
margin: 7px;
margin-left: auto;
font-size: 16px;
flex-shrink: 0;
text-align: right;
`;

// Common RealTimeValues
// Both stat panels keep a 340px basis so a narrow window stacks them instead of squeezing both
export const RealTimeValues = styled.div`
display: flex;
flex-direction: column;
flex: 1 1 340px;
min-width: 0;
container-type: inline-size;
`;

// CPU Specific Styles
export const CPU = styled.div<{ performanceBackgroundColor: string }>`
background-color: ${(props) => props.performanceBackgroundColor};
width: 100%;
height: 100%;
padding: 10px;
box-sizing: border-box;
display: flex;
flex-direction: column;
`;


export const NameContainer = styled.div`
display: flex;
align-items: center;
gap: 12px;
padding: 6px 0;
flex-wrap: wrap;
flex-shrink: 0;
`;

export const FixedValues = styled.div<{ performanceLabelColor: string }>`
flex: 1 1 340px;
text-align: left;
border-left: 2px solid ${(props) => props.performanceLabelColor};
min-width: 0;
`;

export const SpeedUsageContainer = styled.div`
display: grid;
grid-template-columns: repeat(3, minmax(0, 1fr));
gap: 0 16px;
padding: 0 20px;

/* Grid gap and padding already space the cells; values never wrap mid-unit ("2.75 / GHz") */
& p {
    margin-left: 0;
    margin-right: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

@container (max-width: 400px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
}
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
export const MemoryContainer = styled.div<{ performanceBackgroundColor: string }>`
background-color: ${(props) => props.performanceBackgroundColor};
width: 100%;
height: 100%;
padding: 10px;
box-sizing: border-box;
display: flex;
flex-direction: column;
`;

export const MemoryTypes = styled.div<{ performanceValueColor: string; }>`
color: ${(props) => props.performanceValueColor};
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

// Memory composition bar (mirrors the Windows Task Manager "memory composition" strip)
export const CompositionSection = styled.div`
display: flex;
flex-direction: column;
gap: 6px;
padding: 4px 20px 0;
flex-shrink: 0;
min-width: 0;
`;

export const CompositionTitle = styled.span<{ performanceLabelColor: string; }>`
color: ${(props) => props.performanceLabelColor};
font-size: 13px;
`;

export const CompositionBar = styled.div<{ performanceLabelColor: string; }>`
display: flex;
width: 100%;
height: 22px;
border: 1px solid ${(props) => props.performanceLabelColor};
box-sizing: border-box;
overflow: hidden;
`;

export const CompositionSegment = styled.div<{ widthPercent: number; fillColor: string; separatorColor: string; }>`
width: ${(props) => props.widthPercent}%;
height: 100%;
background-color: ${(props) => props.fillColor};
border-right: 1px solid ${(props) => props.separatorColor};
transition: width 0.3s ease;
min-width: 0;
&:last-child {
  border-right: none;
}
`;

export const CompositionLegend = styled.div`
display: flex;
flex-wrap: wrap;
gap: 4px 24px;
font-size: 13px;
`;

export const CompositionLegendItem = styled.span<{ performanceLabelColor: string; performanceValueColor: string; }>`
display: inline-flex;
align-items: center;
gap: 6px;
color: ${(props) => props.performanceLabelColor};
b {
  font-weight: 400;
  color: ${(props) => props.performanceValueColor};
}
`;

export const CompositionSwatch = styled.span<{ fillColor: string; borderColor: string; }>`
width: 10px;
height: 10px;
background-color: ${(props) => props.fillColor};
border: 1px solid ${(props) => props.borderColor};
`;

export const NetworkInfoGrid = styled.div`
display: grid;
grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
gap: 8px 18px;
width: 100%;
margin-top: 12px;
padding: 0 10px;
box-sizing: border-box;
flex-shrink: 0;
`;

export const NetworkInfoItem = styled.div`
display: flex;
justify-content: space-between;
gap: 12px;
min-width: 0;
`;

export const NetworkInfoLabel = styled.span<{ performanceLabelColor: string; }>`
color: ${(props) => props.performanceLabelColor};
font-size: 13px;
min-width: 0;
`;

export const NetworkInfoValue = styled.span<{ performanceValueColor: string; }>`
color: ${(props) => props.performanceValueColor};
font-size: 14px;
text-align: right;
overflow: hidden;
text-overflow: ellipsis;
white-space: nowrap;
`;
