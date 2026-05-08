import React, { useMemo, useState } from 'react';
import { FaCog, FaEye, FaEyeSlash, FaUndo, FaChartLine } from 'react-icons/fa';
import {
  Container,
  Title,
  SensorGrid,
  SensorList,
  SensorName,
  SensorGroup,
  SensorItem,
  SensorToolbar,
  SensorControls,
  SensorFilterInput,
  ShowHiddenToggle,
  SensorRow,
  SensorLabelBlock,
  SensorLabel,
  SensorMeta,
  SensorMetaLine,
  SensorValue,
  SensorActions,
  SensorIconButton,
  SensorStatusBadge,
  SensorEditor,
  SensorEditorField,
  SensorEditorInput,
  ContentDiv,
} from '../../styles/sensors-style';
import useSensorsData from '../../hooks/Sensors/useSensorsData';
import Battery from '../Sensors/Battery';
import HeatBar from '../Sensors/HeatBar';
import SensorGraphModal from '../Sensors/SensorGraphModal';
import useSensorsConfig from '../../hooks/Sensors/useSensorsConfig';
import useBatteryData from '../../hooks/Sensors/useBatteryData';
import { useTranslation } from 'react-i18next';

type Sensor = ReturnType<typeof useSensorsData>[number]['sensors'][number];
type SensorStatus = 'normal' | 'warning' | 'critical';
type StringMap = Record<string, string>;
type NumberMap = Record<string, number>;

const parseStringMap = (value: string): StringMap => {
  try {
    const parsed = JSON.parse(value);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};

    return Object.entries(parsed).reduce<StringMap>((result, [key, entry]) => {
      if (typeof entry === 'string') result[key] = entry;
      return result;
    }, {});
  } catch {
    return {};
  }
};

const parseNumberMap = (value: string): NumberMap => {
  try {
    const parsed = JSON.parse(value);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};

    return Object.entries(parsed).reduce<NumberMap>((result, [key, entry]) => {
      const numericValue = typeof entry === 'number' ? entry : Number(entry);
      if (Number.isFinite(numericValue)) result[key] = numericValue;
      return result;
    }, {});
  } catch {
    return {};
  }
};

const compactNumber = (value: number, precision = 2) => (
  value.toFixed(precision).replace(/\.?0+$/, '')
);

const formatThresholdPlaceholder = (value: number | undefined) => (
  value === undefined ? '' : compactNumber(value)
);

const resolveThreshold = (
  overrides: NumberMap,
  sensorId: string,
  nativeValue: number | null,
  fallback?: number,
) => {
  const override = overrides[sensorId];
  if (Number.isFinite(override)) return override;
  if (nativeValue !== null && Number.isFinite(nativeValue)) return nativeValue;
  return fallback;
};

const getSensorStatus = (
  sensor: Sensor,
  warning: number | undefined,
  critical: number | undefined,
): SensorStatus => {
  if (sensor.sensor_type === 'intrusion' && sensor.value >= 0.5) return 'critical';
  if (critical !== undefined && critical > 0 && sensor.value >= critical) return 'critical';
  if (warning !== undefined && warning > 0 && sensor.value >= warning) return 'warning';
  return 'normal';
};

const thresholdStep = (sensor: Sensor) => {
  if (sensor.sensor_type === 'voltage' || sensor.sensor_type === 'current') return '0.01';
  if (sensor.sensor_type === 'fan' || sensor.sensor_type === 'pwm') return '1';
  return '0.1';
};

