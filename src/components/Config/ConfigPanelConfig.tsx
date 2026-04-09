import React from "react";
import useConfigPanelConfig from "../../hooks/Config/useConfigPanelConfig";
import { useTranslation } from "react-i18next";
import {
  SectionCard,
  SubSectionTitle,
  SettingRow,
  SettingLabel,
  SettingControl,
  ColorInputWrapper,
  StyledColorInput,
  ColorHex,
  type ConfigTheme,
} from "./Styles/style";

interface ConfigPanelConfig {
  config_background_color: string;
  config_container_background_color: string;
  config_input_background_color: string;
  config_input_border_color: string;
  config_button_background_color: string;
  config_button_foreground_color: string;
  config_text_color: string;
}

interface Props { theme: ConfigTheme }

const ConfigPanelConfigSection: React.FC<Props> = ({ theme }) => {
  const { config, updateConfig } = useConfigPanelConfig();
  const { t } = useTranslation();

  const handleConfigChange = (key: keyof ConfigPanelConfig, value: string) => {
    if (config) updateConfig(key, value);
  };

  const colorRow = (labelKey: string, field: keyof ConfigPanelConfig) => (
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
      <SubSectionTitle textColor={theme.textColor} inputBorder={theme.inputBorder}>
        {t("config_panel_config.title")}
      </SubSectionTitle>

      {colorRow("config_panel_config.background_color",           "config_background_color")}
      {colorRow("config_panel_config.container_background_color", "config_container_background_color")}
      {colorRow("config_panel_config.text_color",                 "config_text_color")}

      <SubSectionTitle textColor={theme.textColor} inputBorder={theme.inputBorder}>
        Inputs &amp; Controls
      </SubSectionTitle>

      {colorRow("config_panel_config.input_background_color", "config_input_background_color")}
      {colorRow("config_panel_config.input_border_color",     "config_input_border_color")}
      {colorRow("config_panel_config.button_background_color","config_button_background_color")}
      {colorRow("config_panel_config.button_foreground_color","config_button_foreground_color")}
    </SectionCard>
  );
};

export default ConfigPanelConfigSection;
