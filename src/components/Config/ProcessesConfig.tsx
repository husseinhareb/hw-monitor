import React, { useState, useEffect } from "react";
import useProcessConfig from "../../hooks/Proc/useProcessConfig";
import {
    ConfigContainer,
    Title,
    Separator,
    ColorInput,
    Label,
    Input,
    SectionTitle,
    CheckboxContainer,
    Column,
    ColorLabel,
    ColorLabelText,
    CheckboxWrapper,
} from "./Styles/style";
import { useTranslation } from "react-i18next";

// Translation keys for the table values
const tableValues = [
    "processes_config.table_value_user",
    "processes_config.table_value_pid",
    "processes_config.table_value_ppid",
    "processes_config.table_value_name",
    "processes_config.table_value_state",
    "processes_config.table_value_memory",
    "processes_config.table_value_cpu_usage",
    "processes_config.table_value_read_disk_usage",
    "processes_config.table_value_write_disk_usage",
    "processes_config.table_value_read_disk_speed",
    "processes_config.table_value_write_disk_speed"
];

// Map of translation keys to original values
const translationMap: Record<string, string> = {
    "processes_config.table_value_user": "user",
    "processes_config.table_value_pid": "pid",
    "processes_config.table_value_ppid": "ppid",
    "processes_config.table_value_name": "name",
    "processes_config.table_value_state": "state",
    "processes_config.table_value_memory": "memory",
    "processes_config.table_value_cpu_usage": "cpu_usage",
    "processes_config.table_value_read_disk_usage": "read_disk_usage",
    "processes_config.table_value_write_disk_usage": "write_disk_usage",
    "processes_config.table_value_read_disk_speed": "read_disk_speed",
    "processes_config.table_value_write_disk_speed": "write_disk_speed",
};

interface ProcessConfig {
    processes_update_time: number;
    processes_body_background_color: string;
    processes_body_color: string;
    processes_head_background_color: string;
    processes_head_color: string;
    processes_table_values: string[];
}

const ProcessesConfig: React.FC = () => {
    const { config, updateConfig, updateTableValues } = useProcessConfig();
    const [selectedValues, setSelectedValues] = useState<string[]>([]);
    const { t } = useTranslation();

    useEffect(() => {
        if (config && config.processes_table_values) {
            setSelectedValues(config.processes_table_values);
        }
    }, [config]);

    const handleTableValueChange = (translationKey: string) => {
        const originalValue = translationMap[translationKey]; // Map back to original value
        setSelectedValues((prevValues) => {
            const newValues = prevValues.includes(originalValue)
                ? prevValues.filter((v) => v !== originalValue)
                : [...prevValues, originalValue];
            updateTableValues(newValues);
            return newValues;
        });
    };

    const handleConfigChange = (key: keyof ProcessConfig, value: string | number) => {
        if (config) {
            updateConfig(key, value);
        }
    };

    const handleUpdateTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = Number(e.target.value);
        if (value >= 1000) {
            handleConfigChange("processes_update_time", value);
        }
    };

    // Split table values into two halves
    const half = Math.ceil(tableValues.length / 2);
    const firstHalf = tableValues.slice(0, half);
    const secondHalf = tableValues.slice(half);

    return (
        <ConfigContainer>
            <Title>{t('processes_config.title')}</Title>
            <Separator />
            <Label>
                {t('processes_config.update_time')}
                <Input
                    type="number"
                    value={config.processes_update_time}
                    min={1000}
                    step={100}
                    onChange={handleUpdateTimeChange}
                />
            </Label>
            <ColorLabel>
                <ColorLabelText>{t('processes_config.body_background_color')}</ColorLabelText>
                <ColorInput
                    type="color"
                    value={config.processes_body_background_color}
                    onChange={(e) => handleConfigChange("processes_body_background_color", e.target.value)}
                />
            </ColorLabel>
            <ColorLabel>
                <ColorLabelText>{t('processes_config.body_color')}</ColorLabelText>
                <ColorInput
                    type="color"
                    value={config.processes_body_color}
                    onChange={(e) => handleConfigChange("processes_body_color", e.target.value)}
                />
            </ColorLabel>
            <ColorLabel>
                <ColorLabelText>{t('processes_config.head_background_color')}</ColorLabelText>
                <ColorInput
                    type="color"
                    value={config.processes_head_background_color}
                    onChange={(e) => handleConfigChange("processes_head_background_color", e.target.value)}
                />
            </ColorLabel>
            <ColorLabel>
                <ColorLabelText>{t('processes_config.head_color')}</ColorLabelText>
                <ColorInput
                    type="color"
                    value={config.processes_head_color}
                    onChange={(e) => handleConfigChange("processes_head_color", e.target.value)}
                />
            </ColorLabel>
            <SectionTitle>{t('processes_config.table_values')}</SectionTitle>
            <CheckboxContainer>
                <Column>
                    {firstHalf.map((translationKey) => (
                        <CheckboxWrapper className="checkbox-wrapper-4" key={translationKey}>
                            <input
                                className="inp-cbx"
                                id={translationKey}
                                type="checkbox"
                                checked={selectedValues.includes(translationMap[translationKey])} // Check based on original value
                                onChange={() => handleTableValueChange(translationKey)}
                            />
                            <label className="cbx" htmlFor={translationKey}>
                                <span>
                                    <svg width="12px" height="10px">
                                        <use xlinkHref="#check-4"></use>
                                    </svg>
                                </span>
                                {/* Translate the value using t */}
                                <span>{t(translationKey)}</span>
                            </label>
                            <svg className="inline-svg">
                                <symbol id="check-4" viewBox="0 0 12 10">
                                    <polyline points="1.5 6 4.5 9 10.5 1"></polyline>
                                </symbol>
                            </svg>
                        </CheckboxWrapper>
                    ))}
                </Column>
                <Column>
                    {secondHalf.map((translationKey) => (
                        <CheckboxWrapper className="checkbox-wrapper-4" key={translationKey}>
                            <input
                                className="inp-cbx"
                                id={translationKey}
                                type="checkbox"
                                checked={selectedValues.includes(translationMap[translationKey])} // Check based on original value
                                onChange={() => handleTableValueChange(translationKey)}
                            />
                            <label className="cbx" htmlFor={translationKey}>
                                <span>
                                    <svg width="12px" height="10px">
                                        <use xlinkHref="#check-4"></use>
                                    </svg>
                                </span>
                                {/* Translate the value using t */}
                                <span>{t(translationKey)}</span>
                            </label>
                            <svg className="inline-svg">
                                <symbol id="check-4" viewBox="0 0 12 10">
                                    <polyline points="1.5 6 4.5 9 10.5 1"></polyline>
                                </symbol>
                            </svg>
                        </CheckboxWrapper>
                    ))}
                </Column>
            </CheckboxContainer>
        </ConfigContainer>
    );
};

export default ProcessesConfig;
