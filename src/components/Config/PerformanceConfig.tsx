import React from "react";
import usePerformanceConfig from "../../hooks/usePerformanceConfig";
import {
    ConfigContainer,
    Title,
    Separator,
    ColorInput,
    Label,
    Input,
} from "./Styles/style";

interface PerformanceConfig {
    update_time: number;
    body_background_color: string;
    body_color: string;
    head_background_color: string;
    head_color: string;
}

const PerformanceConfig: React.FC = () => {
    const { config, updateConfig } = usePerformanceConfig();

    const handleConfigChange = (key: keyof PerformanceConfig, value: string | number) => {
        if (config) {
            updateConfig(key, value);
        }
    };

    return (
        <ConfigContainer>
            <Title>Performance Config</Title>
            <Separator />
            <Label>
                Update Time
                <Input
                    type="number"
                    value={config.update_time}
                    min={1000}
                    step={100}
                    onChange={(e) => handleConfigChange("update_time", Number(e.target.value))}
                />
            </Label>
            <h2>Sidebar</h2>
            <Separator />
            <Label>
                Background Color
                <ColorInput
                    type="color"
                    value={config.body_background_color}
                    onChange={(e) => handleConfigChange("body_background_color", e.target.value)}
                />
            </Label>
            <Label>
                Color
                <ColorInput
                    type="color"
                    value={config.body_color}
                    onChange={(e) => handleConfigChange("body_color", e.target.value)}
                />
            </Label>
            <h2>Others</h2>
            <Separator />
            <Label>
                Background Color
                <ColorInput
                    type="color"
                    value={config.head_background_color}
                    onChange={(e) => handleConfigChange("head_background_color", e.target.value)}
                />
            </Label>
            <Label>
                Label Color
                <ColorInput
                    type="color"
                    value={config.head_color}
                    onChange={(e) => handleConfigChange("head_color", e.target.value)}
                />
            </Label>
            <Label>
                Value Color
                <ColorInput
                    type="color"
                    value={config.head_color}
                    onChange={(e) => handleConfigChange("head_color", e.target.value)}
                />
            </Label>
            <Label>
                Graph Color
                <ColorInput
                    type="color"
                    value={config.head_color}
                    onChange={(e) => handleConfigChange("head_color", e.target.value)}
                />
            </Label>
            <Label>
                Second Graph Color
                <ColorInput
                    type="color"
                    value={config.head_color}
                    onChange={(e) => handleConfigChange("head_color", e.target.value)}
                />
            </Label>
        </ConfigContainer>
    );
};

export default PerformanceConfig;
