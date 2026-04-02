import React from "react";
import useConfigPanelConfig from "../../hooks/Config/useConfigPanelConfig";
import {
    ConfigContainer,
    Title,
    Separator,
    ColorInput,
    ColorLabel,
    ColorLabelText,
} from "./Styles/style";
import { useTranslation } from "react-i18next";

interface ConfigPanelConfig {
    config_background_color: string;
    config_container_background_color: string;
    config_input_background_color: string;
    config_input_border_color: string;
    config_button_background_color: string;
    config_button_foreground_color: string;
    config_text_color: string;
}

const ConfigPanelConfigSection: React.FC = () => {
    const { config, updateConfig } = useConfigPanelConfig();
    const { t } = useTranslation();

    const handleConfigChange = (key: keyof ConfigPanelConfig, value: string) => {
        if (config) {
            updateConfig(key, value);
        }
    };

    return (
        <ConfigContainer containerBgColor={config.config_container_background_color}>
            <Title>{t('config_panel_config.title')}</Title>
            <Separator borderColor={config.config_input_border_color} />
            <ColorLabel>
                <ColorLabelText>{t('config_panel_config.background_color')}</ColorLabelText>
                <ColorInput
                    type="color"
                    value={config.config_background_color}
                    onChange={(e) => handleConfigChange("config_background_color", e.target.value)}
                />
            </ColorLabel>
            <ColorLabel>
                <ColorLabelText>{t('config_panel_config.container_background_color')}</ColorLabelText>
                <ColorInput
                    type="color"
                    value={config.config_container_background_color}
                    onChange={(e) => handleConfigChange("config_container_background_color", e.target.value)}
                />
            </ColorLabel>
            <ColorLabel>
                <ColorLabelText>{t('config_panel_config.input_background_color')}</ColorLabelText>
                <ColorInput
                    type="color"
                    value={config.config_input_background_color}
                    onChange={(e) => handleConfigChange("config_input_background_color", e.target.value)}
                />
            </ColorLabel>
            <ColorLabel>
                <ColorLabelText>{t('config_panel_config.input_border_color')}</ColorLabelText>
                <ColorInput
                    type="color"
                    value={config.config_input_border_color}
                    onChange={(e) => handleConfigChange("config_input_border_color", e.target.value)}
                />
            </ColorLabel>
            <ColorLabel>
                <ColorLabelText>{t('config_panel_config.button_background_color')}</ColorLabelText>
                <ColorInput
                    type="color"
                    value={config.config_button_background_color}
                    onChange={(e) => handleConfigChange("config_button_background_color", e.target.value)}
                />
            </ColorLabel>
            <ColorLabel>
                <ColorLabelText>{t('config_panel_config.button_foreground_color')}</ColorLabelText>
                <ColorInput
                    type="color"
                    value={config.config_button_foreground_color}
                    onChange={(e) => handleConfigChange("config_button_foreground_color", e.target.value)}
                />
            </ColorLabel>
            <ColorLabel>
                <ColorLabelText>{t('config_panel_config.text_color')}</ColorLabelText>
                <ColorInput
                    type="color"
                    value={config.config_text_color}
                    onChange={(e) => handleConfigChange("config_text_color", e.target.value)}
                />
            </ColorLabel>
        </ConfigContainer>
    );
};

export default ConfigPanelConfigSection;
