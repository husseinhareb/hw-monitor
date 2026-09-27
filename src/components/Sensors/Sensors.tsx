import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  FaCog,
  FaEye,
  FaEyeSlash,
  FaUndo,
  FaChartLine,
  FaChevronDown,
  FaChevronRight,
  FaCompressAlt,
  FaExpandAlt,
} from 'react-icons/fa';
import {
  Container,
  Title,
  SensorGrid,
  SensorColumn,
  SensorScroller,
  SensorList,
  SensorName,
  SensorGroup,
  SensorCardHeader,
  SensorCardTitleGroup,
  SensorBadgeCount,
  SensorHeaderActions,
  SensorCategoryHeader,
  SensorItem,
  SensorToolbar,
  SensorControls,
  SensorFilterInput,
  ShowHiddenToggle,
  ToolbarButton,
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
import Battery, { hasBatterySection } from '../Sensors/Battery';
import HeatBar from '../Sensors/HeatBar';
import { distributeColumns } from '../../helpers/distributeColumns';
import SensorGraphModal from '../Sensors/SensorGraphModal';
import useSensorsConfig from '../../hooks/Sensors/useSensorsConfig';
import useBatteryData from '../../hooks/Sensors/useBatteryData';
import { useTranslation } from 'react-i18next';

type Sensor = ReturnType<typeof useSensorsData>[number]['sensors'][number];
type SensorStatus = 'normal' | 'warning' | 'critical';
type StringMap = Record<string, string>;
type NumberMap = Record<string, number>;

interface CategoryDefinition {
  key: string;
  labelKey: string;
  types: string[];
}

const SENSOR_CATEGORIES: CategoryDefinition[] = [
  { key: 'temperature', labelKey: 'sensors.category_temperatures', types: ['temperature'] },
  { key: 'fan', labelKey: 'sensors.category_fans', types: ['fan'] },
  { key: 'voltage', labelKey: 'sensors.category_voltages', types: ['voltage'] },
  { key: 'current', labelKey: 'sensors.category_currents', types: ['current'] },
  { key: 'power', labelKey: 'sensors.category_power', types: ['power', 'energy'] },
  { key: 'pwm', labelKey: 'sensors.category_pwm', types: ['pwm'] },
  { key: 'intrusion', labelKey: 'sensors.category_intrusion', types: ['intrusion'] },
  { key: 'other', labelKey: 'sensors.category_other', types: ['humidity'] },
];

interface CategorizedSensors {
  category: CategoryDefinition;
  sensors: Sensor[];
}

const groupSensorsByCategory = (sensorsList: Sensor[]): CategorizedSensors[] => {
  const groups: CategorizedSensors[] = [];
  const categorizedSensorIds = new Set<string>();

  for (const cat of SENSOR_CATEGORIES) {
    const matching = sensorsList.filter(s => cat.types.includes(s.sensor_type.toLowerCase()));
    if (matching.length > 0) {
      groups.push({ category: cat, sensors: matching });
      matching.forEach(s => categorizedSensorIds.add(s.id));
    }
  }

  const leftover = sensorsList.filter(s => !categorizedSensorIds.has(s.id));
  if (leftover.length > 0) {
    const otherCat = SENSOR_CATEGORIES.find(c => c.key === 'other') || {
      key: 'other',
      labelKey: 'sensors.category_other',
      types: [],
    };
    const existingOther = groups.find(g => g.category.key === 'other');
    if (existingOther) {
      existingOther.sensors.push(...leftover);
    } else {
      groups.push({ category: otherCat, sensors: leftover });
    }
  }

  return groups;
};

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
  if (sensor.sensor_type === 'intrusion') {
    if (critical !== undefined) {
      if (critical <= 0) return 'normal';
      if (sensor.value >= critical) return 'critical';
    } else if (sensor.value >= 0.5) {
      // Boards latch this flag (often permanently when no switch is wired), so it is a
      // warning by default; a critical threshold set in the editor still escalates it
      return 'warning';
    }
    if (warning !== undefined && warning > 0 && sensor.value >= warning) return 'warning';
    return 'normal';
  }
  if (critical !== undefined && critical > 0 && sensor.value >= critical) return 'critical';
  if (warning !== undefined && warning > 0 && sensor.value >= warning) return 'warning';
  return 'normal';
};

