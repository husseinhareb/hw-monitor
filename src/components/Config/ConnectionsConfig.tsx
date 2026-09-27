import React from "react";
import { useTranslation } from "react-i18next";
import useConnectionsConfig from "../../hooks/Connections/useConnectionsConfig";
import {
    SectionCard,
    SubSectionTitle,
    type ConfigTheme,
} from "./Styles/style";
import { ConfigColorRow, useConfigNumberDraft, ConfigUpdateTimeRow } from "./ConfigPrimitives";

interface Props { theme: ConfigTheme }

const ConnectionsConfig: React.FC<Props> = ({ theme }) => {
    const { t } = useTranslation();
    const { config, updateConfig } = useConnectionsConfig();

    const handleConfigChange = (key: keyof typeof config, value: string | number) => {
        if (config) void updateConfig(key, value);
    };

    const updateTime = useConfigNumberDraft(config.connections_update_time);
    const commitUpdateTime = () => {
        const value = updateTime.commit();
        if (value != null && value >= 1000 && value !== config.connections_update_time) {
            void handleConfigChange("connections_update_time", value);
        }
    };

    return (
        <SectionCard containerBg={theme.containerBg} inputBorder={theme.inputBorder}>
            <ConfigUpdateTimeRow
                labelKey="connections_config.update_time"
                draft={updateTime.draft}
                setDraft={updateTime.setDraft}
                commit={commitUpdateTime}
                theme={theme}
            />

            <SubSectionTitle textColor={theme.textColor} inputBorder={theme.inputBorder}>
                {t("config.colors")}
            </SubSectionTitle>

            <ConfigColorRow labelKey="connections_config.background_color"        value={config.connections_background_color}        onChange={v => handleConfigChange("connections_background_color", v)}        theme={theme} />
            <ConfigColorRow labelKey="connections_config.body_background_color"   value={config.connections_body_background_color}   onChange={v => handleConfigChange("connections_body_background_color", v)}   theme={theme} />
            <ConfigColorRow labelKey="connections_config.body_color"              value={config.connections_body_color}              onChange={v => handleConfigChange("connections_body_color", v)}              theme={theme} />
            <ConfigColorRow labelKey="connections_config.head_background_color"   value={config.connections_head_background_color}   onChange={v => handleConfigChange("connections_head_background_color", v)}   theme={theme} />
            <ConfigColorRow labelKey="connections_config.head_color"              value={config.connections_head_color}              onChange={v => handleConfigChange("connections_head_color", v)}              theme={theme} />
            <ConfigColorRow labelKey="connections_config.border_color"            value={config.connections_border_color}            onChange={v => handleConfigChange("connections_border_color", v)}            theme={theme} />
        </SectionCard>
    );
};

export default ConnectionsConfig;
