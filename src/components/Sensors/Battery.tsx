//Battery.tsx
import React from 'react';
import type { BatteryData } from '../../hooks/Sensors/useBatteryData';
import {  Design, DesignDiv, ContentDiv,Item, BatteryContainer } from '../../styles/battery-style';
import { SensorGroup, SensorName} from '../../styles/sensors-style';
import useSensorsConfig from '../../hooks/Sensors/useSensorsConfig';
import { useTranslation } from 'react-i18next';

interface BatteryProps {
    batteries: BatteryData[];
    loading: boolean;
    error: string | null;
}

const Battery: React.FC<BatteryProps> = ({ batteries, loading, error }) => {
    const sensorsConfig = useSensorsConfig();
    const { t } = useTranslation();

    const hasNumber = (value: number | null | undefined) => value !== null && value !== undefined;

    return (
        <>
            {loading ? (
                <p>{t('loading.battery')}</p>
            ) : error ? (
                <p>{t('error.battery_failed')}</p>
            ) : batteries.length > 0 ? (
                batteries.map((battery, index) => (
                    <SensorGroup key={battery.model ?? `battery-${index}`}>
                        <SensorName sensorsBoxesTitleForegroundColor={sensorsConfig.config.sensors_boxes_title_foreground_color}>{t('sensors.battery')} {index + 1}</SensorName>
                        <BatteryContainer>
                            <DesignDiv>
                                <Design 
                                percentage={battery.percentage}
                                sensorsBatteryBackgroundColor={sensorsConfig.config.sensors_battery_background_color}
                                sensorsBatteryFrameColor={sensorsConfig.config.sensors_battery_frame_color}
                                sensorsBatteryCaseColor={sensorsConfig.config.sensors_battery_case_color}
                                 />
                            </DesignDiv>
                            <ContentDiv>
                                {hasNumber(battery.percentage) && <Item sensorsGroupForegroundColor={sensorsConfig.config.sensors_boxes_foreground_color}>{t('battery.percentage')}: {battery.percentage}%</Item>}
                                {battery.model && <Item sensorsGroupForegroundColor={sensorsConfig.config.sensors_boxes_foreground_color}>{t('battery.model')}: {battery.model}</Item>}
                                {battery.state && <Item sensorsGroupForegroundColor={sensorsConfig.config.sensors_boxes_foreground_color}>{t('battery.state')}: {battery.state}</Item>}
                                {hasNumber(battery.cycle_count) && <Item sensorsGroupForegroundColor={sensorsConfig.config.sensors_boxes_foreground_color}>{t('battery.cycle_count')}: {battery.cycle_count}</Item>}
                                {hasNumber(battery.energy) && <Item sensorsGroupForegroundColor={sensorsConfig.config.sensors_boxes_foreground_color}>{t('battery.energy')}: {battery.energy} Wh</Item>}
                                {hasNumber(battery.time_to_full) && <Item sensorsGroupForegroundColor={sensorsConfig.config.sensors_boxes_foreground_color}>{t('battery.time_to_full')}: {battery.time_to_full} {t('minutes')}</Item>}
                                {battery.technology && <Item sensorsGroupForegroundColor={sensorsConfig.config.sensors_boxes_foreground_color}>{t('battery.technology')}: {battery.technology}</Item>}
                                {hasNumber(battery.time_to_empty) && <Item sensorsGroupForegroundColor={sensorsConfig.config.sensors_boxes_foreground_color}>{t('battery.time_to_empty')}: {battery.time_to_empty} {t('minutes')}</Item>}
                                {hasNumber(battery.temperature) && <Item sensorsGroupForegroundColor={sensorsConfig.config.sensors_boxes_foreground_color}>{t('battery.temperature')}: {battery.temperature} °C</Item>}
                                {hasNumber(battery.state_of_health) && <Item sensorsGroupForegroundColor={sensorsConfig.config.sensors_boxes_foreground_color}>{t('battery.state_of_health')}: {battery.state_of_health}%</Item>}
                            </ContentDiv>
                        </BatteryContainer>
                    </SensorGroup>
                ))
            ) : (
                <p>{t('empty.battery')}</p>
            )}
        </>
    );
};

export default Battery;
