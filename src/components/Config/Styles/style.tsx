import styled from "styled-components";

// ── Shared theme interface ────────────────────────────────────────
export interface ConfigTheme {
  bgColor: string;
  containerBg: string;
  inputBg: string;
  inputBorder: string;
  buttonBg: string;
  buttonFg: string;
  textColor: string;
}

// ── Page layout ───────────────────────────────────────────────────
export const ConfigPage = styled.div<{ bgColor: string }>`
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100%;
  background-color: ${p => p.bgColor};
  overflow: hidden;
`;

export const ConfigSidebar = styled.nav<{ containerBg: string; inputBorder: string }>`
  width: 196px;
  min-width: 196px;
  height: 100%;
  background-color: ${p => p.containerBg};
  border-right: 1px solid ${p => p.inputBorder};
  display: flex;
  flex-direction: column;
  overflow-y: auto;
`;

export const SidebarHeader = styled.div<{ textColor: string; inputBorder: string }>`
  padding: 13px 16px 11px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.13em;
  text-transform: uppercase;
  color: ${p => p.textColor};
  opacity: 0.4;
  border-bottom: 1px solid ${p => p.inputBorder};
`;

export const SidebarItem = styled.div<{
  textColor: string;
  inputBorder: string;
  buttonBg: string;
  isActive: boolean;
}>`
  display: flex;
  align-items: center;
  width: 100%;
  box-sizing: border-box;
  padding: 9px 16px;
  background: ${p => p.isActive ? `${p.buttonBg}1a` : "transparent"};
  border: none;
  border-left: 2px solid ${p => p.isActive ? p.buttonBg : "transparent"};
  color: ${p => p.isActive ? p.buttonBg : p.textColor};
  font-size: 13px;
  text-align: left;
  cursor: pointer;
  opacity: ${p => p.isActive ? 1 : 0.72};
  user-select: none;

  &:hover {
    background: ${p => `${p.buttonBg}14`};
    color: ${p => p.buttonBg};
    opacity: 1;
  }
`;

// ── Content area ──────────────────────────────────────────────────
export const ConfigContent = styled.main<{ bgColor: string }>`
  flex: 1;
  height: 100%;
  overflow-y: auto;
  background-color: ${p => p.bgColor};
  display: flex;
  flex-direction: column;
`;

export const TopBar = styled.div<{ containerBg: string; inputBorder: string }>`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 18px;
  background-color: ${p => p.containerBg};
  border-bottom: 1px solid ${p => p.inputBorder};
  flex-shrink: 0;
`;

export const TopBarTitle = styled.span<{ textColor: string }>`
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: ${p => p.textColor};
  opacity: 0.4;
  margin-right: auto;
`;

export const LangLabel = styled.label<{ textColor: string }>`
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 12px;
  color: ${p => p.textColor};
  white-space: nowrap;
  cursor: default;
`;

export const StyledSelect = styled.select<{
  inputBg: string;
  inputBorder: string;
  textColor: string;
}>`
  background-color: ${p => p.inputBg};
  color: ${p => p.textColor};
  border: 1px solid ${p => p.inputBorder};
  border-radius: 0;
  padding: 3px 6px;
  font-size: 12px;
  cursor: pointer;
  outline: none;
  height: 26px;
  -webkit-appearance: menulist;
  appearance: menulist;

  option {
    background-color: ${p => p.inputBg};
    color: ${p => p.textColor};
    padding: 4px 6px;
  }

  &:focus {
    border-color: ${p => p.textColor}55;
  }
`;

export const ActionButton = styled.button<{
  buttonBg: string;
  buttonFg: string;
}>`
  background-color: ${p => p.buttonBg};
  color: ${p => p.buttonFg};
  border: none;
  padding: 0 14px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  letter-spacing: 0.02em;
  height: 26px;
  white-space: nowrap;

  &:hover {
    filter: brightness(0.9);
  }

  &:active {
    filter: brightness(0.8);
  }
`;

// ── Section ───────────────────────────────────────────────────────
export const SectionWrapper = styled.div`
  padding: 18px 20px 6px;
`;

export const SectionTitle = styled.h2<{ textColor: string; inputBorder: string }>`
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.13em;
  text-transform: uppercase;
  color: ${p => p.textColor};
  opacity: 0.4;
  margin: 0 0 10px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid ${p => p.inputBorder};
`;

export const SectionCard = styled.div<{ containerBg: string; inputBorder: string }>`
  background-color: ${p => p.containerBg};
  border: 1px solid ${p => p.inputBorder};
  margin-bottom: 14px;
  overflow: hidden;
`;

