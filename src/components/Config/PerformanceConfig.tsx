//PerformanceConfig.tsx
import React, { useState, useEffect } from "react";
import useProcessConfig from "../../hooks/useProcessConfig";

interface ProcessConfig {
    update_time: number;
    body_background_color: string;
    body_color: string;
    head_background_color: string;
    head_color: string;
    table_values: string[];
}

const PerformanceConfig: React.FC = () => {
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
                {["user", "pid", "ppid", "name", "state", "memory", "cpu_usage", "read_disk_usage", "write_disk_usage", "read_disk_speed", "write_disk_speed"].map((value) => (
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

export default PerformanceConfig;
