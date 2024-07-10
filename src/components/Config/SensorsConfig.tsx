import React from "react";
import useSensorsConfig from "../../hooks/Sensors/useSensorsConfig";
import {
    ConfigContainer,
    Title,
    Separator,
    ColorInput,
    Label,
    Input,
    ColorLabel,
    ColorLabelText
} from "./Styles/style";

interface SensorsConfig {
    sensors_update_time: number;
    sensors_background_color: string;
    sensors_foreground_color: string;
    sensors_boxes_background_color: string;
    sensors_boxes_foreground_color: string;
    sensors_boxes_title_foreground_color: string;
    sensors_battery_background_color: string;
    sensors_battery_frame_color: string;
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
            <ColorLabel>
                <ColorLabelText>Background Color</ColorLabelText>
                <ColorInput
                    type="color"
                    value={config.sensors_background_color}
                    onChange={(e) => handleConfigChange("sensors_background_color", e.target.value)}
                />
            </ColorLabel>
            <ColorLabel>
                <ColorLabelText>Foreground Color</ColorLabelText>
                <ColorInput
                    type="color"
                    value={config.sensors_foreground_color}
                    onChange={(e) => handleConfigChange("sensors_foreground_color", e.target.value)}
                />
            </ColorLabel>
            <ColorLabel>
                <ColorLabelText>Boxes Background Color</ColorLabelText>
                <ColorInput
                    type="color"
                    value={config.sensors_boxes_background_color}
                    onChange={(e) => handleConfigChange("sensors_boxes_background_color", e.target.value)}
                />
            </ColorLabel>
            <ColorLabel>
                <ColorLabelText>Boxes Foreground Color</ColorLabelText>
                <ColorInput
                    type="color"
                    value={config.sensors_boxes_foreground_color}
                    onChange={(e) => handleConfigChange("sensors_boxes_foreground_color", e.target.value)}
                />
            </ColorLabel>
            <ColorLabel>
                <ColorLabelText>Boxes Title Foreground Color</ColorLabelText>
                <ColorInput
                    type="color"
                    value={config.sensors_boxes_title_foreground_color}
                    onChange={(e) => handleConfigChange("sensors_boxes_title_foreground_color", e.target.value)}
                />
            </ColorLabel>
            <ColorLabel>
                <ColorLabelText>Battery Usage Background Color</ColorLabelText>
                <ColorInput
                    type="color"
                    value={config.sensors_battery_background_color}
                    onChange={(e) => handleConfigChange("sensors_battery_background_color", e.target.value)}
                />
            </ColorLabel>
            <ColorLabel>
                <ColorLabelText>Battery Frame Background Color</ColorLabelText>
                <ColorInput
                    type="color"
                    value={config.sensors_battery_frame_color}
                    onChange={(e) => handleConfigChange("sensors_battery_frame_color", e.target.value)}
                />
            </ColorLabel>
        </ConfigContainer>
    );
};

export default SensorsConfig;