export const SubSectionTitle = styled.div<{ textColor: string; inputBorder: string }>`
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: ${p => p.textColor};
  opacity: 0.38;
  padding: 7px 16px 6px;
  border-top: 1px solid ${p => p.inputBorder}55;
  border-bottom: 1px solid ${p => p.inputBorder}55;
`;

// ── Setting row ───────────────────────────────────────────────────
export const SettingRow = styled.div<{ inputBorder: string }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  min-height: 38px;
  border-bottom: 1px solid ${p => p.inputBorder}40;

  &:last-child {
    border-bottom: none;
  }
`;

export const SettingLabel = styled.span<{ textColor: string }>`
  font-size: 13px;
  color: ${p => p.textColor};
  opacity: 0.88;
  flex: 1;
  user-select: none;
`;

export const SettingControl = styled.div`
  display: flex;
  align-items: center;
  gap: 0;
  flex-shrink: 0;
`;

// ── Number input ──────────────────────────────────────────────────
export const StyledNumberInput = styled.input<{
  inputBg: string;
  inputBorder: string;
  textColor: string;
}>`
  background-color: ${p => p.inputBg};
  color: ${p => p.textColor};
  border: 1px solid ${p => p.inputBorder};
  padding: 3px 8px;
  font-size: 12px;
  width: 72px;
  text-align: right;
  font-family: monospace;
  outline: none;
  height: 26px;

  &:focus {
    border-color: ${p => p.textColor}55;
  }

  &::-webkit-inner-spin-button,
  &::-webkit-outer-spin-button {
    opacity: 0.35;
  }
`;

export const UnitLabel = styled.span<{ textColor: string; inputBorder: string; inputBg: string }>`
  font-size: 11px;
  font-family: monospace;
  color: ${p => p.textColor};
  opacity: 0.5;
  background: ${p => p.inputBg};
  border: 1px solid ${p => p.inputBorder};
  border-left: none;
  padding: 0 6px;
  height: 26px;
  display: flex;
  align-items: center;
`;

// ── Color input ───────────────────────────────────────────────────
export const ColorInputWrapper = styled.label`
  display: flex;
  align-items: center;
  cursor: pointer;
`;

export const StyledColorInput = styled.input`
  width: 26px;
  height: 26px;
  border: none;
  padding: 2px;
  cursor: pointer;
  background: none;
  outline: none;
  flex-shrink: 0;

  &::-webkit-color-swatch-wrapper {
    padding: 0;
  }

  &::-webkit-color-swatch {
    border: none;
  }
`;

export const ColorHex = styled.span<{ textColor: string; inputBorder: string; inputBg: string }>`
  font-size: 11px;
  font-family: monospace;
  color: ${p => p.textColor};
  opacity: 0.7;
  background: ${p => p.inputBg};
  border: 1px solid ${p => p.inputBorder};
  border-left: none;
  padding: 0 7px;
  height: 26px;
  display: flex;
  align-items: center;
  min-width: 66px;
  pointer-events: none;
`;

// ── Checkbox ──────────────────────────────────────────────────────
export const CheckboxGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
  padding: 4px 16px 8px;
`;

export const CheckboxItem = styled.label<{ textColor: string; inputBorder: string }>`
  display: flex;
  align-items: center;
  gap: 9px;
  font-size: 12px;
  color: ${p => p.textColor};
  opacity: 0.82;
  padding: 6px 0;
  cursor: pointer;
  border-bottom: 1px solid ${p => p.inputBorder}28;
  user-select: none;

  &:hover {
    opacity: 1;
  }
`;

export const StyledCheckbox = styled.input<{
  inputBorder: string;
  buttonBg: string;
  buttonFg: string;
}>`
  -webkit-appearance: none;
  appearance: none;
  width: 14px;
  height: 14px;
  min-width: 14px;
  border: 1px solid ${p => p.inputBorder};
  background: transparent;
  cursor: pointer;
  position: relative;
  flex-shrink: 0;

  &:checked {
    background-color: ${p => p.buttonBg};
    border-color: ${p => p.buttonBg};
  }

  &:checked::after {
    content: '✓';
    position: absolute;
    left: 0;
    top: -2px;
    width: 100%;
    text-align: center;
    font-size: 11px;
    color: ${p => p.buttonFg};
  }
`;

export const InlineCheckboxRow = styled.div<{ inputBorder: string }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  min-height: 38px;
  border-bottom: 1px solid ${p => p.inputBorder}40;

  &:last-child {
    border-bottom: none;
  }
`;

export const InlineCheckboxLabel = styled.label<{ textColor: string }>`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: ${p => p.textColor};
  opacity: 0.88;
  cursor: pointer;
  user-select: none;
  flex: 1;
`;
