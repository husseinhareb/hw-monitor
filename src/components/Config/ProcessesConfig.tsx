import React, { useState, useEffect } from "react";
import useProcessConfig from "../../hooks/Proc/useProcessConfig";
import { useTranslation } from "react-i18next";
import {
  SectionCard,
  SubSectionTitle,
  CheckboxGrid,
  CheckboxItem,
  StyledCheckbox,
  type ConfigTheme,
} from "./Styles/style";
import { ConfigColorRow, useConfigNumberDraft, ConfigUpdateTimeRow } from "./ConfigPrimitives";

// Translation keys for the table values
const tableValues = [
  "processes_config.table_value_name",
  "processes_config.table_value_pid",
  "processes_config.table_value_ppid",
  "processes_config.table_value_user",
  "processes_config.table_value_state",
  "processes_config.table_value_memory",
  "processes_config.table_value_cpu_usage",
  "processes_config.table_value_gpu_usage",
  "processes_config.table_value_gpu_memory",
  "processes_config.table_value_read_disk_usage",
  "processes_config.table_value_write_disk_usage",
  "processes_config.table_value_read_disk_speed",
  "processes_config.table_value_write_disk_speed",
  "processes_config.table_value_nice",
];

const translationMap: Record<string, string> = {
  "processes_config.table_value_user":             "user",
  "processes_config.table_value_pid":              "pid",
  "processes_config.table_value_ppid":             "ppid",
  "processes_config.table_value_name":             "name",
  "processes_config.table_value_state":            "state",
  "processes_config.table_value_memory":           "memory",
  "processes_config.table_value_cpu_usage":        "cpu_usage",
  "processes_config.table_value_gpu_usage":        "gpu_usage",
  "processes_config.table_value_gpu_memory":       "gpu_memory",
  "processes_config.table_value_read_disk_usage":  "read_disk_usage",
  "processes_config.table_value_write_disk_usage": "write_disk_usage",
  "processes_config.table_value_read_disk_speed":  "read_disk_speed",
  "processes_config.table_value_write_disk_speed": "write_disk_speed",
  "processes_config.table_value_nice":             "nice",
};

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

  const handleConfigChange = (key: keyof typeof config, value: string | number) => {
    if (config) updateConfig(key, value);
  };

  const updateTime = useConfigNumberDraft(config.processes_update_time);
  const commitUpdateTime = () => {
    const value = updateTime.commit();
    if (value != null && value >= 1000 && value !== config.processes_update_time) {
      void handleConfigChange("processes_update_time", value);
    }
  };

  return (
    <SectionCard containerBg={theme.containerBg} inputBorder={theme.inputBorder}>
      <ConfigUpdateTimeRow
        labelKey="processes_config.update_time"
        draft={updateTime.draft}
        setDraft={updateTime.setDraft}
        commit={commitUpdateTime}
        theme={theme}
      />

      <SubSectionTitle textColor={theme.textColor} inputBorder={theme.inputBorder}>
        {t("processes_config.body_background_color").replace(" Color", "")} / Colors
      </SubSectionTitle>

      <ConfigColorRow labelKey="processes_config.body_background_color" value={config.processes_body_background_color} onChange={v => handleConfigChange("processes_body_background_color", v)} theme={theme} />
      <ConfigColorRow labelKey="processes_config.body_color"            value={config.processes_body_color}            onChange={v => handleConfigChange("processes_body_color", v)}            theme={theme} />
      <ConfigColorRow labelKey="processes_config.head_background_color" value={config.processes_head_background_color} onChange={v => handleConfigChange("processes_head_background_color", v)} theme={theme} />
      <ConfigColorRow labelKey="processes_config.head_color"            value={config.processes_head_color}            onChange={v => handleConfigChange("processes_head_color", v)}            theme={theme} />
      <ConfigColorRow labelKey="processes_config.border_color"          value={config.processes_border_color}          onChange={v => handleConfigChange("processes_border_color", v)}          theme={theme} />
      <ConfigColorRow labelKey="processes_config.tree_toggle_color"     value={config.processes_tree_toggle_color}     onChange={v => handleConfigChange("processes_tree_toggle_color", v)}     theme={theme} />
      <ConfigColorRow labelKey="processes_config.monitor_border_color"  value={config.processes_monitor_border_color}  onChange={v => handleConfigChange("processes_monitor_border_color", v)}  theme={theme} />

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
