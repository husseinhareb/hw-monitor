import React from "react";
import usePerformanceConfig from "../../hooks/Performance/usePerformanceConfig";
import { useTranslation } from "react-i18next";

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
    show_virtual_interfaces: boolean;
    performance_scrollbar_color: string;
}

const PerformanceConfig: React.FC = () => {
    const { config, updateConfig } = usePerformanceConfig();
    const { t } = useTranslation();

    const handleConfigChange = (key: keyof PerformanceConfig, value: string | number | boolean) => {
        if (config) {
            updateConfig(key, value);
        }
    };

    const handleUpdateTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = Number(e.target.value);
        if (value >= 1000) {
            handleConfigChange("performance_update_time", value);
        }
    };

    return (
        <div>
            <h2>{t('performance_config.title')}</h2>
            <hr />
            <label>
                {t('performance_config.update_time')}
                <input
                    type="number"
                    value={config.performance_update_time}
                    min={1000}
                    step={100}
                    onChange={handleUpdateTimeChange}
                />
            </label>
            <h3>{t('performance_config.sidebar')}</h3>
            <hr />
            <label>
                <span>{t('performance_config.sidebar_background_color')}</span>
                <input type="color" value={config.performance_sidebar_background_color} onChange={(e) => handleConfigChange("performance_sidebar_background_color", e.target.value)} />
            </label>
            <label>
                <span>{t('performance_config.sidebar_color')}</span>
                <input type="color" value={config.performance_sidebar_color} onChange={(e) => handleConfigChange("performance_sidebar_color", e.target.value)} />
            </label>
            <label>
                <span>{t('performance_config.sidebar_selected_color')}</span>
                <input type="color" value={config.performance_sidebar_selected_color} onChange={(e) => handleConfigChange("performance_sidebar_selected_color", e.target.value)} />
            </label>
            <h3>{t('performance_config.content')}</h3>
            <hr />
            <label>
                <span>{t('performance_config.background_color')}</span>
                <input type="color" value={config.performance_background_color} onChange={(e) => handleConfigChange("performance_background_color", e.target.value)} />
            </label>
            <label>
                <span>{t('performance_config.label_color')}</span>
                <input type="color" value={config.performance_label_color} onChange={(e) => handleConfigChange("performance_label_color", e.target.value)} />
            </label>
            <label>
                <span>{t('performance_config.value_color')}</span>
                <input type="color" value={config.performance_value_color} onChange={(e) => handleConfigChange("performance_value_color", e.target.value)} />
            </label>
            <label>
                <span>{t('performance_config.title_color')}</span>
                <input type="color" value={config.performance_title_color} onChange={(e) => handleConfigChange("performance_title_color", e.target.value)} />
            </label>
            <label>
                <span>{t('performance_config.graph_color')}</span>
                <input type="color" value={config.performance_graph_color} onChange={(e) => handleConfigChange("performance_graph_color", e.target.value)} />
            </label>
            <label>
                <span>{t('performance_config.sec_graph_color')}</span>
                <input type="color" value={config.performance_sec_graph_color} onChange={(e) => handleConfigChange("performance_sec_graph_color", e.target.value)} />
            </label>
            <h3>{t('performance_config.network')}</h3>
            <hr />
            <label>
                <input
                    type="checkbox"
                    checked={config.show_virtual_interfaces}
                    onChange={() => handleConfigChange("show_virtual_interfaces", !config.show_virtual_interfaces)}
                />
                {t('performance_config.show_virtual_interfaces')}
            </label>
            <label>
                <span>{t('performance_config.scrollbar_color')}</span>
                <input type="color" value={config.performance_scrollbar_color} onChange={(e) => handleConfigChange("performance_scrollbar_color", e.target.value)} />
            </label>
        </div>
    );
};

export default PerformanceConfig;
