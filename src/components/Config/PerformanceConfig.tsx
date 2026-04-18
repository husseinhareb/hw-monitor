import React, { useEffect, useState } from "react";
import usePerformanceConfig from "../../hooks/Performance/usePerformanceConfig";
import { useTranslation } from "react-i18next";
import {
  SectionCard,
  SubSectionTitle,
  SettingRow,
  SettingLabel,
  SettingControl,
  StyledNumberInput,
  UnitLabel,
  ColorInputWrapper,
  StyledColorInput,
  ColorHex,
  InlineCheckboxRow,
  InlineCheckboxLabel,
  StyledCheckbox,
  type ConfigTheme,
} from "./Styles/style";

interface PerformanceConfig {
  performance_update_time: number;
  performance_sidebar_background_color: string;
  performance_sidebar_color: string;
  performance_sidebar_selected_color: string;
  performance_background_color: string;
  performance_title_color: string;
  performance_label_color: string;
  performance_value_color: string;
  performance_graph_color: string;
  performance_sec_graph_color: string;
  show_virtual_interfaces: boolean;
  performance_scrollbar_color: string;
}

interface Props { theme: ConfigTheme }

const PerformanceConfig: React.FC<Props> = ({ theme }) => {
  const { config, updateConfig } = usePerformanceConfig();
  const [updateTimeDraft, setUpdateTimeDraft] = useState("");
  const { t } = useTranslation();

  useEffect(() => {
    setUpdateTimeDraft(String(config.performance_update_time));
  }, [config.performance_update_time]);

  const handleConfigChange = (key: keyof PerformanceConfig, value: string | number | boolean) => {
    if (config) updateConfig(key, value);
  };

  const commitUpdateTime = () => {
    const value = Number(updateTimeDraft);
    if (Number.isFinite(value) && value >= 1000 && value !== config.performance_update_time) {
      void handleConfigChange("performance_update_time", value);
      return;
    }

    setUpdateTimeDraft(String(config.performance_update_time));
  };

  const colorRow = (labelKey: string, field: keyof PerformanceConfig) => (
    <SettingRow inputBorder={theme.inputBorder}>
      <SettingLabel textColor={theme.textColor}>{t(labelKey)}</SettingLabel>
      <SettingControl>
        <ColorInputWrapper>
          <StyledColorInput
            type="color"
            value={config[field] as string}
            onChange={e => handleConfigChange(field, e.target.value)}
          />
          <ColorHex textColor={theme.textColor} inputBorder={theme.inputBorder} inputBg={theme.inputBg}>
            {config[field] as string}
          </ColorHex>
        </ColorInputWrapper>
      </SettingControl>
    </SettingRow>
  );

  return (
    <SectionCard containerBg={theme.containerBg} inputBorder={theme.inputBorder}>
      <SettingRow inputBorder={theme.inputBorder}>
        <SettingLabel textColor={theme.textColor}>{t("performance_config.update_time")}</SettingLabel>
        <SettingControl>
          <StyledNumberInput
            type="number"
            value={updateTimeDraft}
            min={1000}
            step={100}
            onChange={(e) => setUpdateTimeDraft(e.target.value)}
            onBlur={commitUpdateTime}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                commitUpdateTime();
              }
            }}
            inputBg={theme.inputBg}
            inputBorder={theme.inputBorder}
            textColor={theme.textColor}
          />
          <UnitLabel textColor={theme.textColor} inputBorder={theme.inputBorder} inputBg={theme.inputBg}>ms</UnitLabel>
        </SettingControl>
      </SettingRow>

      <SubSectionTitle textColor={theme.textColor} inputBorder={theme.inputBorder}>
        {t("performance_config.sidebar")}
      </SubSectionTitle>

      {colorRow("performance_config.sidebar_background_color", "performance_sidebar_background_color")}
      {colorRow("performance_config.sidebar_color",            "performance_sidebar_color")}
      {colorRow("performance_config.sidebar_selected_color",   "performance_sidebar_selected_color")}

      <SubSectionTitle textColor={theme.textColor} inputBorder={theme.inputBorder}>
        {t("performance_config.content")}
      </SubSectionTitle>

      {colorRow("performance_config.background_color", "performance_background_color")}
      {colorRow("performance_config.title_color",      "performance_title_color")}
      {colorRow("performance_config.label_color",      "performance_label_color")}
      {colorRow("performance_config.value_color",      "performance_value_color")}
      {colorRow("performance_config.graph_color",      "performance_graph_color")}
      {colorRow("performance_config.sec_graph_color",  "performance_sec_graph_color")}
      {colorRow("performance_config.scrollbar_color",  "performance_scrollbar_color")}

      <SubSectionTitle textColor={theme.textColor} inputBorder={theme.inputBorder}>
        {t("performance_config.network")}
      </SubSectionTitle>

      <InlineCheckboxRow inputBorder={theme.inputBorder}>
        <InlineCheckboxLabel textColor={theme.textColor}>
          <StyledCheckbox
            type="checkbox"
            checked={config.show_virtual_interfaces}
            onChange={() => handleConfigChange("show_virtual_interfaces", !config.show_virtual_interfaces)}
            inputBorder={theme.inputBorder}
            buttonBg={theme.buttonBg}
            buttonFg={theme.buttonFg}
          />
          {t("performance_config.show_virtual_interfaces")}
        </InlineCheckboxLabel>
      </InlineCheckboxRow>
    </SectionCard>
  );
};

export default PerformanceConfig;
