import React from "react";
import useConfigPanelConfig from "../../hooks/Config/useConfigPanelConfig";
import { useTranslation } from "react-i18next";
import {
  SectionCard,
  SubSectionTitle,
  type ConfigTheme,
} from "./Styles/style";
import { ConfigColorRow } from "./ConfigPrimitives";

interface Props { theme: ConfigTheme }

const ConfigPanelConfigSection: React.FC<Props> = ({ theme }) => {
  const { config, updateConfig } = useConfigPanelConfig();
  const { t } = useTranslation();

  const handleConfigChange = (key: keyof typeof config, value: string) => {
    if (config) updateConfig(key, value);
  };

  return (
    <SectionCard containerBg={theme.containerBg} inputBorder={theme.inputBorder}>
      <SubSectionTitle textColor={theme.textColor} inputBorder={theme.inputBorder}>
        {t("config.colors")}
      </SubSectionTitle>

      <ConfigColorRow labelKey="config_panel_config.background_color"           value={config.config_background_color}           onChange={v => handleConfigChange("config_background_color", v)}           theme={theme} />
      <ConfigColorRow labelKey="config_panel_config.container_background_color" value={config.config_container_background_color} onChange={v => handleConfigChange("config_container_background_color", v)} theme={theme} />
      <ConfigColorRow labelKey="config_panel_config.text_color"                 value={config.config_text_color}                 onChange={v => handleConfigChange("config_text_color", v)}                 theme={theme} />
      <ConfigColorRow labelKey="config_panel_config.toast_error_color" value={config.config_toast_error_color} onChange={v => handleConfigChange("config_toast_error_color", v)} theme={theme} />
      <ConfigColorRow labelKey="config_panel_config.toast_warning_color" value={config.config_toast_warning_color} onChange={v => handleConfigChange("config_toast_warning_color", v)} theme={theme} />
      <ConfigColorRow labelKey="config_panel_config.toast_info_color" value={config.config_toast_info_color} onChange={v => handleConfigChange("config_toast_info_color", v)} theme={theme} />

      <SubSectionTitle textColor={theme.textColor} inputBorder={theme.inputBorder}>
        {t("config.inputs_controls")}
      </SubSectionTitle>

      <ConfigColorRow labelKey="config_panel_config.input_background_color" value={config.config_input_background_color} onChange={v => handleConfigChange("config_input_background_color", v)} theme={theme} />
      <ConfigColorRow labelKey="config_panel_config.input_border_color"     value={config.config_input_border_color}     onChange={v => handleConfigChange("config_input_border_color", v)}     theme={theme} />
      <ConfigColorRow labelKey="config_panel_config.button_background_color" value={config.config_button_background_color} onChange={v => handleConfigChange("config_button_background_color", v)} theme={theme} />
      <ConfigColorRow labelKey="config_panel_config.button_foreground_color" value={config.config_button_foreground_color} onChange={v => handleConfigChange("config_button_foreground_color", v)} theme={theme} />
    </SectionCard>
  );
};

export default ConfigPanelConfigSection;
