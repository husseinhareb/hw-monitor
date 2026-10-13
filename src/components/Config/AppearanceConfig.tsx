import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import useFetchAndSetConfig from "../../utils/useConfigUtils";
import type { ConfigData } from "../../bindings";
import {
  SectionCard,
  SettingRow,
  SettingLabel,
  SettingControl,
  StyledNumberInput,
  type ConfigTheme,
} from "./Styles/style";
import { useConfigNumberDraft, ConfigUpdateTimeRow } from "./ConfigPrimitives";

interface Props { theme: ConfigTheme }

const appearanceKeys = ["ui_font_family", "ui_scale"] as const;
type AppearanceConfigData = Pick<ConfigData, (typeof appearanceKeys)[number]>;

const AppearanceConfig: React.FC<Props> = ({ theme }) => {
  const { t } = useTranslation();
  const { config, updateConfig } = useFetchAndSetConfig<AppearanceConfigData>(
    appearanceKeys,
    "set_appearance_configs",
  );

  const [font, setFont] = useState(config.ui_font_family);
  useEffect(() => setFont(config.ui_font_family), [config.ui_font_family]);
  const commitFont = () => {
    const value = font.trim();
    if (value !== config.ui_font_family) void updateConfig("ui_font_family", value);
  };

  const scale = useConfigNumberDraft(config.ui_scale);
  const commitScale = () => {
    const value = scale.commit();
    if (value == null) return;
    const clamped = Math.min(Math.max(Math.round(value), 50), 300);
    scale.setDraft(String(clamped));
    if (clamped !== config.ui_scale) void updateConfig("ui_scale", clamped);
  };

  return (
    <SectionCard containerBg={theme.containerBg} inputBorder={theme.inputBorder}>
      <SettingRow inputBorder={theme.inputBorder}>
        <SettingLabel textColor={theme.textColor}>{t("appearance_config.font_family")}</SettingLabel>
        <SettingControl>
          <StyledNumberInput
            type="text"
            value={font}
            placeholder="Varela Round"
            onChange={(e) => setFont(e.target.value)}
            onBlur={commitFont}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitFont();
            }}
            inputBg={theme.inputBg}
            inputBorder={theme.inputBorder}
            textColor={theme.textColor}
            style={{ width: 200, textAlign: "start" }}
          />
        </SettingControl>
      </SettingRow>
      <ConfigUpdateTimeRow
        labelKey="appearance_config.ui_scale"
        draft={scale.draft}
        setDraft={scale.setDraft}
        commit={commitScale}
        min={50}
        max={300}
        step={10}
        unit="%"
        theme={theme}
      />
    </SectionCard>
  );
};

export default AppearanceConfig;
