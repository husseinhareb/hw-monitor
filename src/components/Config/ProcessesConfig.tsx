import React, { useState, useEffect } from "react";
import useProcessConfig from "../../hooks/Proc/useProcessConfig";
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
    processes_border_color: string;
    processes_tree_toggle_color: string;
    processes_monitor_border_color: string;
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
        <div>
            <h2>{t('processes_config.title')}</h2>
            <hr />
            <label>
                {t('processes_config.update_time')}
                <input
                    type="number"
                    value={config.processes_update_time}
                    min={1000}
                    step={100}
                    onChange={handleUpdateTimeChange}
                />
            </label>
            <label>
                <span>{t('processes_config.body_background_color')}</span>
                <input type="color" value={config.processes_body_background_color} onChange={(e) => handleConfigChange("processes_body_background_color", e.target.value)} />
            </label>
            <label>
                <span>{t('processes_config.body_color')}</span>
                <input type="color" value={config.processes_body_color} onChange={(e) => handleConfigChange("processes_body_color", e.target.value)} />
            </label>
            <label>
                <span>{t('processes_config.head_background_color')}</span>
                <input type="color" value={config.processes_head_background_color} onChange={(e) => handleConfigChange("processes_head_background_color", e.target.value)} />
            </label>
            <label>
                <span>{t('processes_config.head_color')}</span>
                <input type="color" value={config.processes_head_color} onChange={(e) => handleConfigChange("processes_head_color", e.target.value)} />
            </label>
            <label>
                <span>{t('processes_config.border_color')}</span>
                <input type="color" value={config.processes_border_color} onChange={(e) => handleConfigChange("processes_border_color", e.target.value)} />
            </label>
            <label>
                <span>{t('processes_config.tree_toggle_color')}</span>
                <input type="color" value={config.processes_tree_toggle_color} onChange={(e) => handleConfigChange("processes_tree_toggle_color", e.target.value)} />
            </label>
            <label>
                <span>{t('processes_config.monitor_border_color')}</span>
                <input type="color" value={config.processes_monitor_border_color} onChange={(e) => handleConfigChange("processes_monitor_border_color", e.target.value)} />
            </label>
            <h3>{t('processes_config.table_values')}</h3>
            <div style={{ display: 'flex' }}>
                <div>
                    {firstHalf.map((translationKey) => (
                        <div key={translationKey}>
                            <input
                                id={translationKey}
                                type="checkbox"
                                checked={selectedValues.includes(translationMap[translationKey])}
                                onChange={() => handleTableValueChange(translationKey)}
                            />
                            <label htmlFor={translationKey}>{t(translationKey)}</label>
                        </div>
                    ))}
                </div>
                <div>
                    {secondHalf.map((translationKey) => (
                        <div key={translationKey}>
                            <input
                                id={translationKey}
                                type="checkbox"
                                checked={selectedValues.includes(translationMap[translationKey])}
                                onChange={() => handleTableValueChange(translationKey)}
                            />
                            <label htmlFor={translationKey}>{t(translationKey)}</label>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ProcessesConfig;
