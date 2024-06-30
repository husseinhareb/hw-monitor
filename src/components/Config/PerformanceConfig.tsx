import React from "react";
import usePerformanceConfig from "../../hooks/usePerformanceConfig";
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

interface PerformanceConfig {
    performance_update_time: number;
    performance_sidebar_background_color: string;
    performance_sidebar_color: string;
    performance_sidebar_selected_color: string;
    performance_background_color: string;
    performance_title_color: string;
    performance_label_color: string;
    performance_value_color: string;
    performance_graph_color: string;
    performance_sec_graph_color: string;
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
                    value={config.performance_update_time}
                    min={1000}
                    step={100}
                    onChange={(e) => handleConfigChange("performance_update_time", Number(e.target.value))}
                />
            </Label>
            <h3>Sidebar</h3>
            <Separator />
            <ColorLabel>
                <ColorLabelText>Background Color</ColorLabelText>
                <ColorInput
                    type="color"
                    value={config.performance_sidebar_background_color}
                    onChange={(e) => handleConfigChange("performance_sidebar_background_color", e.target.value)}
                />
            </ColorLabel>
            <ColorLabel>
                <ColorLabelText>Foreground Color</ColorLabelText>
                <ColorInput
                    type="color"
                    value={config.performance_sidebar_color}
                    onChange={(e) => handleConfigChange("performance_sidebar_color", e.target.value)}
                />
            </ColorLabel>
            <ColorLabel>
                <ColorLabelText>Selected Foreground Color</ColorLabelText>
                <ColorInput
                    type="color"
                    value={config.performance_sidebar_selected_color}
                    onChange={(e) => handleConfigChange("performance_sidebar_selected_color", e.target.value)}
                />
            </ColorLabel>
            <h3>Content</h3>
            <Separator />
            <ColorLabel>
                <ColorLabelText>Background Color</ColorLabelText>
                <ColorInput
                    type="color"
                    value={config.performance_background_color}
                    onChange={(e) => handleConfigChange("performance_background_color", e.target.value)}
                />
            </ColorLabel>
            <ColorLabel>
                <ColorLabelText>Label Color</ColorLabelText>
                <ColorInput
                    type="color"
                    value={config.performance_label_color}
                    onChange={(e) => handleConfigChange("performance_label_color", e.target.value)}
                />
            </ColorLabel>
            <ColorLabel>
                <ColorLabelText>Value Color</ColorLabelText>
                <ColorInput
                    type="color"
                    value={config.performance_value_color}
                    onChange={(e) => handleConfigChange("performance_value_color", e.target.value)}
                />
            </ColorLabel>
            <ColorLabel>
                <ColorLabelText>Title Color</ColorLabelText>
                <ColorInput
                    type="color"
                    value={config.performance_title_color}
                    onChange={(e) => handleConfigChange("performance_title_color", e.target.value)}
                />
            </ColorLabel>
            <ColorLabel>
                <ColorLabelText>Graph Color</ColorLabelText>
                <ColorInput
                    type="color"
                    value={config.performance_graph_color}
                    onChange={(e) => handleConfigChange("performance_graph_color", e.target.value)}
                />
            </ColorLabel>
            <ColorLabel>
                <ColorLabelText>Second Graph Color</ColorLabelText>
                <ColorInput
                    type="color"
                    value={config.performance_sec_graph_color}
                    onChange={(e) => handleConfigChange("performance_sec_graph_color", e.target.value)}
                />
            </ColorLabel>
        </ConfigContainer>
    );
};

export default PerformanceConfig;
