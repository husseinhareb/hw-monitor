import React, { useState, useEffect } from "react";
import useProcessConfig from "../../hooks/Proc/useProcessConfig";
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
  CheckboxGrid,
  CheckboxItem,
  StyledCheckbox,
  type ConfigTheme,
} from "./Styles/style";

// Translation keys for the table values
const tableValues = [
  "processes_config.table_value_user",
  "processes_config.table_value_pid",
  "processes_config.table_value_ppid",
  "processes_config.table_value_name",
  "processes_config.table_value_state",
  "processes_config.table_value_memory",
  "processes_config.table_value_cpu_usage",
  "processes_config.table_value_read_disk_usage",
  "processes_config.table_value_write_disk_usage",
  "processes_config.table_value_read_disk_speed",
  "processes_config.table_value_write_disk_speed",
];

const translationMap: Record<string, string> = {
  "processes_config.table_value_user":             "user",
  "processes_config.table_value_pid":              "pid",
  "processes_config.table_value_ppid":             "ppid",
  "processes_config.table_value_name":             "name",
  "processes_config.table_value_state":            "state",
  "processes_config.table_value_memory":           "memory",
  "processes_config.table_value_cpu_usage":        "cpu_usage",
  "processes_config.table_value_read_disk_usage":  "read_disk_usage",
  "processes_config.table_value_write_disk_usage": "write_disk_usage",
  "processes_config.table_value_read_disk_speed":  "read_disk_speed",
  "processes_config.table_value_write_disk_speed": "write_disk_speed",
};

interface ProcessConfig {
  processes_update_time: number;
  processes_body_background_color: string;
  processes_body_color: string;
  processes_head_background_color: string;
  processes_head_color: string;
  processes_table_values: string[];
  processes_border_color: string;
  processes_tree_toggle_color: string;
  processes_monitor_border_color: string;
}

interface Props { theme: ConfigTheme }

const ProcessesConfig: React.FC<Props> = ({ theme }) => {
  const { config, updateConfig, updateTableValues } = useProcessConfig();
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const { t } = useTranslation();

  useEffect(() => {
    if (config?.processes_table_values) {
      setSelectedValues(config.processes_table_values);
    }
  }, [config]);

  const handleTableValueChange = (translationKey: string) => {
    const original = translationMap[translationKey];
    setSelectedValues(prev => {
      const next = prev.includes(original)
        ? prev.filter(v => v !== original)
        : [...prev, original];
      updateTableValues(next);
      return next;
    });
  };

  const handleConfigChange = (key: keyof ProcessConfig, value: string | number) => {
    if (config) updateConfig(key, value);
  };

  const handleUpdateTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (value >= 1000) handleConfigChange("processes_update_time", value);
  };

  const colorRow = (labelKey: string, field: keyof ProcessConfig) => (
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
        <SettingLabel textColor={theme.textColor}>{t("processes_config.update_time")}</SettingLabel>
        <SettingControl>
          <StyledNumberInput
            type="number"
            value={config.processes_update_time}
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
        {t("processes_config.body_background_color").replace(" Color", "")} / Colors
      </SubSectionTitle>

      {colorRow("processes_config.body_background_color",    "processes_body_background_color")}
      {colorRow("processes_config.body_color",               "processes_body_color")}
      {colorRow("processes_config.head_background_color",    "processes_head_background_color")}
      {colorRow("processes_config.head_color",               "processes_head_color")}
      {colorRow("processes_config.border_color",             "processes_border_color")}
      {colorRow("processes_config.tree_toggle_color",        "processes_tree_toggle_color")}
      {colorRow("processes_config.monitor_border_color",     "processes_monitor_border_color")}

      <SubSectionTitle textColor={theme.textColor} inputBorder={theme.inputBorder}>
        {t("processes_config.table_values")}
      </SubSectionTitle>

      <CheckboxGrid>
        {tableValues.map(key => (
          <CheckboxItem key={key} textColor={theme.textColor} inputBorder={theme.inputBorder}>
            <StyledCheckbox
              type="checkbox"
              checked={selectedValues.includes(translationMap[key])}
              onChange={() => handleTableValueChange(key)}
              inputBorder={theme.inputBorder}
              buttonBg={theme.buttonBg}
              buttonFg={theme.buttonFg}
            />
            {t(key)}
          </CheckboxItem>
        ))}
      </CheckboxGrid>
    </SectionCard>
  );
};

export default ProcessesConfig;
