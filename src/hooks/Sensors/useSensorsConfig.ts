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

const initialSensorsConfig: SensorsConfig = {
    sensors_update_time: 2000,
    sensors_background_color: "#2b2b2b",
    sensors_foreground_color: "#ffffff",
    sensors_boxes_background_color: "#3a3a3a",
    sensors_boxes_foreground_color: "#ffffff",
    sensors_boxes_title_foreground_color: "#0088dd",
    sensors_battery_background_color: "#38e740",
    sensors_battery_frame_color: "#ffffff",
    sensors_battery_case_color: "#060606",
};

const useSensorsConfig = () => {

    return useFetchAndSetConfig(initialSensorsConfig, "get_configs", "set_sensors_configs");
};

export default useSensorsConfig;
