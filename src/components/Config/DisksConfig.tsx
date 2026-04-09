import React from "react";
import useDisksConfig from "../../hooks/Disks/useDisksConfig";
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

interface DisksConfig {
  disks_update_time: number;
  disks_background_color: string;
  disks_boxes_background_color: string;
  disks_name_foreground_color: string;
  disks_size_foreground_color: string;
  disks_partition_background_color: string;
  disks_partition_usage_background_color: string;
  disks_partition_name_foreground_color: string;
  disks_partition_type_foreground_color: string;
  disks_partition_usage_foreground_color: string;
}

interface Props { theme: ConfigTheme }

const DisksConfig: React.FC<Props> = ({ theme }) => {
  const { config, updateConfig } = useDisksConfig();
  const { t } = useTranslation();

  const handleConfigChange = (key: keyof DisksConfig, value: string | number) => {
    if (config) updateConfig(key, value);
  };

  const handleUpdateTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (value >= 1000) handleConfigChange("disks_update_time", value);
  };

  const colorRow = (labelKey: string, field: keyof DisksConfig) => (
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
        <SettingLabel textColor={theme.textColor}>{t("disks_config.update_time")}</SettingLabel>
        <SettingControl>
          <StyledNumberInput
            type="number"
            value={config.disks_update_time}
            min={1000}
            step={100}
            onChange={handleUpdateTimeChange}
            inputBg={theme.inputBg}
            inputBorder={theme.inputBorder}
            textColor={theme.textColor}
          />
          <UnitLabel textColor={theme.textColor} inputBorder={theme.inputBorder} inputBg={theme.inputBg}>ms</UnitLabel>
        </SettingControl>
      </SettingRow>

      <SubSectionTitle textColor={theme.textColor} inputBorder={theme.inputBorder}>
        {t("disks_config.title")}
      </SubSectionTitle>

      {colorRow("disks_config.background_color",       "disks_background_color")}
      {colorRow("disks_config.boxes_background_color", "disks_boxes_background_color")}
      {colorRow("disks_config.name_foreground_color",  "disks_name_foreground_color")}
      {colorRow("disks_config.size_foreground_color",  "disks_size_foreground_color")}

      <SubSectionTitle textColor={theme.textColor} inputBorder={theme.inputBorder}>
        {t("disk.title")}
      </SubSectionTitle>

      {colorRow("disks_config.partition_background_color",       "disks_partition_background_color")}
      {colorRow("disks_config.partition_usage_background_color", "disks_partition_usage_background_color")}
      {colorRow("disks_config.partition_name_foreground_color",  "disks_partition_name_foreground_color")}
      {colorRow("disks_config.partition_type_foreground_color",  "disks_partition_type_foreground_color")}
      {colorRow("disks_config.partition_usage_foreground_color", "disks_partition_usage_foreground_color")}
    </SectionCard>
  );
};

export default DisksConfig;
