import React from "react";
import useNavbarConfig from "../../hooks/Navbar/useNavbarConfig";
import {
    ConfigContainer,
    Title,
    Separator,
    ColorInput,
    ColorLabel,
    ColorLabelText
} from "./Styles/style";
import { useTranslation } from "react-i18next";

interface NavbarConfig {
    navbar_background_color: string;
    navbar_buttons_background_color: string;
    navbar_buttons_foreground_color: string;
    navbar_search_background_color: string;
    navbar_search_foreground_color: string;
}

const NavbarConfig: React.FC = () => {
    const { config, updateConfig } = useNavbarConfig();
    const { t } = useTranslation();

    const handleConfigChange = (key: keyof NavbarConfig, value: string | number) => {
        if (config) {
            updateConfig(key, value);
        }
    };

    return (
        <ConfigContainer>
            <Title>{t('navbar_config.title')}</Title>
            <Separator />
            <ColorLabel>
                <ColorLabelText>{t('navbar_config.background_color')}</ColorLabelText>
                <ColorInput
                    type="color"
                    value={config.navbar_background_color}
                    onChange={(e) => handleConfigChange("navbar_background_color", e.target.value)}
                />
            </ColorLabel>
            <ColorLabel>
                <ColorLabelText>{t('navbar_config.buttons_background_color')}</ColorLabelText>
                <ColorInput
                    type="color"
                    value={config.navbar_buttons_background_color}
                    onChange={(e) => handleConfigChange("navbar_buttons_background_color", e.target.value)}
                />
            </ColorLabel>
            <ColorLabel>
                <ColorLabelText>{t('navbar_config.buttons_foreground_color')}</ColorLabelText>
                <ColorInput
                    type="color"
                    value={config.navbar_buttons_foreground_color}
                    onChange={(e) => handleConfigChange("navbar_buttons_foreground_color", e.target.value)}
                />
            </ColorLabel>
            <ColorLabel>
                <ColorLabelText>{t('navbar_config.search_background_color')}</ColorLabelText>
                <ColorInput
                    type="color"
                    value={config.navbar_search_background_color}
                    onChange={(e) => handleConfigChange("navbar_search_background_color", e.target.value)}
                />
            </ColorLabel>
            <ColorLabel>
                <ColorLabelText>{t('navbar_config.search_foreground_color')}</ColorLabelText>
                <ColorInput
                    type="color"
                    value={config.navbar_search_foreground_color}
                    onChange={(e) => handleConfigChange("navbar_search_foreground_color", e.target.value)}
                />
            </ColorLabel>
        </ConfigContainer>
    );
};

export default NavbarConfig;