const thresholdStep = (sensor: Sensor) => {
  if (sensor.sensor_type === 'voltage' || sensor.sensor_type === 'current') return '0.01';
  if (sensor.sensor_type === 'fan' || sensor.sensor_type === 'pwm') return '1';
  return '0.1';
};

const SENSOR_COLUMN_WIDTH = 360;
const SENSOR_COLUMN_GAP = 14;

const Sensors: React.FC = () => {
  const gridRef = useRef<HTMLDivElement>(null);
  const [columnCount, setColumnCount] = useState(1);
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const observer = new ResizeObserver(([entry]) => {
      const width = entry.contentRect.width;
      setColumnCount(Math.max(1, Math.floor((width + SENSOR_COLUMN_GAP) / (SENSOR_COLUMN_WIDTH + SENSOR_COLUMN_GAP))));
    });
    observer.observe(grid);
    return () => observer.disconnect();
  }, []);
  const sensors = useSensorsData();
  const batteryState = useBatteryData();
  const { t } = useTranslation();
  const sensorsConfig = useSensorsConfig();
  const [showHidden, setShowHidden] = useState(false);
  const [pollCount, setPollCount] = useState(0);
  const [sensorFilter, setSensorFilter] = useState('');
  const [editingSensorId, setEditingSensorId] = useState<string | null>(null);
  const [graphSensorId, setGraphSensorId] = useState<string | null>(null);
  const [collapsedChips, setCollapsedChips] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('hw-monitor:sensors:collapsed-chips');
      return saved ? new Set<string>(JSON.parse(saved)) : new Set<string>();
    } catch {
      return new Set<string>();
    }
  });

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

  const toggleChipCollapsed = (chipName: string) => {
    setCollapsedChips(prev => {
      const next = new Set(prev);
      if (next.has(chipName)) {
        next.delete(chipName);
      } else {
        next.add(chipName);
      }
      try {
        localStorage.setItem('hw-monitor:sensors:collapsed-chips', JSON.stringify(Array.from(next)));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const handleToggleAll = () => {
    const allNames = sortedSensors.map(h => h.name);
    const areAllCollapsed = allNames.length > 0 && allNames.every(name => collapsedChips.has(name));
    const next = areAllCollapsed ? new Set<string>() : new Set(allNames);
    setCollapsedChips(next);
    try {
      localStorage.setItem('hw-monitor:sensors:collapsed-chips', JSON.stringify(Array.from(next)));
    } catch {
      // ignore
    }
  };

  const areAllCollapsed = sortedSensors.length > 0 && sortedSensors.every(h => collapsedChips.has(h.name));

  const formatSensorValue = (sensor: Sensor) => {
    if (sensor.sensor_type === 'intrusion') {
      return sensor.value >= 0.5
        ? t('sensors.intrusion_detected')
        : t('sensors.intrusion_clear');
    }

    const precision = sensor.sensor_type === 'humidity' ? 1 : 2;
    // Temperatures keep one fixed decimal so a column of readings lines up
    const value = sensor.sensor_type === 'fan' || sensor.sensor_type === 'pwm'
      ? String(Math.round(sensor.value))
      : sensor.sensor_type === 'temperature'
        ? sensor.value.toFixed(1)
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

  const cfg = sensorsConfig.config;
  const statusColor = (status: SensorStatus) => {
    if (status === 'critical') return cfg.sensors_status_critical_color;
    if (status === 'warning') return cfg.sensors_status_warning_color;
    return cfg.sensors_status_ok_color;
  };

  const getChipAlertStatus = (sensorsList: Sensor[]): SensorStatus => {
    let hasWarning = false;
    for (const sensor of sensorsList) {
      const critical = resolveThreshold(
        criticalOverrides,
        sensor.id,
        sensor.critical,
        sensor.sensor_type === 'temperature' ? 100 : undefined,
      );
      const warning = resolveThreshold(warningOverrides, sensor.id, sensor.warning);
      const status = getSensorStatus(sensor, warning, critical);
      if (status === 'critical') return 'critical';
      if (status === 'warning') hasWarning = true;
    }
    return hasWarning ? 'warning' : 'normal';
  };

  return (
    <Container
      sensorsBackgroundColors={sensorsConfig.config.sensors_background_color}
      sensorsForegroundColor={sensorsConfig.config.sensors_foreground_color}
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
          <ShowHiddenToggle $accentColor={cfg.sensors_status_ok_color}>
            <input
              type="checkbox"
              checked={showHidden}
              onChange={(event) => setShowHidden(event.target.checked)}
            />
            {t('sensors.show_hidden')}
          </ShowHiddenToggle>
          {sortedSensors.length > 1 && (
            <ToolbarButton
              type="button"
              onClick={handleToggleAll}
              $color={sensorsConfig.config.sensors_foreground_color}
              title={areAllCollapsed ? t('sensors.expand_all') : t('sensors.collapse_all')}
            >
              {areAllCollapsed ? <FaExpandAlt /> : <FaCompressAlt />}
              <span>{areAllCollapsed ? t('sensors.expand_all') : t('sensors.collapse_all')}</span>
            </ToolbarButton>
          )}
        </SensorControls>
      </SensorToolbar>
      <SensorScroller>
        <SensorGrid ref={gridRef}>
          {distributeColumns([
          ...(hasBatterySection(batteryState.batteries, batteryState.error) ? [{ weight: 200, item: (
            <SensorList
              key="battery"
              sensorsBoxesBackgroundColor={sensorsConfig.config.sensors_boxes_background_color}
              sensorsBoxesForegroundColor={sensorsConfig.config.sensors_boxes_foreground_color}
            >
              <Battery
                batteries={batteryState.batteries}
                loading={batteryState.loading}
                error={batteryState.error}
              />
            </SensorList>
          ) }] : []),
          ...sortedSensors.map((hwmon) => {
            const isCollapsed = collapsedChips.has(hwmon.name) && !normalizedSensorFilter;
            const chipAlertStatus = getChipAlertStatus(hwmon.sensors);
            const categorizedGroups = groupSensorsByCategory(hwmon.sensors);
            const hasMultipleCategories = categorizedGroups.length > 1;
            // Rough rendered height in px, only used to balance the columns
            const weight = isCollapsed
              ? 65
              : 55
                + (hasMultipleCategories ? 25 * categorizedGroups.length : 0)
                + hwmon.sensors.reduce((sum, sensor) => sum + (sensor.sensor_type === 'temperature' ? 60 : 45), 0);

            return { weight, item: (
              <SensorList
                key={hwmon.index}
                sensorsBoxesBackgroundColor={sensorsConfig.config.sensors_boxes_background_color}
                sensorsBoxesForegroundColor={sensorsConfig.config.sensors_boxes_foreground_color}
              >
                <SensorGroup>
                  <SensorCardHeader
                    $collapsed={isCollapsed}
                    onClick={() => toggleChipCollapsed(hwmon.name)}
                    title={isCollapsed ? t('sensors.expand') : t('sensors.collapse')}
                  >
                    <SensorCardTitleGroup>
                      <SensorName sensorsBoxesTitleForegroundColor={sensorsConfig.config.sensors_boxes_title_foreground_color}>
                        {hwmon.name}
                      </SensorName>
                      <SensorBadgeCount $color={sensorsConfig.config.sensors_boxes_title_foreground_color}>
                        {t('sensors.sensors_count', { count: hwmon.sensors.length })}
                      </SensorBadgeCount>
                      {isCollapsed && chipAlertStatus !== 'normal' && (
                        <SensorStatusBadge $color={statusColor(chipAlertStatus)} $textColor={cfg.sensors_boxes_background_color}>
                          {t(`sensors.status_${chipAlertStatus}`)}
                        </SensorStatusBadge>
                      )}
                    </SensorCardTitleGroup>
                    <SensorHeaderActions $color={sensorsConfig.config.sensors_boxes_title_foreground_color}>
                      {isCollapsed ? <FaChevronRight /> : <FaChevronDown />}
                    </SensorHeaderActions>
                  </SensorCardHeader>

                  {!isCollapsed && (
                    <ContentDiv>
                      {categorizedGroups.map((group) => (
                        <React.Fragment key={group.category.key}>
                          {hasMultipleCategories && (
                            <SensorCategoryHeader
                              sensorsBoxesTitleForegroundColor={sensorsConfig.config.sensors_boxes_title_foreground_color}
                            >
                              <span>{t(group.category.labelKey)}</span>
                              <span style={{ fontSize: '9px', opacity: 0.7 }}>{group.sensors.length}</span>
                            </SensorCategoryHeader>
                          )}
                          {group.sensors.map((sensor) => {
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
                                        <SensorStatusBadge
                                          $color={statusColor(status)}
                                          $textColor={cfg.sensors_boxes_background_color}
                                          title={sensor.sensor_type === 'intrusion' ? t('sensors.intrusion_hint') : undefined}
                                        >
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
                                      title={t('sensors.graph')}
                                      aria-label={t('sensors.graph')}
                                      $active={graphSensorId === sensor.id}
                                      // A detected/clear flag has nothing to plot; keep the slot so actions stay aligned
                                      style={sensor.sensor_type === 'intrusion' ? { visibility: 'hidden' } : undefined}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setGraphSensorId(graphSensorId === sensor.id ? null : sensor.id);
                                      }}
                                    >
                                      <FaChartLine />
                                    </SensorIconButton>
                                    <SensorIconButton
                                      type="button"
                                      title={t('sensors.edit')}
                                      aria-label={t('sensors.edit')}
                                      $active={isEditing}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setEditingSensorId(isEditing ? null : sensor.id);
                                      }}
                                    >
                                      <FaCog />
                                    </SensorIconButton>
                                    <SensorIconButton
                                      type="button"
                                      title={isHidden ? t('sensors.show') : t('sensors.hide')}
                                      aria-label={isHidden ? t('sensors.show') : t('sensors.hide')}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSensorHidden(sensor.id, !isHidden);
                                      }}
                                    >
                                      {isHidden ? <FaEye /> : <FaEyeSlash />}
                                    </SensorIconButton>
                                  </SensorActions>
                                </SensorRow>

                                {critical !== undefined && critical > 0 && sensor.sensor_type !== 'intrusion' && (
                                  <HeatBar value={sensor.value} critical={critical} />
                                )}

                                {isEditing && (
                                  <SensorEditor onClick={(e) => e.stopPropagation()}>
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
                                        placeholder={
                                          sensor.sensor_type === 'intrusion'
                                            ? (criticalOverrides[sensor.id] !== undefined ? String(criticalOverrides[sensor.id]) : t('sensors.intrusion_disable_hint'))
                                            : formatThresholdPlaceholder(sensor.critical ?? undefined)
                                        }
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
                        </React.Fragment>
                      ))}
                    </ContentDiv>
                  )}
                </SensorGroup>
              </SensorList>
            ) };
          }),
          ], columnCount).map((column, index) => (
            <SensorColumn key={index}>{column}</SensorColumn>
          ))}
        </SensorGrid>
      </SensorScroller>

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
            displayValue={formatSensorValue(sensor)}
            pollTick={pollCount}
            updateInterval={sensorsConfig.config.sensors_update_time}
            backgroundColor={sensorsConfig.config.sensors_boxes_background_color}
            foregroundColor={sensorsConfig.config.sensors_boxes_foreground_color}
            titleColor={sensorsConfig.config.sensors_boxes_title_foreground_color}
            graphColor={sensorsConfig.config.sensors_graph_color}
            onClose={() => setGraphSensorId(null)}
          />
        );
      })()}
    </Container>
  );
};

export default Sensors;
