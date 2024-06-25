import React from "react";
import useDisksConfig from "../../hooks/useDisksConfig";
import {
    ConfigContainer,
    Title,
    Separator,
    ColorInput,
    Label,
    Input,
} from "./Styles/style";


interface DisksConfig {
    disks_update_time: number;
    disks_background_color: string;
    disks_foreground_color: string;
    disks_group_background_color: string;
    disks_group_foreground_color: string;
}



const DisksConfig: React.FC = () => {
    const { config, updateConfig } = useDisksConfig();

    const handleConfigChange = (key: keyof DisksConfig, value: string | number) => {
        if (config) {
            updateConfig(key, value);
        }
    };

    return (
        <ConfigContainer>
            <Title>disks Config</Title>
            <Separator />
            <Label>
                Update Time
                <Input
                    type="number"
                    value={config.disks_update_time}
                    min={1000}
                    step={100}
                    onChange={(e) => handleConfigChange("disks_update_time", Number(e.target.value))}
                />
            </Label>
            <Label>
                Background Color
                <ColorInput
                    type="color"
                    value={config.disks_background_color}
                    onChange={(e) => handleConfigChange("disks_background_color", e.target.value)}
                />
            </Label>
            <Label>
                Body Color
                <ColorInput
                    type="color"
                    value={config.disks_foreground_color}
                    onChange={(e) => handleConfigChange("disks_foreground_color", e.target.value)}
                />
            </Label>
            <Label>
                Box Background Color
                <ColorInput
                    type="color"
                    value={config.disks_group_background_color}
                    onChange={(e) => handleConfigChange("disks_group_background_color", e.target.value)}
                />
            </Label>
            <Label>
                Box foreground Color
                <ColorInput
                    type="color"
                    value={config.disks_group_foreground_color}
                    onChange={(e) => handleConfigChange("disks_group_foreground_color", e.target.value)}
                />
            </Label>
        </ConfigContainer>
    );
};

export default DisksConfig;
