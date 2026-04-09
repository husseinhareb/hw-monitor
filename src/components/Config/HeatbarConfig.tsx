import React from "react";
import useHeatbarConfig from "../../hooks/Sensors/useHeatbarConfig";
import { useTranslation } from "react-i18next";

interface HeatbarConfig {
    heatbar_color_one: string;
    heatbar_color_two: string;
    heatbar_color_three: string;
    heatbar_color_four: string;
    heatbar_color_five: string;
    heatbar_color_six: string;
    heatbar_color_seven: string;
    heatbar_color_eight: string;
    heatbar_color_nine: string;
    heatbar_color_ten: string;
    heatbar_background_color: string;
}

const HeatbarConfig: React.FC = () => {
    const { config, updateConfig } = useHeatbarConfig();
    const { t } = useTranslation();

    const handleConfigChange = (key: keyof HeatbarConfig, value: string) => {
        if (config) {
            updateConfig(key, value);
        }
    };

    return (
        <div>
            <h2>{t('heatbar_config.title')}</h2>
            <hr />
            <label>
                <span>{t('heatbar_config.color_one')}</span>
                <input type="color" value={config.heatbar_color_one} onChange={(e) => handleConfigChange("heatbar_color_one", e.target.value)} />
            </label>
            <label>
                <span>{t('heatbar_config.color_two')}</span>
                <input type="color" value={config.heatbar_color_two} onChange={(e) => handleConfigChange("heatbar_color_two", e.target.value)} />
            </label>
            <label>
                <span>{t('heatbar_config.color_three')}</span>
                <input type="color" value={config.heatbar_color_three} onChange={(e) => handleConfigChange("heatbar_color_three", e.target.value)} />
            </label>
            <label>
                <span>{t('heatbar_config.color_four')}</span>
                <input type="color" value={config.heatbar_color_four} onChange={(e) => handleConfigChange("heatbar_color_four", e.target.value)} />
            </label>
            <label>
                <span>{t('heatbar_config.color_five')}</span>
                <input type="color" value={config.heatbar_color_five} onChange={(e) => handleConfigChange("heatbar_color_five", e.target.value)} />
            </label>
            <label>
                <span>{t('heatbar_config.color_six')}</span>
                <input type="color" value={config.heatbar_color_six} onChange={(e) => handleConfigChange("heatbar_color_six", e.target.value)} />
            </label>
            <label>
                <span>{t('heatbar_config.color_seven')}</span>
                <input type="color" value={config.heatbar_color_seven} onChange={(e) => handleConfigChange("heatbar_color_seven", e.target.value)} />
            </label>
            <label>
                <span>{t('heatbar_config.color_eight')}</span>
                <input type="color" value={config.heatbar_color_eight} onChange={(e) => handleConfigChange("heatbar_color_eight", e.target.value)} />
            </label>
            <label>
                <span>{t('heatbar_config.color_nine')}</span>
                <input type="color" value={config.heatbar_color_nine} onChange={(e) => handleConfigChange("heatbar_color_nine", e.target.value)} />
            </label>
            <label>
                <span>{t('heatbar_config.color_ten')}</span>
                <input type="color" value={config.heatbar_color_ten} onChange={(e) => handleConfigChange("heatbar_color_ten", e.target.value)} />
            </label>
            <label>
                <span>{t('heatbar_config.background_color')}</span>
                <input type="color" value={config.heatbar_background_color} onChange={(e) => handleConfigChange("heatbar_background_color", e.target.value)} />
            </label>
        </div>
    );
};

export default HeatbarConfig;
