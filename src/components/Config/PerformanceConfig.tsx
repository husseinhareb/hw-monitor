import React from "react";
import usePerformanceConfig from "../../hooks/Performance/usePerformanceConfig";
import { useTranslation } from "react-i18next";
import {
  SectionCard,
  SubSectionTitle,
  InlineCheckboxRow,
  InlineCheckboxLabel,
  StyledCheckbox,
  type ConfigTheme,
} from "./Styles/style";
import { ConfigColorRow, useConfigNumberDraft, ConfigUpdateTimeRow } from "./ConfigPrimitives";

interface Props { theme: ConfigTheme }

const PerformanceConfig: React.FC<Props> = ({ theme }) => {
  const { config, updateConfig } = usePerformanceConfig();
  const { t } = useTranslation();

  const handleConfigChange = (key: keyof typeof config, value: string | number | boolean) => {
    if (config) updateConfig(key, value);
  };

  const updateTime = useConfigNumberDraft(config.performance_update_time);
  const commitUpdateTime = () => {
    const value = updateTime.commit();
    if (value != null && value >= 1000 && value !== config.performance_update_time) {
      void handleConfigChange("performance_update_time", value);
    }
  };

  return (
    <SectionCard containerBg={theme.containerBg} inputBorder={theme.inputBorder}>
      <ConfigUpdateTimeRow
        labelKey="performance_config.update_time"
        draft={updateTime.draft}
        setDraft={updateTime.setDraft}
        commit={commitUpdateTime}
        theme={theme}
      />

      <SubSectionTitle textColor={theme.textColor} inputBorder={theme.inputBorder}>
        {t("performance_config.sidebar")}
      </SubSectionTitle>

      <ConfigColorRow labelKey="performance_config.sidebar_background_color" value={config.performance_sidebar_background_color} onChange={v => handleConfigChange("performance_sidebar_background_color", v)} theme={theme} />
      <ConfigColorRow labelKey="performance_config.sidebar_color"            value={config.performance_sidebar_color}            onChange={v => handleConfigChange("performance_sidebar_color", v)}            theme={theme} />
      <ConfigColorRow labelKey="performance_config.sidebar_selected_color"   value={config.performance_sidebar_selected_color}   onChange={v => handleConfigChange("performance_sidebar_selected_color", v)}   theme={theme} />

      <SubSectionTitle textColor={theme.textColor} inputBorder={theme.inputBorder}>
        {t("performance_config.content")}
      </SubSectionTitle>

      <ConfigColorRow labelKey="performance_config.background_color" value={config.performance_background_color} onChange={v => handleConfigChange("performance_background_color", v)} theme={theme} />
      <ConfigColorRow labelKey="performance_config.title_color"      value={config.performance_title_color}      onChange={v => handleConfigChange("performance_title_color", v)}      theme={theme} />
      <ConfigColorRow labelKey="performance_config.label_color"      value={config.performance_label_color}      onChange={v => handleConfigChange("performance_label_color", v)}      theme={theme} />
      <ConfigColorRow labelKey="performance_config.value_color"      value={config.performance_value_color}      onChange={v => handleConfigChange("performance_value_color", v)}      theme={theme} />
      <ConfigColorRow labelKey="performance_config.graph_color"      value={config.performance_graph_color}      onChange={v => handleConfigChange("performance_graph_color", v)}      theme={theme} />
      <ConfigColorRow labelKey="performance_config.sec_graph_color"  value={config.performance_sec_graph_color}  onChange={v => handleConfigChange("performance_sec_graph_color", v)}  theme={theme} />
      <ConfigColorRow labelKey="performance_config.scrollbar_color"  value={config.performance_scrollbar_color}  onChange={v => handleConfigChange("performance_scrollbar_color", v)}  theme={theme} />

      <SubSectionTitle textColor={theme.textColor} inputBorder={theme.inputBorder}>
        {t("performance_config.network")}
      </SubSectionTitle>

      <InlineCheckboxRow inputBorder={theme.inputBorder}>
        <InlineCheckboxLabel textColor={theme.textColor}>
          <StyledCheckbox
            type="checkbox"
            checked={config.show_virtual_interfaces}
            onChange={() => handleConfigChange("show_virtual_interfaces", !config.show_virtual_interfaces)}
            inputBorder={theme.inputBorder}
            buttonBg={theme.buttonBg}
            buttonFg={theme.buttonFg}
          />
          {t("performance_config.show_virtual_interfaces")}
        </InlineCheckboxLabel>
      </InlineCheckboxRow>
    </SectionCard>
  );
};

export default PerformanceConfig;
