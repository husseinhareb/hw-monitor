import React from "react";
import useHeatbarConfig from "../../hooks/Sensors/useHeatbarConfig";
import {
    ConfigContainer,
    Title,
    Separator,
    ColorInput,
    ColorLabel,
    ColorLabelText
} from "./Styles/style";
import { useTranslation } from "react-i18next";

interface HeatbarConfig {
    heatbar_color_one: string;
    heatbar_color_two: string;
    heatbar_color_three: string;
    heatbar_color_four: string;
    heatbar_color_five: string;
    heatbar_color_six: string;
    heatbar_color_seven: string;
    heatbar_color_eight: string;
    heatbar_color_nine: string;
    heatbar_color_ten: string;
}

const HeatbarConfig: React.FC = () => {
    const { config, updateConfig } = useHeatbarConfig();
    const { t } = useTranslation();

    const handleConfigChange = (key: keyof HeatbarConfig, value: string) => {
        if (config) {
            updateConfig(key, value);
        }
    };

    return (
        <ConfigContainer>
            <Title>{t('heatbar_config.title')}</Title>
            <Separator />
            <ColorLabel>
                <ColorLabelText>{t('heatbar_config.color_one')}</ColorLabelText>
                <ColorInput
                    type="color"
                    value={config.heatbar_color_one}
                    onChange={(e) => handleConfigChange("heatbar_color_one", e.target.value)}
                />
            </ColorLabel>
            <ColorLabel>
                <ColorLabelText>{t('heatbar_config.color_two')}</ColorLabelText>
                <ColorInput
                    type="color"
                    value={config.heatbar_color_two}
                    onChange={(e) => handleConfigChange("heatbar_color_two", e.target.value)}
                />
            </ColorLabel>
            <ColorLabel>
                <ColorLabelText>{t('heatbar_config.color_three')}</ColorLabelText>
                <ColorInput
                    type="color"
                    value={config.heatbar_color_three}
                    onChange={(e) => handleConfigChange("heatbar_color_three", e.target.value)}
                />
            </ColorLabel>
            <ColorLabel>
                <ColorLabelText>{t('heatbar_config.color_four')}</ColorLabelText>
                <ColorInput
                    type="color"
                    value={config.heatbar_color_four}
                    onChange={(e) => handleConfigChange("heatbar_color_four", e.target.value)}
                />
            </ColorLabel>
            <ColorLabel>
                <ColorLabelText>{t('heatbar_config.color_five')}</ColorLabelText>
                <ColorInput
                    type="color"
                    value={config.heatbar_color_five}
                    onChange={(e) => handleConfigChange("heatbar_color_five", e.target.value)}
                />
            </ColorLabel>
            <ColorLabel>
                <ColorLabelText>{t('heatbar_config.color_six')}</ColorLabelText>
                <ColorInput
                    type="color"
                    value={config.heatbar_color_six}
                    onChange={(e) => handleConfigChange("heatbar_color_six", e.target.value)}
                />
            </ColorLabel>
            <ColorLabel>
                <ColorLabelText>{t('heatbar_config.color_seven')}</ColorLabelText>
                <ColorInput
                    type="color"
                    value={config.heatbar_color_seven}
                    onChange={(e) => handleConfigChange("heatbar_color_seven", e.target.value)}
                />
            </ColorLabel>
            <ColorLabel>
                <ColorLabelText>{t('heatbar_config.color_eight')}</ColorLabelText>
                <ColorInput
                    type="color"
                    value={config.heatbar_color_eight}
                    onChange={(e) => handleConfigChange("heatbar_color_eight", e.target.value)}
                />
            </ColorLabel>
            <ColorLabel>
                <ColorLabelText>{t('heatbar_config.color_nine')}</ColorLabelText>
                <ColorInput
                    type="color"
                    value={config.heatbar_color_nine}
                    onChange={(e) => handleConfigChange("heatbar_color_nine", e.target.value)}
                />
            </ColorLabel>
            <ColorLabel>
                <ColorLabelText>{t('heatbar_config.color_ten')}</ColorLabelText>
                <ColorInput
                    type="color"
                    value={config.heatbar_color_ten}
                    onChange={(e) => handleConfigChange("heatbar_color_ten", e.target.value)}
                />
            </ColorLabel>
        </ConfigContainer>
    );
};

export default HeatbarConfig;
