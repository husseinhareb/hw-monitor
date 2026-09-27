import React from "react";
import { useTranslation } from "react-i18next";
import useServicesConfig from "../../hooks/Services/useServicesConfig";
import {
    SectionCard,
    SubSectionTitle,
    type ConfigTheme,
} from "./Styles/style";
import { ConfigColorRow, useConfigNumberDraft, ConfigUpdateTimeRow } from "./ConfigPrimitives";

interface Props { theme: ConfigTheme }

const ServicesConfig: React.FC<Props> = ({ theme }) => {
    const { t } = useTranslation();
    const { config, updateConfig } = useServicesConfig();

    const handleConfigChange = (key: keyof typeof config, value: string | number) => {
        if (config) void updateConfig(key, value);
    };

    const updateTime = useConfigNumberDraft(config.services_update_time);
    const commitUpdateTime = () => {
        const value = updateTime.commit();
        if (value != null && value >= 1000 && value !== config.services_update_time) {
            void handleConfigChange("services_update_time", value);
        }
    };

    return (
        <SectionCard containerBg={theme.containerBg} inputBorder={theme.inputBorder}>
            <ConfigUpdateTimeRow
                labelKey="services_config.update_time"
                draft={updateTime.draft}
                setDraft={updateTime.setDraft}
                commit={commitUpdateTime}
                theme={theme}
            />

            <SubSectionTitle textColor={theme.textColor} inputBorder={theme.inputBorder}>
                {t("config.colors")}
            </SubSectionTitle>

            <ConfigColorRow labelKey="services_config.background_color"       value={config.services_background_color}       onChange={v => handleConfigChange("services_background_color", v)}       theme={theme} />
            <ConfigColorRow labelKey="services_config.body_background_color"  value={config.services_body_background_color}  onChange={v => handleConfigChange("services_body_background_color", v)}  theme={theme} />
            <ConfigColorRow labelKey="services_config.body_color"             value={config.services_body_color}             onChange={v => handleConfigChange("services_body_color", v)}             theme={theme} />
            <ConfigColorRow labelKey="services_config.head_background_color"  value={config.services_head_background_color}  onChange={v => handleConfigChange("services_head_background_color", v)}  theme={theme} />
            <ConfigColorRow labelKey="services_config.head_color"             value={config.services_head_color}             onChange={v => handleConfigChange("services_head_color", v)}             theme={theme} />
            <ConfigColorRow labelKey="services_config.border_color"           value={config.services_border_color}           onChange={v => handleConfigChange("services_border_color", v)}           theme={theme} />

            <SubSectionTitle textColor={theme.textColor} inputBorder={theme.inputBorder}>
                {t("config.status_colors")}
            </SubSectionTitle>

            <ConfigColorRow labelKey="services_config.active_color"         value={config.services_active_color}         onChange={v => handleConfigChange("services_active_color", v)}         theme={theme} />
            <ConfigColorRow labelKey="services_config.inactive_color"       value={config.services_inactive_color}       onChange={v => handleConfigChange("services_inactive_color", v)}       theme={theme} />
            <ConfigColorRow labelKey="services_config.failed_color"         value={config.services_failed_color}         onChange={v => handleConfigChange("services_failed_color", v)}         theme={theme} />
            <ConfigColorRow labelKey="services_config.transitioning_color"  value={config.services_transitioning_color}  onChange={v => handleConfigChange("services_transitioning_color", v)}  theme={theme} />
        </SectionCard>
    );
};

export default ServicesConfig;
