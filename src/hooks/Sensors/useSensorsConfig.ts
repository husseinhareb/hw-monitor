import useFetchAndSetConfig from "../../utils/useConfigUtils";
import type { ConfigData } from "../../bindings";

const sensorsConfigKeys = [
    "sensors_update_time",
    "sensors_background_color",
    "sensors_foreground_color",
    "sensors_boxes_background_color",
    "sensors_boxes_foreground_color",
    "sensors_boxes_title_foreground_color",
    "sensors_battery_background_color",
    "sensors_battery_frame_color",
    "sensors_battery_case_color",
    "sensors_hidden_ids",
    "sensors_label_overrides",
    "sensors_warning_thresholds",
    "sensors_critical_thresholds",
] as const;

type SensorsConfig = Pick<ConfigData, (typeof sensorsConfigKeys)[number]>;

const useSensorsConfig = () => {
    return useFetchAndSetConfig<SensorsConfig>(sensorsConfigKeys, "set_sensors_configs");
};

export default useSensorsConfig;
