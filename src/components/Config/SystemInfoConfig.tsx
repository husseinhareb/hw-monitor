import React, { useState, useEffect } from "react";
import useSystemInfoConfig from "../../hooks/SystemInfo/useSystemInfoConfig";
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

const SystemInfoConfig: React.FC<Props> = ({ theme }) => {
    const { config, updateConfig } = useSystemInfoConfig();
    const [updateTimeDraft, setUpdateTimeDraft] = useState("");
    const { t } = useTranslation();

    useEffect(() => {
        setUpdateTimeDraft(String(config.system_info_update_time));
    }, [config.system_info_update_time]);

    const handleConfigChange = (key: keyof typeof config, value: string | number) => {
        if (config) void updateConfig(key, value);
    };

    const commitUpdateTime = () => {
        const value = Number(updateTimeDraft);
        if (Number.isFinite(value) && value >= 1000 && value !== config.system_info_update_time) {
            void handleConfigChange("system_info_update_time", value);
            return;
        }
        setUpdateTimeDraft(String(config.system_info_update_time));
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
                <SettingLabel textColor={theme.textColor}>{t("system_info_config.update_time")}</SettingLabel>
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

            {colorRow("system_info_config.background_color", "system_info_background_color")}
            {colorRow("system_info_config.boxes_background_color", "system_info_boxes_background_color")}
            {colorRow("system_info_config.title_color", "system_info_title_color")}
            {colorRow("system_info_config.label_color", "system_info_label_color")}
            {colorRow("system_info_config.value_color", "system_info_value_color")}
            {colorRow("system_info_config.border_color", "system_info_border_color")}
        </SectionCard>
    );
};

export default SystemInfoConfig;
