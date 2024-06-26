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
    SectionTitle,
    CheckboxContainer,
    Column,
    ColorLabel,
    ColorLabelText
} from "./Styles/style";

const tableValues = ["user", "pid", "ppid", "name", "state", "memory", "cpu_usage", "read_disk_usage", "write_disk_usage", "read_disk_speed", "write_disk_speed"];

const ProcessesConfig: React.FC = () => {
    const { config, updateConfig, updateTableValues } = useProcessConfig();
    const [selectedValues, setSelectedValues] = useState<string[]>([]);

    useEffect(() => {
        if (config && config.processes_table_values) {
            setSelectedValues(config.processes_table_values);
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

    // Split table values into two halves
    const half = Math.ceil(tableValues.length / 2);
    const firstHalf = tableValues.slice(0, half);
    const secondHalf = tableValues.slice(half);

    return (
        <ConfigContainer>
            <Title>Processes Config</Title>
            <Separator />
            <Label>
                Update Time
                <Input
                    type="number"
                    value={config.processes_update_time}
                    min={1000}
                    step={100}
                    onChange={(e) => handleConfigChange("processes_update_time", Number(e.target.value))}
                />
            </Label>
            <ColorLabel>
                <ColorLabelText>Body Background Color</ColorLabelText>
                <ColorInput
                    type="color"
                    value={config.processes_body_background_color}
                    onChange={(e) => handleConfigChange("processes_body_background_color", e.target.value)}
                />
            </ColorLabel>
            <ColorLabel>
                <ColorLabelText>Body Color</ColorLabelText>
                <ColorInput
                    type="color"
                    value={config.processes_body_color}
                    onChange={(e) => handleConfigChange("processes_body_color", e.target.value)}
                />
            </ColorLabel>
            <ColorLabel>
                <ColorLabelText>Head Background Color</ColorLabelText>
                <ColorInput
                    type="color"
                    value={config.processes_head_background_color}
                    onChange={(e) => handleConfigChange("processes_head_background_color", e.target.value)}
                />
            </ColorLabel>
            <ColorLabel>
                <ColorLabelText>Head Color</ColorLabelText>
                <ColorInput
                    type="color"
                    value={config.processes_head_color}
                    onChange={(e) => handleConfigChange("processes_head_color", e.target.value)}
                />
            </ColorLabel>
            <SectionTitle>Table Values</SectionTitle>
            <CheckboxContainer>
                <Column>
                    {firstHalf.map((value) => (
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
                </Column>
                <Column>
                    {secondHalf.map((value) => (
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
                </Column>
            </CheckboxContainer>
        </ConfigContainer>
    );
};

export default ProcessesConfig;
