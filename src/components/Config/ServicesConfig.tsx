import React, { useState, useEffect } from "react";
import useServicesConfig from "../../hooks/Services/useServicesConfig";
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

interface Props { theme: ConfigTheme }

const ServicesConfig: React.FC<Props> = ({ theme }) => {
    const { config, updateConfig } = useServicesConfig();
    const [updateTimeDraft, setUpdateTimeDraft] = useState("");
    const { t } = useTranslation();

    useEffect(() => {
        setUpdateTimeDraft(String(config.services_update_time));
    }, [config.services_update_time]);

    const handleConfigChange = (key: keyof typeof config, value: string | number) => {
        if (config) void updateConfig(key, value);
    };

    const commitUpdateTime = () => {
        const value = Number(updateTimeDraft);
        if (Number.isFinite(value) && value >= 1000 && value !== config.services_update_time) {
            void handleConfigChange("services_update_time", value);
            return;
        }
        setUpdateTimeDraft(String(config.services_update_time));
    };

    const colorRow = (labelKey: string, field: keyof typeof config) => (
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
                <SettingLabel textColor={theme.textColor}>{t("services_config.update_time")}</SettingLabel>
                <SettingControl>
                    <StyledNumberInput
                        type="number"
                        value={updateTimeDraft}
                        min={1000}
                        step={100}
                        onChange={(e) => setUpdateTimeDraft(e.target.value)}
                        onBlur={commitUpdateTime}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") commitUpdateTime();
                        }}
                        inputBg={theme.inputBg}
                        inputBorder={theme.inputBorder}
                        textColor={theme.textColor}
                    />
                    <UnitLabel textColor={theme.textColor} inputBorder={theme.inputBorder} inputBg={theme.inputBg}>ms</UnitLabel>
                </SettingControl>
            </SettingRow>

            <SubSectionTitle textColor={theme.textColor} inputBorder={theme.inputBorder}>
                Colors
            </SubSectionTitle>

            {colorRow("services_config.background_color", "services_background_color")}
            {colorRow("services_config.body_background_color", "services_body_background_color")}
            {colorRow("services_config.body_color", "services_body_color")}
            {colorRow("services_config.head_background_color", "services_head_background_color")}
            {colorRow("services_config.head_color", "services_head_color")}
            {colorRow("services_config.border_color", "services_border_color")}

            <SubSectionTitle textColor={theme.textColor} inputBorder={theme.inputBorder}>
                Status Colors
            </SubSectionTitle>

            {colorRow("services_config.active_color", "services_active_color")}
            {colorRow("services_config.inactive_color", "services_inactive_color")}
            {colorRow("services_config.failed_color", "services_failed_color")}
            {colorRow("services_config.transitioning_color", "services_transitioning_color")}
        </SectionCard>
    );
};

export default ServicesConfig;
