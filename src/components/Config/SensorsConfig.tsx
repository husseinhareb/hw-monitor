import React from "react";
import useSensorsConfig from "../../hooks/Sensors/useSensorsConfig";
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

interface SensorsConfig {
    sensors_update_time: number;
    sensors_background_color: string;
    sensors_foreground_color: string;
    sensors_boxes_background_color: string;
    sensors_boxes_foreground_color: string;
    sensors_boxes_title_foreground_color: string;
    sensors_battery_background_color: string;
    sensors_battery_frame_color: string;
}

const SensorsConfig: React.FC = () => {
    const { config, updateConfig } = useSensorsConfig();
    const { t } = useTranslation();

    const handleConfigChange = (key: keyof SensorsConfig, value: string | number) => {
        if (config) {
            updateConfig(key, value);
        }
    };

    const handleUpdateTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = Number(e.target.value);
        if (value >= 1000) {
            handleConfigChange("sensors_update_time", value);
        }
    };

    return (
        <ConfigContainer>
            <Title>{t('sensors_config.title')}</Title>
            <Separator />
            <Label>
                {t('sensors_config.update_time')}
                <Input
                    type="number"
                    value={config.sensors_update_time}
                    min={1000}
                    step={100}
                    onChange={handleUpdateTimeChange}
                />
            </Label>
            <ColorLabel>
                <ColorLabelText>{t('sensors_config.background_color')}</ColorLabelText>
                <ColorInput
                    type="color"
                    value={config.sensors_background_color}
                    onChange={(e) => handleConfigChange("sensors_background_color", e.target.value)}
                />
            </ColorLabel>
            <ColorLabel>
                <ColorLabelText>{t('sensors_config.foreground_color')}</ColorLabelText>
                <ColorInput
                    type="color"
                    value={config.sensors_foreground_color}
                    onChange={(e) => handleConfigChange("sensors_foreground_color", e.target.value)}
                />
            </ColorLabel>
            <ColorLabel>
                <ColorLabelText>{t('sensors_config.boxes_background_color')}</ColorLabelText>
                <ColorInput
                    type="color"
                    value={config.sensors_boxes_background_color}
                    onChange={(e) => handleConfigChange("sensors_boxes_background_color", e.target.value)}
                />
            </ColorLabel>
            <ColorLabel>
                <ColorLabelText>{t('sensors_config.boxes_foreground_color')}</ColorLabelText>
                <ColorInput
                    type="color"
                    value={config.sensors_boxes_foreground_color}
                    onChange={(e) => handleConfigChange("sensors_boxes_foreground_color", e.target.value)}
                />
            </ColorLabel>
            <ColorLabel>
                <ColorLabelText>{t('sensors_config.boxes_title_foreground_color')}</ColorLabelText>
                <ColorInput
                    type="color"
                    value={config.sensors_boxes_title_foreground_color}
                    onChange={(e) => handleConfigChange("sensors_boxes_title_foreground_color", e.target.value)}
                />
            </ColorLabel>
            <ColorLabel>
                <ColorLabelText>{t('sensors_config.battery_background_color')}</ColorLabelText>
                <ColorInput
                    type="color"
                    value={config.sensors_battery_background_color}
                    onChange={(e) => handleConfigChange("sensors_battery_background_color", e.target.value)}
                />
            </ColorLabel>
            <ColorLabel>
                <ColorLabelText>{t('sensors_config.battery_frame_color')}</ColorLabelText>
                <ColorInput
                    type="color"
                    value={config.sensors_battery_frame_color}
                    onChange={(e) => handleConfigChange("sensors_battery_frame_color", e.target.value)}
                />
            </ColorLabel>
        </ConfigContainer>
    );
};

export default SensorsConfig;
