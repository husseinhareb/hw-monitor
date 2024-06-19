//ProcessesConfig.tsx
import React, { useState, useEffect } from "react";
import useProcessConfig from "../../hooks/useProcessConfig";
import { useProcessesConfig } from "../../services/store";

interface ProcessConfig {
    update_time: number;
    body_background_color: string;
    body_color: string;
    head_background_color: string;
    head_color: string;
    table_values: string[];
}

const ProcessesConfig: React.FC = () => {
    const { config, updateConfig, updateTableValues } = useProcessConfig();
    const [selectedValues, setSelectedValues] = useState<string[]>([]);
    const processesConfig = useProcessesConfig();

    useEffect(() => {
        if (processesConfig && processesConfig.table_values) {
            setSelectedValues(processesConfig.table_values);
        }
    }, [processesConfig]);

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
        <div>
            <h2>Processes</h2>
            <hr />
            <p>Update Time</p>
            <input
                type="number"
                value={config.update_time}
                min={1000}
                step={100}
                onChange={(e) => handleConfigChange("update_time", Number(e.target.value))}
            />
            <p>Body Background Color</p>
            <input
                type="color"
                value={config.body_background_color}
                onChange={(e) => handleConfigChange("body_background_color", e.target.value)}
            />
            <p>Body Color</p>
            <input
                type="color"
                value={config.body_color}
                onChange={(e) => handleConfigChange("body_color", e.target.value)}
            />
            <p>Head Background Color</p>
            <input
                type="color"
                value={config.head_background_color}
                onChange={(e) => handleConfigChange("head_background_color", e.target.value)}
            />
            <p>Head Color</p>
            <input
                type="color"
                value={config.head_color}
                onChange={(e) => handleConfigChange("head_color", e.target.value)}
            />
            <div>
                <h3>Table Values</h3>
                {["user", "pid", "ppid", "name", "state", "memory", "cpu", "diskReadTotal", "diskWriteTotal", "diskReadSpeed", "diskWriteSpeed"].map((value) => (
                    <label key={value}>
                        <input
                            type="checkbox"
                            value={value}
                            checked={selectedValues.includes(value)}
                            onChange={() => handleTableValueChange(value)}
                        />
                        {value}
                    </label>
                ))}
            </div>
        </div>
    );
};

export default ProcessesConfig;
