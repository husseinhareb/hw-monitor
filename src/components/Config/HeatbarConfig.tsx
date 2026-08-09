import React from "react";
import useHeatbarConfig from "../../hooks/Sensors/useHeatbarConfig";
import { useTranslation } from "react-i18next";
import {
  SectionCard,
  SubSectionTitle,
  type ConfigTheme,
} from "./Styles/style";
import { ConfigColorRow } from "./ConfigPrimitives";

interface Props { theme: ConfigTheme }

const HeatbarConfig: React.FC<Props> = ({ theme }) => {
  const { config, updateConfig } = useHeatbarConfig();
  const { t } = useTranslation();

  const handleConfigChange = (key: keyof typeof config, value: string) => {
    if (config) updateConfig(key, value);
  };

  return (
    <SectionCard containerBg={theme.containerBg} inputBorder={theme.inputBorder}>
      <SubSectionTitle textColor={theme.textColor} inputBorder={theme.inputBorder}>
        {t("heatbar_config.title")}
      </SubSectionTitle>

      <ConfigColorRow labelKey="heatbar_config.color_one"   value={config.heatbar_color_one}   onChange={v => handleConfigChange("heatbar_color_one", v)}   theme={theme} />
      <ConfigColorRow labelKey="heatbar_config.color_two"   value={config.heatbar_color_two}   onChange={v => handleConfigChange("heatbar_color_two", v)}   theme={theme} />
      <ConfigColorRow labelKey="heatbar_config.color_three" value={config.heatbar_color_three} onChange={v => handleConfigChange("heatbar_color_three", v)} theme={theme} />
      <ConfigColorRow labelKey="heatbar_config.color_four"  value={config.heatbar_color_four}  onChange={v => handleConfigChange("heatbar_color_four", v)}  theme={theme} />
      <ConfigColorRow labelKey="heatbar_config.color_five"  value={config.heatbar_color_five}  onChange={v => handleConfigChange("heatbar_color_five", v)}  theme={theme} />
      <ConfigColorRow labelKey="heatbar_config.color_six"   value={config.heatbar_color_six}   onChange={v => handleConfigChange("heatbar_color_six", v)}   theme={theme} />
      <ConfigColorRow labelKey="heatbar_config.color_seven" value={config.heatbar_color_seven} onChange={v => handleConfigChange("heatbar_color_seven", v)} theme={theme} />
      <ConfigColorRow labelKey="heatbar_config.color_eight" value={config.heatbar_color_eight} onChange={v => handleConfigChange("heatbar_color_eight", v)} theme={theme} />
      <ConfigColorRow labelKey="heatbar_config.color_nine"  value={config.heatbar_color_nine}  onChange={v => handleConfigChange("heatbar_color_nine", v)}  theme={theme} />
      <ConfigColorRow labelKey="heatbar_config.color_ten"   value={config.heatbar_color_ten}   onChange={v => handleConfigChange("heatbar_color_ten", v)}   theme={theme} />

      <SubSectionTitle textColor={theme.textColor} inputBorder={theme.inputBorder}>
        {t("sensors.title")}
      </SubSectionTitle>

      <ConfigColorRow labelKey="heatbar_config.background_color" value={config.heatbar_background_color} onChange={v => handleConfigChange("heatbar_background_color", v)} theme={theme} />
    </SectionCard>
  );
};

export default HeatbarConfig;
