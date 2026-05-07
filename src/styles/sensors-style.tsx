import styled from 'styled-components';

/* ── Page shell ─────────────────────────────────────────────────────────── */

export const Container = styled.div<{ sensorsBackgroundColors: string }>`
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  background-color: ${p => p.sensorsBackgroundColors};
  overflow: hidden;
`;

/* ── Toolbar: title left, controls right ───────────────────────────────── */

export const SensorToolbar = styled.div<{ sensorsForegroundColor: string }>`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  color: ${p => p.sensorsForegroundColor};
  padding: 14px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
`;

export const Title = styled.h1<{ sensorsForegroundColor: string }>`
  color: ${p => p.sensorsForegroundColor};
  font-size: 17px;
  font-weight: 700;
  margin: 0;
  letter-spacing: 0.04em;
`;

export const SensorControls = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
`;

export const SensorFilterInput = styled.input`
  height: 30px;
  min-width: 180px;
  border: 1px solid rgba(255, 255, 255, 0.22);
  background: rgba(0, 0, 0, 0.28);
  color: inherit;
  padding: 0 10px;
  font-size: 13px;
  outline: none;
  &:focus {
    border-color: rgba(255, 255, 255, 0.42);
  }
  &::placeholder {
    opacity: 0.45;
  }
`;

export const ShowHiddenToggle = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
  opacity: 0.8;
  input {
    width: 14px;
    height: 14px;
    cursor: pointer;
    accent-color: #7bd88f;
  }
`;

/* ── Scrollable grid ────────────────────────────────────────────────────── */

export const SensorGrid = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 16px 20px 20px;

  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 14px;
  align-items: start;
  align-content: start;

  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.15) transparent;
  &::-webkit-scrollbar { width: 7px; }
  &::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.15); }
  &::-webkit-scrollbar-track { background: transparent; }
`;

/* ── Card ───────────────────────────────────────────────────────────────── */

export const SensorList = styled.div<{ sensorsBoxesBackgroundColor: string }>`
  display: flex;
  flex-direction: column;
  background-color: ${p => p.sensorsBoxesBackgroundColor};
  border: 1px solid rgba(255, 255, 255, 0.07);
  padding: 14px 16px 12px;
`;

export const SensorGroup = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

export const SensorName = styled.h3<{ sensorsBoxesTitleForegroundColor: string }>`
  color: ${p => p.sensorsBoxesTitleForegroundColor};
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin: 0 0 10px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
`;

export const ContentDiv = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

/* ── Sensor row ─────────────────────────────────────────────────────────── */

export const SensorItem = styled.div<{ sensorsGroupForegroundColor: string; $isHidden?: boolean }>`
  padding: 6px 0;
  display: flex;
  flex-direction: column;
  gap: 5px;
  color: ${p => p.sensorsGroupForegroundColor};
  opacity: ${p => p.$isHidden ? 0.4 : 1};
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  &:last-child {
    border-bottom: 0;
    padding-bottom: 0;
  }
`;

export const SensorRow = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto auto;
  gap: 8px;
  align-items: center;
`;

export const SensorLabelBlock = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
  gap: 3px;
`;

export const SensorLabel = styled.span`
  font-weight: 600;
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const SensorMeta = styled.span`
  font-size: 11px;
  opacity: 0.5;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const SensorMetaLine = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  min-width: 0;
`;

export const SensorValue = styled.span`
  font-size: 13px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
`;

export const SensorActions = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 4px;
`;

export const SensorIconButton = styled.button<{ $active?: boolean }>`
  width: 26px;
  height: 26px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: ${p => p.$active ? 'rgba(255,255,255,0.13)' : 'transparent'};
  color: inherit;
  cursor: pointer;
  padding: 0;
  font-size: 11px;
  transition: background 0.12s;
  outline: none;
  &:hover {
    background: rgba(255, 255, 255, 0.09);
  }
`;

export const SensorStatusBadge = styled.span<{ $status: 'normal' | 'warning' | 'critical' }>`
  display: inline-flex;
  align-items: center;
  padding: 1px 5px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  white-space: nowrap;
  flex-shrink: 0;
  color: ${p => p.$status === 'critical' ? '#fff' : '#111'};
  background: ${p => {
    if (p.$status === 'critical') return '#d64545';
    if (p.$status === 'warning') return '#f0c04a';
    return '#7bd88f';
  }};
`;

/* ── Inline editor ──────────────────────────────────────────────────────── */

export const SensorEditor = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: flex-end;
  padding: 10px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.07);
  margin-top: 2px;
`;

export const SensorEditorField = styled.label`
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 100px;
  font-size: 11px;
  opacity: 0.8;
`;

export const SensorEditorInput = styled.input`
  width: 100%;
  min-width: 0;
  height: 27px;
  border: 1px solid rgba(255, 255, 255, 0.13);
  background: rgba(0, 0, 0, 0.25);
  color: inherit;
  padding: 0 8px;
  font-size: 12px;
  outline: none;
  &:focus {
    border-color: rgba(255, 255, 255, 0.3);
  }
`;
