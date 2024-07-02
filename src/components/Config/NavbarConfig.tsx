import React from "react";
import useNavbarConfig from "../../hooks/useNavbarConfig";
import {
    ConfigContainer,
    Title,
    Separator,
    ColorInput,
    ColorLabel,
    ColorLabelText
} from "./Styles/style";

interface NavbarConfig {
    navbar_background_color: string;
    navbar_buttons_background_color: string;
    navbar_buttons_foreground_color: string;
    navbar_search_background_color: string;
    navbar_search_foreground_color: string;
}

const NavbarConfig: React.FC = () => {
    const { config, updateConfig } = useNavbarConfig();

    const handleConfigChange = (key: keyof NavbarConfig, value: string | number) => {
        if (config) {
            updateConfig(key, value);
        }
    };

    return (
        <ConfigContainer>
            <Title>Navbar Config</Title>
            <Separator />
            <ColorLabel>
                <ColorLabelText>Background Color</ColorLabelText>
                <ColorInput
                    type="color"
                    value={config.navbar_background_color}
                    onChange={(e) => handleConfigChange("navbar_background_color", e.target.value)}
                />
            </ColorLabel>
            <ColorLabel>
                <ColorLabelText>Buttons Background Color</ColorLabelText>
                <ColorInput
                    type="color"
                    value={config.navbar_buttons_background_color}
                    onChange={(e) => handleConfigChange("navbar_buttons_background_color", e.target.value)}
                />
            </ColorLabel>
            <ColorLabel>
                <ColorLabelText>Buttons Foreground Color</ColorLabelText>
                <ColorInput
                    type="color"
                    value={config.navbar_buttons_foreground_color}
                    onChange={(e) => handleConfigChange("navbar_buttons_foreground_color", e.target.value)}
                />
            </ColorLabel>
            <ColorLabel>
                <ColorLabelText>Search Background Color</ColorLabelText>
                <ColorInput
                    type="color"
                    value={config.navbar_search_background_color}
                    onChange={(e) => handleConfigChange("navbar_search_background_color", e.target.value)}
                />
            </ColorLabel>
            <ColorLabel>
                <ColorLabelText>Search Foreground Color</ColorLabelText>
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
