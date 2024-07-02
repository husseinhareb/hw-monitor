import React from "react";
import useHeatbar from "../../hooks/useHeatbarConfig";
import {
    ConfigContainer,
    Title,
    Separator,
    ColorInput,
    ColorLabel,
    ColorLabelText
} from "./Styles/style";

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
    const { config, updateConfig } = useHeatbar();

    const handleConfigChange = (key: keyof HeatbarConfig, value: string | number) => {
        if (config) {
            updateConfig(key, value);
        }
    };

    return (
        <ConfigContainer>
            <Title>Heatbar Config</Title>
            <Separator />
            <ColorLabel>
                <ColorLabelText>First Color</ColorLabelText>
                <ColorInput
                    type="color"
                    value={config.heatbar_color_one}
                    onChange={(e) => handleConfigChange("heatbar_color_one", e.target.value)}
                />
            </ColorLabel>
            <ColorLabel>
                <ColorLabelText>Second Color</ColorLabelText>
                <ColorInput
                    type="color"
                    value={config.heatbar_color_two}
                    onChange={(e) => handleConfigChange("heatbar_color_two", e.target.value)}
                />
            </ColorLabel>
            <ColorLabel>
                <ColorLabelText>Third Color</ColorLabelText>
                <ColorInput
                    type="color"
                    value={config.heatbar_color_three}
                    onChange={(e) => handleConfigChange("heatbar_color_three", e.target.value)}
                />
            </ColorLabel>
            <ColorLabel>
                <ColorLabelText>Fourth Color</ColorLabelText>
                <ColorInput
                    type="color"
                    value={config.heatbar_color_four}
                    onChange={(e) => handleConfigChange("heatbar_color_four", e.target.value)}
                />
            </ColorLabel>
            <ColorLabel>
                <ColorLabelText>Fifth Color</ColorLabelText>
                <ColorInput
                    type="color"
                    value={config.heatbar_color_five}
                    onChange={(e) => handleConfigChange("heatbar_color_five", e.target.value)}
                />
            </ColorLabel>
            <ColorLabel>
                <ColorLabelText>Sixth Color</ColorLabelText>
                <ColorInput
                    type="color"
                    value={config.heatbar_color_six}
                    onChange={(e) => handleConfigChange("heatbar_color_six", e.target.value)}
                />
            </ColorLabel>
            <ColorLabel>
                <ColorLabelText>Seventh Color</ColorLabelText>
                <ColorInput
                    type="color"
                    value={config.heatbar_color_seven}
                    onChange={(e) => handleConfigChange("heatbar_color_seven", e.target.value)}
                />
            </ColorLabel>
            <ColorLabel>
                <ColorLabelText>Eighth Color</ColorLabelText>
                <ColorInput
                    type="color"
                    value={config.heatbar_color_eight}
                    onChange={(e) => handleConfigChange("heatbar_color_eight", e.target.value)}
                />
            </ColorLabel>
            <ColorLabel>
                <ColorLabelText>Nineth Color</ColorLabelText>
                <ColorInput
                    type="color"
                    value={config.heatbar_color_nine}
                    onChange={(e) => handleConfigChange("heatbar_color_nine", e.target.value)}
                />
            </ColorLabel>
            <ColorLabel>
                <ColorLabelText>Tenth Color</ColorLabelText>
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
