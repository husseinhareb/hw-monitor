import React from "react";
import { useTranslation } from "react-i18next";
import useSystemInfoConfig from "../../hooks/SystemInfo/useSystemInfoConfig";
import {
    SectionCard,
    SubSectionTitle,
    type ConfigTheme,
} from "./Styles/style";
import { ConfigColorRow, useConfigNumberDraft, ConfigUpdateTimeRow } from "./ConfigPrimitives";

interface Props { theme: ConfigTheme }

const SystemInfoConfig: React.FC<Props> = ({ theme }) => {
    const { t } = useTranslation();
    const { config, updateConfig } = useSystemInfoConfig();

    const handleConfigChange = (key: keyof typeof config, value: string | number) => {
        if (config) void updateConfig(key, value);
    };

    const updateTime = useConfigNumberDraft(config.system_info_update_time);
    const commitUpdateTime = () => {
        const value = updateTime.commit();
        if (value != null && value >= 1000 && value !== config.system_info_update_time) {
            void handleConfigChange("system_info_update_time", value);
        }
    };

    return (
        <SectionCard containerBg={theme.containerBg} inputBorder={theme.inputBorder}>
            <ConfigUpdateTimeRow
                labelKey="system_info_config.update_time"
                draft={updateTime.draft}
                setDraft={updateTime.setDraft}
                commit={commitUpdateTime}
                theme={theme}
            />

            <SubSectionTitle textColor={theme.textColor} inputBorder={theme.inputBorder}>
                {t("config.colors")}
            </SubSectionTitle>

            <ConfigColorRow labelKey="system_info_config.background_color"       value={config.system_info_background_color}       onChange={v => handleConfigChange("system_info_background_color", v)}       theme={theme} />
            <ConfigColorRow labelKey="system_info_config.boxes_background_color" value={config.system_info_boxes_background_color} onChange={v => handleConfigChange("system_info_boxes_background_color", v)} theme={theme} />
            <ConfigColorRow labelKey="system_info_config.title_color"            value={config.system_info_title_color}            onChange={v => handleConfigChange("system_info_title_color", v)}            theme={theme} />
            <ConfigColorRow labelKey="system_info_config.label_color"            value={config.system_info_label_color}            onChange={v => handleConfigChange("system_info_label_color", v)}            theme={theme} />
            <ConfigColorRow labelKey="system_info_config.value_color"            value={config.system_info_value_color}            onChange={v => handleConfigChange("system_info_value_color", v)}            theme={theme} />
            <ConfigColorRow labelKey="system_info_config.border_color"           value={config.system_info_border_color}           onChange={v => handleConfigChange("system_info_border_color", v)}           theme={theme} />
        </SectionCard>
    );
};

export default SystemInfoConfig;
