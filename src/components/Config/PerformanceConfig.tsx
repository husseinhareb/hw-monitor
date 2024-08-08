import React from "react";
import usePerformanceConfig from "../../hooks/Performance/usePerformanceConfig";
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
}

const PerformanceConfig: React.FC = () => {
    const { config, updateConfig } = usePerformanceConfig();
    const { t } = useTranslation();

    const handleConfigChange = (key: keyof PerformanceConfig, value: string | number) => {
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
        <ConfigContainer>
            <Title>{t('performance_config.title')}</Title>
            <Separator />
            <Label>
                {t('performance_config.update_time')}
                <Input
                    type="number"
                    value={config.performance_update_time}
                    min={1000}
                    step={100}
                    onChange={handleUpdateTimeChange}
                />
            </Label>
            <h3>{t('performance_config.sidebar')}</h3>
            <Separator />
            <ColorLabel>
                <ColorLabelText>{t('performance_config.sidebar_background_color')}</ColorLabelText>
                <ColorInput
                    type="color"
                    value={config.performance_sidebar_background_color}
                    onChange={(e) => handleConfigChange("performance_sidebar_background_color", e.target.value)}
                />
            </ColorLabel>
            <ColorLabel>
                <ColorLabelText>{t('performance_config.sidebar_color')}</ColorLabelText>
                <ColorInput
                    type="color"
                    value={config.performance_sidebar_color}
                    onChange={(e) => handleConfigChange("performance_sidebar_color", e.target.value)}
                />
            </ColorLabel>
            <ColorLabel>
                <ColorLabelText>{t('performance_config.sidebar_selected_color')}</ColorLabelText>
                <ColorInput
                    type="color"
                    value={config.performance_sidebar_selected_color}
                    onChange={(e) => handleConfigChange("performance_sidebar_selected_color", e.target.value)}
                />
            </ColorLabel>
            <h3>{t('performance_config.content')}</h3>
            <Separator />
            <ColorLabel>
                <ColorLabelText>{t('performance_config.background_color')}</ColorLabelText>
                <ColorInput
                    type="color"
                    value={config.performance_background_color}
                    onChange={(e) => handleConfigChange("performance_background_color", e.target.value)}
                />
            </ColorLabel>
            <ColorLabel>
                <ColorLabelText>{t('performance_config.label_color')}</ColorLabelText>
                <ColorInput
                    type="color"
                    value={config.performance_label_color}
                    onChange={(e) => handleConfigChange("performance_label_color", e.target.value)}
                />
            </ColorLabel>
            <ColorLabel>
                <ColorLabelText>{t('performance_config.value_color')}</ColorLabelText>
                <ColorInput
                    type="color"
                    value={config.performance_value_color}
                    onChange={(e) => handleConfigChange("performance_value_color", e.target.value)}
                />
            </ColorLabel>
            <ColorLabel>
                <ColorLabelText>{t('performance_config.title_color')}</ColorLabelText>
                <ColorInput
                    type="color"
                    value={config.performance_title_color}
                    onChange={(e) => handleConfigChange("performance_title_color", e.target.value)}
                />
            </ColorLabel>
            <ColorLabel>
                <ColorLabelText>{t('performance_config.graph_color')}</ColorLabelText>
                <ColorInput
                    type="color"
                    value={config.performance_graph_color}
                    onChange={(e) => handleConfigChange("performance_graph_color", e.target.value)}
                />
            </ColorLabel>
            <ColorLabel>
                <ColorLabelText>{t('performance_config.sec_graph_color')}</ColorLabelText>
                <ColorInput
                    type="color"
                    value={config.performance_sec_graph_color}
                    onChange={(e) => handleConfigChange("performance_sec_graph_color", e.target.value)}
                />
            </ColorLabel>
        </ConfigContainer>
    );
};

export default PerformanceConfig;
