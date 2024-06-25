import React from "react";
import useSensorsConfig from "../../hooks/useSensorsConfig";
import {
    ConfigContainer,
    Title,
    Separator,
    ColorInput,
    Label,
    Input,
} from "./Styles/style";

interface SensorsConfig {
    sensors_update_time: number;
    sensors_background_color: string;
    sensors_foreground_color: string;
    sensors_boxes_background_color: string;
    sensors_boxes_foreground_color: string;
    sensors_boxes_title_foreground_color: string;
    sensors_battery_background_color: string;
}

const SensorsConfig: React.FC = () => {
    const { config, updateConfig } = useSensorsConfig();

    const handleConfigChange = (key: keyof SensorsConfig, value: string | number) => {
        if (config) {
            updateConfig(key, value);
        }
    };

    return (
        <ConfigContainer>
            <Title>Sensors Config</Title>
            <Separator />
            <Label>
                Update Time
                <Input
                    type="number"
                    value={config.sensors_update_time}
                    min={1000}
                    step={100}
                    onChange={(e) => handleConfigChange("sensors_update_time", Number(e.target.value))}
                />
            </Label>
            <Label>
                Background Color
                <ColorInput
                    type="color"
                    value={config.sensors_background_color}
                    onChange={(e) => handleConfigChange("sensors_background_color", e.target.value)}
                />
            </Label>
            <Label>
                Foreground Color
                <ColorInput
                    type="color"
                    value={config.sensors_foreground_color}
                    onChange={(e) => handleConfigChange("sensors_foreground_color", e.target.value)}
                />
            </Label>
            <Label>
                Boxes Background Color
                <ColorInput
                    type="color"
                    value={config.sensors_boxes_background_color}
                    onChange={(e) => handleConfigChange("sensors_boxes_background_color", e.target.value)}
                />
            </Label>
            <Label>
                Boxes Foreground Color
                <ColorInput
                    type="color"
                    value={config.sensors_boxes_foreground_color}
                    onChange={(e) => handleConfigChange("sensors_boxes_foreground_color", e.target.value)}
                />
            </Label>
            <Label>
                Boxes Title Foreground Color
                <ColorInput
                    type="color"
                    value={config.sensors_boxes_title_foreground_color}
                    onChange={(e) => handleConfigChange("sensors_boxes_title_foreground_color", e.target.value)}
                />
            </Label>
            <Label>
                Battery Background Color
                <ColorInput
                    type="color"
                    value={config.sensors_battery_background_color}
                    onChange={(e) => handleConfigChange("sensors_battery_background_color", e.target.value)}
                />
            </Label>
        </ConfigContainer>
    );
};

export default SensorsConfig;
