import React from "react";
import useHeatbarConfig from "../../hooks/Sensors/useHeatbarConfig";
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

interface HeatbarConfig {
  heatbar_color_one: string;
  heatbar_color_two: string;
  heatbar_color_three: string;
  heatbar_color_four: string;
  heatbar_color_five: string;
  heatbar_color_six: string;
  heatbar_color_seven: string;
  heatbar_color_eight: string;
  heatbar_color_nine: string;
  heatbar_color_ten: string;
  heatbar_background_color: string;
}

interface Props { theme: ConfigTheme }

const HeatbarConfig: React.FC<Props> = ({ theme }) => {
  const { config, updateConfig } = useHeatbarConfig();
  const { t } = useTranslation();

  const handleConfigChange = (key: keyof HeatbarConfig, value: string) => {
    if (config) updateConfig(key, value);
  };

  const colorRow = (labelKey: string, field: keyof HeatbarConfig) => (
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
        {t("heatbar_config.title")}
      </SubSectionTitle>

      {colorRow("heatbar_config.color_one",   "heatbar_color_one")}
      {colorRow("heatbar_config.color_two",   "heatbar_color_two")}
      {colorRow("heatbar_config.color_three", "heatbar_color_three")}
      {colorRow("heatbar_config.color_four",  "heatbar_color_four")}
      {colorRow("heatbar_config.color_five",  "heatbar_color_five")}
      {colorRow("heatbar_config.color_six",   "heatbar_color_six")}
      {colorRow("heatbar_config.color_seven", "heatbar_color_seven")}
      {colorRow("heatbar_config.color_eight", "heatbar_color_eight")}
      {colorRow("heatbar_config.color_nine",  "heatbar_color_nine")}
      {colorRow("heatbar_config.color_ten",   "heatbar_color_ten")}

      <SubSectionTitle textColor={theme.textColor} inputBorder={theme.inputBorder}>
        {t("sensors.title")}
      </SubSectionTitle>

      {colorRow("heatbar_config.background_color", "heatbar_background_color")}
    </SectionCard>
  );
};

export default HeatbarConfig;
