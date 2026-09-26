import React from "react";
import useSensorsConfig from "../../hooks/Sensors/useSensorsConfig";
import { useTranslation } from "react-i18next";
import {
  SectionCard,
  SubSectionTitle,
  type ConfigTheme,
} from "./Styles/style";
import { ConfigColorRow, useConfigNumberDraft, ConfigUpdateTimeRow } from "./ConfigPrimitives";

interface Props { theme: ConfigTheme }

const SensorsConfig: React.FC<Props> = ({ theme }) => {
  const { config, updateConfig } = useSensorsConfig();
  const { t } = useTranslation();

  const handleConfigChange = (key: keyof typeof config, value: string | number) => {
    if (config) updateConfig(key, value);
  };

  const updateTime = useConfigNumberDraft(config.sensors_update_time);
  const commitUpdateTime = () => {
    const value = updateTime.commit();
    if (value != null && value >= 1000 && value !== config.sensors_update_time) {
      void handleConfigChange("sensors_update_time", value);
    }
  };

  return (
    <SectionCard containerBg={theme.containerBg} inputBorder={theme.inputBorder}>
      <ConfigUpdateTimeRow
        labelKey="sensors_config.update_time"
        draft={updateTime.draft}
        setDraft={updateTime.setDraft}
        commit={commitUpdateTime}
        theme={theme}
      />

      <SubSectionTitle textColor={theme.textColor} inputBorder={theme.inputBorder}>
        {t("sensors.title")}
      </SubSectionTitle>

      <ConfigColorRow labelKey="sensors_config.background_color"             value={config.sensors_background_color}             onChange={v => handleConfigChange("sensors_background_color", v)}             theme={theme} />
      <ConfigColorRow labelKey="sensors_config.foreground_color"             value={config.sensors_foreground_color}             onChange={v => handleConfigChange("sensors_foreground_color", v)}             theme={theme} />
      <ConfigColorRow labelKey="sensors_config.boxes_background_color"       value={config.sensors_boxes_background_color}       onChange={v => handleConfigChange("sensors_boxes_background_color", v)}       theme={theme} />
      <ConfigColorRow labelKey="sensors_config.boxes_foreground_color"       value={config.sensors_boxes_foreground_color}       onChange={v => handleConfigChange("sensors_boxes_foreground_color", v)}       theme={theme} />
      <ConfigColorRow labelKey="sensors_config.boxes_title_foreground_color" value={config.sensors_boxes_title_foreground_color} onChange={v => handleConfigChange("sensors_boxes_title_foreground_color", v)} theme={theme} />
      <ConfigColorRow labelKey="sensors_config.graph_color" value={config.sensors_graph_color} onChange={v => handleConfigChange("sensors_graph_color", v)} theme={theme} />
      <ConfigColorRow labelKey="sensors_config.status_ok_color" value={config.sensors_status_ok_color} onChange={v => handleConfigChange("sensors_status_ok_color", v)} theme={theme} />
      <ConfigColorRow labelKey="sensors_config.status_warning_color" value={config.sensors_status_warning_color} onChange={v => handleConfigChange("sensors_status_warning_color", v)} theme={theme} />
      <ConfigColorRow labelKey="sensors_config.status_critical_color" value={config.sensors_status_critical_color} onChange={v => handleConfigChange("sensors_status_critical_color", v)} theme={theme} />

      <SubSectionTitle textColor={theme.textColor} inputBorder={theme.inputBorder}>
        {t("sensors.battery")}
      </SubSectionTitle>

      <ConfigColorRow labelKey="sensors_config.battery_background_color" value={config.sensors_battery_background_color} onChange={v => handleConfigChange("sensors_battery_background_color", v)} theme={theme} />
      <ConfigColorRow labelKey="sensors_config.battery_frame_color"      value={config.sensors_battery_frame_color}      onChange={v => handleConfigChange("sensors_battery_frame_color", v)}      theme={theme} />
      <ConfigColorRow labelKey="sensors_config.battery_case_color"       value={config.sensors_battery_case_color}       onChange={v => handleConfigChange("sensors_battery_case_color", v)}       theme={theme} />
    </SectionCard>
  );
};

export default SensorsConfig;
