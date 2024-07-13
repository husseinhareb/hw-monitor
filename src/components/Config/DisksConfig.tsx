//DisksConfig.tsx
import React from "react";
import useDisksConfig from "../../hooks/Disks/useDisksConfig";
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

interface DisksConfig {
    disks_update_time: number;
    disks_background_color: string;
    disks_boxes_background_color: string;
    disks_name_foreground_color: string;
    disks_size_foreground_color: string;
    disks_partition_background_color: string;
    disks_partition_usage_background_color: string;
    disks_partition_name_foreground_color: string;
    disks_partition_type_foreground_color: string;
    disks_partition_usage_foreground_color: string;
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
            <Title>Disks Config</Title>
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
            <ColorLabel>
                <ColorLabelText>Background Color</ColorLabelText>
                <ColorInput
                    type="color"
                    value={config.disks_background_color}
                    onChange={(e) => handleConfigChange("disks_background_color", e.target.value)}
                />
            </ColorLabel>
            <ColorLabel>
                <ColorLabelText>Boxes Background Color</ColorLabelText>
                <ColorInput
                    type="color"
                    value={config.disks_boxes_background_color}
                    onChange={(e) => handleConfigChange("disks_boxes_background_color", e.target.value)}
                />
            </ColorLabel>
            <ColorLabel>
                <ColorLabelText>Name Foreground Color</ColorLabelText>
                <ColorInput
                    type="color"
                    value={config.disks_name_foreground_color}
                    onChange={(e) => handleConfigChange("disks_name_foreground_color", e.target.value)}
                />
            </ColorLabel>
            <ColorLabel>
                <ColorLabelText>Size Foreground Color</ColorLabelText>
                <ColorInput
                    type="color"
                    value={config.disks_size_foreground_color}
                    onChange={(e) => handleConfigChange("disks_size_foreground_color", e.target.value)}
                />
            </ColorLabel>
            <ColorLabel>
                <ColorLabelText>Partition Background Color</ColorLabelText>
                <ColorInput
                    type="color"
                    value={config.disks_partition_background_color}
                    onChange={(e) => handleConfigChange("disks_partition_background_color", e.target.value)}
                />
            </ColorLabel>
            <ColorLabel>
                <ColorLabelText>Partition Usage Background Color</ColorLabelText>
                <ColorInput
                    type="color"
                    value={config.disks_partition_usage_background_color}
                    onChange={(e) => handleConfigChange("disks_partition_usage_background_color", e.target.value)}
                />
            </ColorLabel>
            <ColorLabel>
                <ColorLabelText>Partition Name Foreground Color</ColorLabelText>
                <ColorInput
                    type="color"
                    value={config.disks_partition_name_foreground_color}
                    onChange={(e) => handleConfigChange("disks_partition_name_foreground_color", e.target.value)}
                />
            </ColorLabel>
            <ColorLabel>
                <ColorLabelText>Partition Type Foreground Color</ColorLabelText>
                <ColorInput
                    type="color"
                    value={config.disks_partition_type_foreground_color}
                    onChange={(e) => handleConfigChange("disks_partition_type_foreground_color", e.target.value)}
                />
            </ColorLabel>
            <ColorLabel>
                <ColorLabelText>Partition Usage Foreground Color</ColorLabelText>
                <ColorInput
                    type="color"
                    value={config.disks_partition_usage_foreground_color}
                    onChange={(e) => handleConfigChange("disks_partition_usage_foreground_color", e.target.value)}
                />
            </ColorLabel>
        </ConfigContainer>
    );
};

export default DisksConfig;
