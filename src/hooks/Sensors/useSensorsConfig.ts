import useFetchAndSetConfig from "../../utils/useConfigUtils";

type SensorsConfig = {
    sensors_update_time: number;
    sensors_background_color: string;
    sensors_foreground_color: string;
    sensors_boxes_background_color: string;
    sensors_boxes_foreground_color: string;
    sensors_boxes_title_foreground_color: string;
    sensors_battery_background_color: string;
    sensors_battery_frame_color: string;
    sensors_battery_case_color: string;
};

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
] as const;

const useSensorsConfig = () => {
    return useFetchAndSetConfig<SensorsConfig>(sensorsConfigKeys, "set_sensors_configs");
};

export default useSensorsConfig;
