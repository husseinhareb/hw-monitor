import styled from 'styled-components';

export const Container = styled.div<{ sensorsBackgroundColors: string; }>`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  padding: 20px;
  background-color: ${(props) => props.sensorsBackgroundColors};
`;

export const Title = styled.h1<{ sensorsForegroundColor: string; }>`
  text-align: center;
  color: ${(props) => props.sensorsForegroundColor};
  margin-bottom: 10px;
`;

export const SensorGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 20px;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
`;

export const SensorList = styled.div<{ sensorsBoxesBackgroundColor: string; }>`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;
  background-color: ${(props) => props.sensorsBoxesBackgroundColor};
  padding: 20px;
  min-height: 100px;
`;

export const SensorGroup = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  width: 100%;
`;

export const SensorToolbar = styled.div<{ sensorsForegroundColor: string; }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  color: ${(props) => props.sensorsForegroundColor};
  margin-bottom: 14px;
`;

export const SensorFilterInput = styled.input`
  width: min(320px, 100%);
  height: 34px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: rgba(0, 0, 0, 0.16);
  color: inherit;
  padding: 0 10px;
  font-size: 14px;
`;

export const ShowHiddenToggle = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  cursor: pointer;
  user-select: none;

  input {
    width: 16px;
    height: 16px;
  }
`;

export const SensorItem = styled.div<{ sensorsGroupForegroundColor: string; $isHidden?: boolean; }>`
  margin: 0;
  padding: 8px 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  color: ${(props) => props.sensorsGroupForegroundColor};
  opacity: ${(props) => props.$isHidden ? 0.55 : 1};
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);

  &:last-child {
    border-bottom: 0;
  }
`;

export const SensorName = styled.h3<{ sensorsBoxesTitleForegroundColor: string; }>`
  color: ${(props) => props.sensorsBoxesTitleForegroundColor};
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
`;

export const ContentDiv = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

export const SensorRow = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto auto;
  gap: 10px;
  align-items: center;
  width: 100%;
`;

export const SensorLabelBlock = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
  gap: 3px;
`;

export const SensorLabel = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 600;
`;

export const SensorMeta = styled.span`
  opacity: 0.68;
  font-size: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const SensorMetaLine = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
`;

export const SensorValue = styled.span`
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  font-weight: 600;
`;

export const SensorActions = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
`;

export const SensorIconButton = styled.button<{ $active?: boolean; }>`
  width: 30px;
  height: 30px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: ${(props) => props.$active ? 'rgba(255, 255, 255, 0.18)' : 'rgba(255, 255, 255, 0.08)'};
  color: inherit;
  cursor: pointer;
  padding: 0;

  &:hover {
    background: rgba(255, 255, 255, 0.16);
  }
`;

export const SensorStatusBadge = styled.span<{ $status: 'normal' | 'warning' | 'critical'; }>`
  justify-self: start;
  display: inline-flex;
  align-items: center;
  min-height: 20px;
  padding: 2px 7px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  color: ${(props) => props.$status === 'critical' ? '#ffffff' : '#111111'};
  background: ${(props) => {
    if (props.$status === 'critical') return '#d64545';
    if (props.$status === 'warning') return '#f0c04a';
    return '#7bd88f';
  }};
`;

export const SensorEditor = styled.div`
  display: grid;
  grid-template-columns: minmax(120px, 1.4fr) minmax(90px, 1fr) minmax(90px, 1fr) auto;
  gap: 8px;
  align-items: end;
  padding: 10px;
  background: rgba(0, 0, 0, 0.14);
  border: 1px solid rgba(255, 255, 255, 0.10);

  @media (max-width: 520px) {
    grid-template-columns: 1fr;
  }
`;

export const SensorEditorField = styled.label`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
  font-size: 12px;
`;

export const SensorEditorInput = styled.input`
  width: 100%;
  min-width: 0;
  height: 30px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: rgba(0, 0, 0, 0.18);
  color: inherit;
  padding: 0 8px;
  font-size: 13px;
`;
