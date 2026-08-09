import React from "react";
import useDisksConfig from "../../hooks/Disks/useDisksConfig";
import { useTranslation } from "react-i18next";
import {
  SectionCard,
  SubSectionTitle,
  type ConfigTheme,
} from "./Styles/style";
import { ConfigColorRow, useConfigNumberDraft, ConfigUpdateTimeRow } from "./ConfigPrimitives";

interface Props { theme: ConfigTheme }

const DisksConfig: React.FC<Props> = ({ theme }) => {
  const { config, updateConfig } = useDisksConfig();
  const { t } = useTranslation();

  const handleConfigChange = (key: keyof typeof config, value: string | number) => {
    if (config) updateConfig(key, value);
  };

  const updateTime = useConfigNumberDraft(config.disks_update_time);
  const commitUpdateTime = () => {
    const value = updateTime.commit();
    if (value != null && value >= 1000 && value !== config.disks_update_time) {
      void handleConfigChange("disks_update_time", value);
    }
  };

  return (
    <SectionCard containerBg={theme.containerBg} inputBorder={theme.inputBorder}>
      <ConfigUpdateTimeRow
        labelKey="disks_config.update_time"
        draft={updateTime.draft}
        setDraft={updateTime.setDraft}
        commit={commitUpdateTime}
        theme={theme}
      />

      <SubSectionTitle textColor={theme.textColor} inputBorder={theme.inputBorder}>
        {t("disks_config.title")}
      </SubSectionTitle>

      <ConfigColorRow labelKey="disks_config.background_color"       value={config.disks_background_color}       onChange={v => handleConfigChange("disks_background_color", v)}       theme={theme} />
      <ConfigColorRow labelKey="disks_config.boxes_background_color" value={config.disks_boxes_background_color} onChange={v => handleConfigChange("disks_boxes_background_color", v)} theme={theme} />
      <ConfigColorRow labelKey="disks_config.name_foreground_color"  value={config.disks_name_foreground_color}  onChange={v => handleConfigChange("disks_name_foreground_color", v)}  theme={theme} />
      <ConfigColorRow labelKey="disks_config.size_foreground_color"  value={config.disks_size_foreground_color}  onChange={v => handleConfigChange("disks_size_foreground_color", v)}  theme={theme} />

      <SubSectionTitle textColor={theme.textColor} inputBorder={theme.inputBorder}>
        {t("disk.title")}
      </SubSectionTitle>

      <ConfigColorRow labelKey="disks_config.partition_background_color"       value={config.disks_partition_background_color}       onChange={v => handleConfigChange("disks_partition_background_color", v)}       theme={theme} />
      <ConfigColorRow labelKey="disks_config.partition_usage_background_color" value={config.disks_partition_usage_background_color} onChange={v => handleConfigChange("disks_partition_usage_background_color", v)} theme={theme} />
      <ConfigColorRow labelKey="disks_config.partition_name_foreground_color"  value={config.disks_partition_name_foreground_color}  onChange={v => handleConfigChange("disks_partition_name_foreground_color", v)}  theme={theme} />
      <ConfigColorRow labelKey="disks_config.partition_type_foreground_color"  value={config.disks_partition_type_foreground_color}  onChange={v => handleConfigChange("disks_partition_type_foreground_color", v)}  theme={theme} />
      <ConfigColorRow labelKey="disks_config.partition_usage_foreground_color" value={config.disks_partition_usage_foreground_color} onChange={v => handleConfigChange("disks_partition_usage_foreground_color", v)} theme={theme} />
    </SectionCard>
  );
};

export default DisksConfig;
