import React, { useState, useEffect } from "react";
import useProcessConfig from "../../hooks/useProcessConfig";
import {
    ConfigContainer,
    Title,
    Separator,
    CheckboxInput,
    CheckboxLabel,
    ColorInput,
    Label,
    Input,
    SectionTitle
} from "./Styles/style";


interface ProcessConfig {
    update_time: number;
    body_background_color: string;
    body_color: string;
    head_background_color: string;
    head_color: string;
    table_values: string[];
}



const DisksConfig: React.FC = () => {
    const { config, updateConfig, updateTableValues } = useProcessConfig();
    const [selectedValues, setSelectedValues] = useState<string[]>([]);

    useEffect(() => {
        if (config && config.table_values) {
            setSelectedValues(config.table_values);
        }
    }, [config]);

    const handleTableValueChange = (value: string) => {
        setSelectedValues((prevValues) => {
            const newValues = prevValues.includes(value)
                ? prevValues.filter((v) => v !== value)
                : [...prevValues, value];
            updateTableValues(newValues);
            return newValues;
        });
    };

    const handleConfigChange = (key: keyof ProcessConfig, value: string | number) => {
        if (config) {
            updateConfig(key, value);
        }
    };

    return (
        <ConfigContainer>
            <Title>Disk Config</Title>
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
            <Label>
                Body Background Color
                <ColorInput
                    type="color"
                    value={config.body_background_color}
                    onChange={(e) => handleConfigChange("body_background_color", e.target.value)}
                />
            </Label>
            <Label>
                Body Color
                <ColorInput
                    type="color"
                    value={config.body_color}
                    onChange={(e) => handleConfigChange("body_color", e.target.value)}
                />
            </Label>
            <Label>
                Head Background Color
                <ColorInput
                    type="color"
                    value={config.head_background_color}
                    onChange={(e) => handleConfigChange("head_background_color", e.target.value)}
                />
            </Label>
            <Label>
                Head Color
                <ColorInput
                    type="color"
                    value={config.head_color}
                    onChange={(e) => handleConfigChange("head_color", e.target.value)}
                />
            </Label>
            <SectionTitle>Table Values</SectionTitle>
            {["user", "pid", "ppid", "name", "state", "memory", "cpu_usage", "read_disk_usage", "write_disk_usage", "read_disk_speed", "write_disk_speed"].map((value) => (
                <CheckboxLabel key={value}>
                    <CheckboxInput
                        type="checkbox"
                        value={value}
                        checked={selectedValues.includes(value)}
                        onChange={() => handleTableValueChange(value)}
                    />
                    {value}
                </CheckboxLabel>
            ))}
        </ConfigContainer>
    );
};

export default DisksConfig;
