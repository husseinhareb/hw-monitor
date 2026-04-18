import React, { useEffect, useState } from "react";
import useSensorsConfig from "../../hooks/Sensors/useSensorsConfig";
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
  type ConfigTheme,
} from "./Styles/style";

interface SensorsConfig {
  sensors_update_time: number;
  sensors_background_color: string;
  sensors_foreground_color: string;
  sensors_boxes_background_color: string;
  sensors_boxes_foreground_color: string;
  sensors_boxes_title_foreground_color: string;
  sensors_battery_background_color: string;
  sensors_battery_frame_color: string;
  sensors_battery_case_color: string;
}

interface Props { theme: ConfigTheme }

const SensorsConfig: React.FC<Props> = ({ theme }) => {
  const { config, updateConfig } = useSensorsConfig();
  const [updateTimeDraft, setUpdateTimeDraft] = useState("");
  const { t } = useTranslation();

  useEffect(() => {
    setUpdateTimeDraft(String(config.sensors_update_time));
  }, [config.sensors_update_time]);

  const handleConfigChange = (key: keyof SensorsConfig, value: string | number) => {
    if (config) updateConfig(key, value);
  };

  const commitUpdateTime = () => {
    const value = Number(updateTimeDraft);
    if (Number.isFinite(value) && value >= 1000 && value !== config.sensors_update_time) {
      void handleConfigChange("sensors_update_time", value);
      return;
    }

    setUpdateTimeDraft(String(config.sensors_update_time));
  };

  const colorRow = (labelKey: string, field: keyof SensorsConfig) => (
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
        <SettingLabel textColor={theme.textColor}>{t("sensors_config.update_time")}</SettingLabel>
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
        {t("sensors.title")}
      </SubSectionTitle>

      {colorRow("sensors_config.background_color",             "sensors_background_color")}
      {colorRow("sensors_config.foreground_color",             "sensors_foreground_color")}
      {colorRow("sensors_config.boxes_background_color",       "sensors_boxes_background_color")}
      {colorRow("sensors_config.boxes_foreground_color",       "sensors_boxes_foreground_color")}
      {colorRow("sensors_config.boxes_title_foreground_color", "sensors_boxes_title_foreground_color")}

      <SubSectionTitle textColor={theme.textColor} inputBorder={theme.inputBorder}>
        {t("sensors.battery")}
      </SubSectionTitle>

      {colorRow("sensors_config.battery_background_color", "sensors_battery_background_color")}
      {colorRow("sensors_config.battery_frame_color",      "sensors_battery_frame_color")}
      {colorRow("sensors_config.battery_case_color",       "sensors_battery_case_color")}
    </SectionCard>
  );
};

export default SensorsConfig;
