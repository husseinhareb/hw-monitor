import React from "react";
import useDisksConfig from "../../hooks/Disks/useDisksConfig";
import { useTranslation } from "react-i18next";

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
    const { t } = useTranslation();
    const handleConfigChange = (key: keyof DisksConfig, value: string | number) => {
        if (config) {
            updateConfig(key, value);
        }
    };

    const handleUpdateTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = Number(e.target.value);
        if (value >= 1000) {
            handleConfigChange("disks_update_time", value);
        }
    };

    return (
        <div>
            <h2> {t('disks_config.title')}</h2>
            <hr />
            <label>
                {t('disks_config.update_time')}
                <input
                    type="number"
                    value={config.disks_update_time}
                    min={1000}
                    step={100}
                    onChange={handleUpdateTimeChange}
                />
            </label>
            <label>
                <span>{t('disks_config.background_color')}
                </span>
                <input type="color" value={config.disks_background_color} onChange={(e) => handleConfigChange("disks_background_color", e.target.value)} />
            </label>
            <label>
                <span>{t('disks_config.boxes_background_color')}</span>
                <input type="color" value={config.disks_boxes_background_color} onChange={(e) => handleConfigChange("disks_boxes_background_color", e.target.value)} />
            </label>
            <label>
                <span>{t('disks_config.name_foreground_color')}</span>
                <input type="color" value={config.disks_name_foreground_color} onChange={(e) => handleConfigChange("disks_name_foreground_color", e.target.value)} />
            </label>
            <label>
                <span>{t('disks_config.size_foreground_color')}</span>
                <input type="color" value={config.disks_size_foreground_color} onChange={(e) => handleConfigChange("disks_size_foreground_color", e.target.value)} />
            </label>
            <label>
                <span>{t('disks_config.partition_background_color')}</span>
                <input type="color" value={config.disks_partition_background_color} onChange={(e) => handleConfigChange("disks_partition_background_color", e.target.value)} />
            </label>
            <label>
                <span>{t('disks_config.partition_usage_background_color')}</span>
                <input type="color" value={config.disks_partition_usage_background_color} onChange={(e) => handleConfigChange("disks_partition_usage_background_color", e.target.value)} />
            </label>
            <label>
                <span>{t('disks_config.partition_name_foreground_color')}</span>
                <input type="color" value={config.disks_partition_name_foreground_color} onChange={(e) => handleConfigChange("disks_partition_name_foreground_color", e.target.value)} />
            </label>
            <label>
                <span>{t('disks_config.partition_type_foreground_color')}</span>
                <input type="color" value={config.disks_partition_type_foreground_color} onChange={(e) => handleConfigChange("disks_partition_type_foreground_color", e.target.value)} />
            </label>
            <label>
                <span>{t('disks_config.partition_usage_foreground_color')}</span>
                <input type="color" value={config.disks_partition_usage_foreground_color} onChange={(e) => handleConfigChange("disks_partition_usage_foreground_color", e.target.value)} />
            </label>
        </div>
    );
};

export default DisksConfig;