const Sensors: React.FC = () => {
  const sensors = useSensorsData();
  const batteryState = useBatteryData();
  const { t } = useTranslation();
  const sensorsConfig = useSensorsConfig();
  const [showHidden, setShowHidden] = useState(false);
  const [pollCount, setPollCount] = useState(0);
  const [sensorFilter, setSensorFilter] = useState('');
  const [editingSensorId, setEditingSensorId] = useState<string | null>(null);
  const [graphSensorId, setGraphSensorId] = useState<string | null>(null);

  // Increment on every poll so the graph modal refreshes even when values are unchanged
  React.useEffect(() => { setPollCount(c => c + 1); }, [sensors]);

  const hiddenIds = sensorsConfig.config.sensors_hidden_ids ?? [];
  const hiddenSet = useMemo(() => new Set(hiddenIds), [hiddenIds]);
  const labelOverrides = useMemo(
    () => parseStringMap(sensorsConfig.config.sensors_label_overrides),
    [sensorsConfig.config.sensors_label_overrides],
  );
  const warningOverrides = useMemo(
    () => parseNumberMap(sensorsConfig.config.sensors_warning_thresholds),
    [sensorsConfig.config.sensors_warning_thresholds],
  );
  const criticalOverrides = useMemo(
    () => parseNumberMap(sensorsConfig.config.sensors_critical_thresholds),
    [sensorsConfig.config.sensors_critical_thresholds],
  );

  const displayName = (sensor: Sensor) => (
    labelOverrides[sensor.id]?.trim() || sensor.name
  );

  const normalizedSensorFilter = sensorFilter.trim().toLowerCase();

  const sortedSensors = useMemo(() => {
    const nameCount = new Map<string, number>();
    for (const hwmon of sensors) {
      nameCount.set(hwmon.name, (nameCount.get(hwmon.name) ?? 0) + 1);
    }
    const nameSeq = new Map<string, number>();

    return sensors
      .map(hwmon => {
        let resolvedName = hwmon.name;
        if ((nameCount.get(hwmon.name) ?? 1) > 1) {
          const seq = (nameSeq.get(hwmon.name) ?? 0) + 1;
          nameSeq.set(hwmon.name, seq);
          resolvedName = `${hwmon.name} ${seq}`;
        }
        return {
          ...hwmon,
          name: resolvedName,
          sensors: hwmon.sensors.filter(sensor => {
            if (!showHidden && hiddenSet.has(sensor.id)) return false;
            if (!normalizedSensorFilter) return true;

            const searchableText = [
              labelOverrides[sensor.id],
              sensor.name,
              sensor.id,
              sensor.sensor_type,
              resolvedName,
            ].filter(Boolean).join(' ').toLowerCase();

            return searchableText.includes(normalizedSensorFilter);
          }),
        };
      })
      .filter(hwmon => hwmon.sensors.length > 0)
      .sort((a, b) => b.sensors.length - a.sensors.length);
  }, [hiddenSet, labelOverrides, normalizedSensorFilter, sensors, showHidden]);

  const formatSensorValue = (sensor: Sensor) => {
    if (sensor.sensor_type === 'intrusion') {
      return sensor.value >= 0.5
        ? t('sensors.intrusion_detected')
        : t('sensors.intrusion_clear');
    }

    const precision = sensor.sensor_type === 'humidity' ? 1 : 2;
    const value = sensor.sensor_type === 'fan' || sensor.sensor_type === 'pwm'
      ? String(Math.round(sensor.value))
      : compactNumber(sensor.value, precision);

    if (!sensor.unit) return value;

    const compactUnit = sensor.unit === '°C' || sensor.unit === '%';
    return `${value}${compactUnit ? '' : ' '}${sensor.unit}`;
  };

  const setSensorHidden = (sensorId: string, hidden: boolean) => {
    const next = new Set(hiddenIds);
    if (hidden) next.add(sensorId);
    else next.delete(sensorId);

    if (hidden && editingSensorId === sensorId) {
      setEditingSensorId(null);
    }

    void sensorsConfig.updateConfig('sensors_hidden_ids', Array.from(next));
  };

  const setLabelOverride = (sensorId: string, value: string) => {
    const next = { ...labelOverrides };
    if (value.trim()) next[sensorId] = value;
    else delete next[sensorId];
    void sensorsConfig.updateConfig('sensors_label_overrides', JSON.stringify(next));
  };

  const setThresholdOverride = (
    key: 'sensors_warning_thresholds' | 'sensors_critical_thresholds',
    map: NumberMap,
    sensorId: string,
    value: string,
  ) => {
    const next = { ...map };
    if (value.trim() === '') {
      delete next[sensorId];
    } else {
      const numericValue = Number(value);
      if (!Number.isFinite(numericValue)) return;
      next[sensorId] = numericValue;
    }

    void sensorsConfig.updateConfig(key, JSON.stringify(next));
  };

  const resetSensorPreferences = (sensorId: string) => {
    if (hiddenSet.has(sensorId)) {
      void sensorsConfig.updateConfig(
        'sensors_hidden_ids',
        hiddenIds.filter(id => id !== sensorId),
      );
    }

    if (labelOverrides[sensorId] !== undefined) {
      const next = { ...labelOverrides };
      delete next[sensorId];
      void sensorsConfig.updateConfig('sensors_label_overrides', JSON.stringify(next));
    }

    if (warningOverrides[sensorId] !== undefined) {
      const next = { ...warningOverrides };
      delete next[sensorId];
      void sensorsConfig.updateConfig('sensors_warning_thresholds', JSON.stringify(next));
    }

    if (criticalOverrides[sensorId] !== undefined) {
      const next = { ...criticalOverrides };
      delete next[sensorId];
      void sensorsConfig.updateConfig('sensors_critical_thresholds', JSON.stringify(next));
    }
  };

  return (
    <Container
      sensorsBackgroundColors={sensorsConfig.config.sensors_background_color}
    >
      <SensorToolbar sensorsForegroundColor={sensorsConfig.config.sensors_foreground_color}>
        <Title sensorsForegroundColor={sensorsConfig.config.sensors_foreground_color}>
          {t('sensors.title')}
        </Title>
        <SensorControls>
          <SensorFilterInput
            type="search"
            value={sensorFilter}
            placeholder={t('sensors.filter_placeholder')}
            onChange={(event) => setSensorFilter(event.target.value)}
          />
          <ShowHiddenToggle>
            <input
              type="checkbox"
              checked={showHidden}
              onChange={(event) => setShowHidden(event.target.checked)}
            />
            {t('sensors.show_hidden')}
          </ShowHiddenToggle>
        </SensorControls>
      </SensorToolbar>
      <SensorGrid>
        {(batteryState.error || batteryState.batteries.length > 0) && <SensorList
          sensorsBoxesBackgroundColor={sensorsConfig.config.sensors_boxes_background_color}
        >
          <Battery batteries={batteryState.batteries} error={batteryState.error} />
        </SensorList>}
        {sortedSensors.map((hwmon) => (
          <SensorList
            key={hwmon.index}
            sensorsBoxesBackgroundColor={sensorsConfig.config.sensors_boxes_background_color}
          >
            <SensorGroup>
              <SensorName sensorsBoxesTitleForegroundColor={sensorsConfig.config.sensors_boxes_title_foreground_color}>{hwmon.name}</SensorName>
              <ContentDiv>
                {hwmon.sensors.map((sensor) => {
                  const isHidden = hiddenSet.has(sensor.id);
                  const critical = resolveThreshold(
                    criticalOverrides,
                    sensor.id,
                    sensor.critical,
                    sensor.sensor_type === 'temperature' ? 100 : undefined,
                  );
                  const warning = resolveThreshold(warningOverrides, sensor.id, sensor.warning);
                  const status = getSensorStatus(sensor, warning, critical);
                  const isEditing = editingSensorId === sensor.id;
                  const typeLabel = t(`sensors.type_${sensor.sensor_type}`, {
                    defaultValue: sensor.sensor_type,
                  });

                  return (
                    <SensorItem
                      sensorsGroupForegroundColor={sensorsConfig.config.sensors_boxes_foreground_color}
                      $isHidden={isHidden}
                      key={sensor.id}
                    >
                      <SensorRow>
                        <SensorLabelBlock>
                          <SensorLabel title={displayName(sensor)}>{displayName(sensor)}</SensorLabel>
                          <SensorMetaLine>
                            {status !== 'normal' && (
                              <SensorStatusBadge $status={status}>
                                {t(`sensors.status_${status}`)}
                              </SensorStatusBadge>
                            )}
                            <SensorMeta>{typeLabel}</SensorMeta>
                          </SensorMetaLine>
                        </SensorLabelBlock>
                        <SensorValue>{formatSensorValue(sensor)}</SensorValue>
                        <SensorActions>
                          <SensorIconButton
                            type="button"
                            title="Graph"
                            aria-label="Graph"
                            $active={graphSensorId === sensor.id}
                            onClick={() => setGraphSensorId(graphSensorId === sensor.id ? null : sensor.id)}
                          >
                            <FaChartLine />
                          </SensorIconButton>
                          <SensorIconButton
                            type="button"
                            title={t('sensors.edit')}
                            aria-label={t('sensors.edit')}
                            $active={isEditing}
                            onClick={() => setEditingSensorId(isEditing ? null : sensor.id)}
                          >
                            <FaCog />
                          </SensorIconButton>
                          <SensorIconButton
                            type="button"
                            title={isHidden ? t('sensors.show') : t('sensors.hide')}
                            aria-label={isHidden ? t('sensors.show') : t('sensors.hide')}
                            onClick={() => setSensorHidden(sensor.id, !isHidden)}
                          >
                            {isHidden ? <FaEye /> : <FaEyeSlash />}
                          </SensorIconButton>
                        </SensorActions>
                      </SensorRow>

                      {critical !== undefined && critical > 0 && sensor.sensor_type !== 'intrusion' && (
                        <HeatBar value={sensor.value} critical={critical} />
                      )}

                      {isEditing && (
                        <SensorEditor>
                          <SensorEditorField>
                            {t('sensors.custom_label')}
                            <SensorEditorInput
                              type="text"
                              value={labelOverrides[sensor.id] ?? ''}
                              placeholder={sensor.name}
                              onChange={(event) => setLabelOverride(sensor.id, event.target.value)}
                            />
                          </SensorEditorField>
                          <SensorEditorField>
                            {t('sensors.warning_threshold')}
                            <SensorEditorInput
                              type="number"
                              step={thresholdStep(sensor)}
                              value={warningOverrides[sensor.id] ?? ''}
                              placeholder={formatThresholdPlaceholder(sensor.warning ?? undefined)}
                              onChange={(event) => setThresholdOverride(
                                'sensors_warning_thresholds',
                                warningOverrides,
                                sensor.id,
                                event.target.value,
                              )}
                            />
                          </SensorEditorField>
                          <SensorEditorField>
                            {t('sensors.critical_threshold')}
                            <SensorEditorInput
                              type="number"
                              step={thresholdStep(sensor)}
                              value={criticalOverrides[sensor.id] ?? ''}
                              placeholder={formatThresholdPlaceholder(sensor.critical ?? undefined)}
                              onChange={(event) => setThresholdOverride(
                                'sensors_critical_thresholds',
                                criticalOverrides,
                                sensor.id,
                                event.target.value,
                              )}
                            />
                          </SensorEditorField>
                          <SensorIconButton
                            type="button"
                            title={t('sensors.reset')}
                            aria-label={t('sensors.reset')}
                            onClick={() => resetSensorPreferences(sensor.id)}
                          >
                            <FaUndo />
                          </SensorIconButton>
                        </SensorEditor>
                      )}
                    </SensorItem>
                  );
                })}
              </ContentDiv>
            </SensorGroup>
          </SensorList>
        ))}
      </SensorGrid>

      {graphSensorId && (() => {
        const allSensors = sortedSensors.flatMap(h => h.sensors);
        const sensor = allSensors.find(s => s.id === graphSensorId);
        if (!sensor) return null;
        return (
          <SensorGraphModal
            key={graphSensorId}
            sensorName={labelOverrides[sensor.id]?.trim() || sensor.name}
            unit={sensor.unit ?? ''}
            currentValue={sensor.value}
            pollTick={pollCount}
            updateInterval={sensorsConfig.config.sensors_update_time}
            backgroundColor={sensorsConfig.config.sensors_boxes_background_color}
            foregroundColor={sensorsConfig.config.sensors_boxes_foreground_color}
            titleColor={sensorsConfig.config.sensors_boxes_title_foreground_color}
            onClose={() => setGraphSensorId(null)}
          />
        );
      })()}
    </Container>
  );
};

export default Sensors;
