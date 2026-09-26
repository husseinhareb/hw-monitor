import styled from 'styled-components';

/* ── Page shell ─────────────────────────────────────────────────────────── */

export const Container = styled.div<{ sensorsBackgroundColors: string; sensorsForegroundColor: string }>`
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  background-color: ${p => p.sensorsBackgroundColors};
  color: ${p => p.sensorsForegroundColor};
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
  border-bottom: 1px solid color-mix(in srgb, currentColor 6%, transparent);
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
  border: 1px solid color-mix(in srgb, currentColor 22%, transparent);
  background: rgba(0, 0, 0, 0.28);
  color: inherit;
  padding: 0 10px;
  font-size: 13px;
  outline: none;
  &:focus {
    border-color: color-mix(in srgb, currentColor 42%, transparent);
  }
  &::placeholder {
    opacity: 0.45;
  }
`;

export const ShowHiddenToggle = styled.label<{ $accentColor: string }>`
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
    accent-color: ${p => p.$accentColor};
  }
`;

export const ToolbarButton = styled.button<{ $color?: string }>`
  height: 30px;
  padding: 0 10px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  border: 1px solid color-mix(in srgb, currentColor 18%, transparent);
  background: rgba(0, 0, 0, 0.2);
  color: ${p => p.$color || 'inherit'};
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
  outline: none;
  white-space: nowrap;

  &:hover {
    background: color-mix(in srgb, currentColor 8%, transparent);
    border-color: color-mix(in srgb, currentColor 30%, transparent);
  }
`;

/* ── Multi-column / Masonry layout ──────────────────────────────────────── */

// The scroller and the multi-column box must be separate elements: a
// height-constrained multicol box overflows into extra columns sideways
// instead of growing, so nothing past the viewport could be scrolled to.
export const SensorScroller = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;

  scrollbar-width: thin;
  scrollbar-color: color-mix(in srgb, currentColor 15%, transparent) transparent;
  &::-webkit-scrollbar { width: 7px; }
  &::-webkit-scrollbar-thumb { background: color-mix(in srgb, currentColor 15%, transparent); }
  &::-webkit-scrollbar-track { background: transparent; }
`;

export const SensorGrid = styled.div`
  padding: 16px 20px 20px;
  column-width: 360px;
  column-gap: 14px;
`;

/* ── Card ───────────────────────────────────────────────────────────────── */

export const SensorList = styled.div<{ sensorsBoxesBackgroundColor: string; sensorsBoxesForegroundColor?: string }>`
  display: inline-block;
  width: 100%;
  box-sizing: border-box;
  background-color: ${p => p.sensorsBoxesBackgroundColor};
  color: ${p => p.sensorsBoxesForegroundColor || 'inherit'};
  border: 1px solid color-mix(in srgb, currentColor 7%, transparent);
  padding: 14px 16px 12px;
  break-inside: avoid;
  page-break-inside: avoid;
  margin-bottom: 14px;
`;

export const SensorGroup = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

export const SensorCardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  cursor: pointer;
  user-select: none;
  margin: 0 0 10px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid color-mix(in srgb, currentColor 8%, transparent);
  transition: opacity 0.15s ease;

  &:hover {
    opacity: 0.85;
  }
`;

export const SensorCardTitleGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  flex: 1;
`;

export const SensorName = styled.h3<{ sensorsBoxesTitleForegroundColor: string }>`
  color: ${p => p.sensorsBoxesTitleForegroundColor};
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const SensorBadgeCount = styled.span<{ $color?: string }>`
  font-size: 11px;
  font-weight: 600;
  padding: 1px 7px;
  border-radius: 999px;
  background: color-mix(in srgb, currentColor 8%, transparent);
  border: 1px solid color-mix(in srgb, currentColor 8%, transparent);
  color: ${p => p.$color || 'inherit'};
  opacity: 0.85;
  white-space: nowrap;
  flex-shrink: 0;
`;

export const SensorHeaderActions = styled.div<{ $color?: string }>`
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
  color: ${p => p.$color || 'inherit'};
  opacity: 0.8;
`;

export const SensorCategoryHeader = styled.div<{ sensorsBoxesTitleForegroundColor: string }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: ${p => p.sensorsBoxesTitleForegroundColor};
  opacity: 0.65;
  margin-top: 10px;
  margin-bottom: 2px;
  padding-bottom: 3px;
  border-bottom: 1px dashed color-mix(in srgb, currentColor 8%, transparent);

  &:first-child {
    margin-top: 0;
  }
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
  border-bottom: 1px solid color-mix(in srgb, currentColor 5%, transparent);
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
  border: 1px solid color-mix(in srgb, currentColor 12%, transparent);
  background: ${p => p.$active ? 'color-mix(in srgb, currentColor 13%, transparent)' : 'transparent'};
  color: inherit;
  cursor: pointer;
  padding: 0;
  font-size: 11px;
  transition: background 0.12s;
  outline: none;
  &:hover {
    background: color-mix(in srgb, currentColor 9%, transparent);
  }
`;

export const SensorStatusBadge = styled.span<{ $color: string; $textColor: string }>`
  display: inline-flex;
  align-items: center;
  padding: 1px 5px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  white-space: nowrap;
  flex-shrink: 0;
  color: ${p => p.$textColor};
  background: ${p => p.$color};
`;

/* ── Sensor graph modal ─────────────────────────────────────────────────── */

export const GraphModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
`;

export const GraphModalContent = styled.div<{ $backgroundColor: string; $color: string }>`
  background: ${p => p.$backgroundColor};
  color: ${p => p.$color};
  border: 1px solid color-mix(in srgb, currentColor 10%, transparent);
  width: min(860px, calc(100vw - 40px));
  height: min(500px, calc(100vh - 80px));
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

export const GraphModalHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border-bottom: 1px solid color-mix(in srgb, currentColor 8%, transparent);
  flex-shrink: 0;
`;

export const GraphModalTitle = styled.span<{ $color: string }>`
  color: ${p => p.$color};
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const GraphModalValue = styled.span`
  font-size: 13px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  opacity: 0.7;
  white-space: nowrap;
  flex-shrink: 0;
`;

export const GraphModalClose = styled.button`
  background: transparent;
  border: 1px solid color-mix(in srgb, currentColor 14%, transparent);
  color: inherit;
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
  width: 26px;
  height: 26px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  outline: none;
  flex-shrink: 0;
  &:hover { background: color-mix(in srgb, currentColor 8%, transparent); }
`;

export const GraphModalBody = styled.div`
  flex: 1;
  min-height: 0;
  padding: 14px;
  position: relative;
`;

/* ── Inline editor ──────────────────────────────────────────────────────── */

export const SensorEditor = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: flex-end;
  padding: 10px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid color-mix(in srgb, currentColor 7%, transparent);
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
  border: 1px solid color-mix(in srgb, currentColor 13%, transparent);
  background: rgba(0, 0, 0, 0.25);
  color: inherit;
  padding: 0 8px;
  font-size: 12px;
  outline: none;
  &:focus {
    border-color: color-mix(in srgb, currentColor 30%, transparent);
  }
`;
