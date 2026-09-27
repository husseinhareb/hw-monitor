import React, { useState, useEffect, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  SettingRow,
  SettingLabel,
  SettingControl,
  StyledNumberInput,
  UnitLabel,
  ColorInputWrapper,
  StyledColorInput,
  ColorHex,
  type ConfigTheme,
} from "./Styles/style";

// ── Color-row component (deduplicated from all 10 config sections) ───
interface ConfigColorRowProps {
  labelKey: string;
  value: string;
  onChange: (value: string) => void;
  theme: ConfigTheme;
}

// A color input fires on every drag movement and each save rewrites the config file,
// so the swatch follows the drag live and the value is saved once the drag pauses.
const COLOR_SAVE_DELAY_MS = 250;

export const ConfigColorRow: React.FC<ConfigColorRowProps> = ({
  labelKey,
  value,
  onChange,
  theme,
}) => {
  const { t } = useTranslation();
  const [draft, setDraft] = useState(value);
  const pending = useRef<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // Follow outside changes (theme, reset) unless an edit is still waiting to be saved
  useEffect(() => {
    if (pending.current === null) setDraft(value);
  }, [value]);

  const flush = useCallback(() => {
    clearTimeout(timer.current);
    if (pending.current === null) return;
    const next = pending.current;
    pending.current = null;
    onChangeRef.current(next);
  }, []);

  // Save a pending edit when the row goes away (section switch mid-drag)
  useEffect(() => flush, [flush]);

  const handleChange = (next: string) => {
    setDraft(next);
    pending.current = next;
    clearTimeout(timer.current);
    timer.current = setTimeout(flush, COLOR_SAVE_DELAY_MS);
  };

  return (
    <SettingRow inputBorder={theme.inputBorder}>
      <SettingLabel textColor={theme.textColor}>{t(labelKey)}</SettingLabel>
      <SettingControl>
        <ColorInputWrapper>
          <StyledColorInput
            type="color"
            value={draft}
            onChange={(e) => handleChange(e.target.value)}
          />
          <ColorHex
            textColor={theme.textColor}
            inputBorder={theme.inputBorder}
            inputBg={theme.inputBg}
          >
            {draft}
          </ColorHex>
        </ColorInputWrapper>
      </SettingControl>
    </SettingRow>
  );
};

// ── Number-draft hook (deduplicated from 7 config sections) ──────────
export function useConfigNumberDraft(
  currentValue: number | undefined,
): {
  draft: string;
  setDraft: React.Dispatch<React.SetStateAction<string>>;
  /** Returns the parsed number if valid, otherwise null. */
  commit: () => number | null;
} {
  const [draft, setDraft] = useState("");

  useEffect(() => {
    if (currentValue != null) {
      setDraft(String(currentValue));
    }
  }, [currentValue]);

  const commit = useCallback((): number | null => {
    const value = Number(draft);
    if (Number.isFinite(value)) {
      return value;
    }
    // Revert draft to upstream value on invalid input
    if (currentValue != null) {
      setDraft(String(currentValue));
    }
    return null;
  }, [draft, currentValue]);

  return { draft, setDraft, commit };
}

// ── Update-time row (deduplicated from 7 config sections) ────────────
interface ConfigUpdateTimeRowProps {
  labelKey: string;
  draft: string;
  setDraft: React.Dispatch<React.SetStateAction<string>>;
  commit: () => void;
  min?: number;
  step?: number;
  theme: ConfigTheme;
}

export const ConfigUpdateTimeRow: React.FC<ConfigUpdateTimeRowProps> = ({
  labelKey,
  draft,
  setDraft,
  commit,
  min = 1000,
  step = 100,
  theme,
}) => {
  const { t } = useTranslation();
  return (
    <SettingRow inputBorder={theme.inputBorder}>
      <SettingLabel textColor={theme.textColor}>{t(labelKey)}</SettingLabel>
      <SettingControl>
        <StyledNumberInput
          type="number"
          value={draft}
          min={min}
          step={step}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              commit();
            }
          }}
          inputBg={theme.inputBg}
          inputBorder={theme.inputBorder}
          textColor={theme.textColor}
        />
        <UnitLabel
          textColor={theme.textColor}
          inputBorder={theme.inputBorder}
          inputBg={theme.inputBg}
        >
          ms
        </UnitLabel>
      </SettingControl>
    </SettingRow>
  );
};
