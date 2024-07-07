import { useSetSensorsConfig } from "../services/store";
import useFetchAndSetConfig from "../utils/useConfigUtils";

type SensorsConfig = {
    sensors_update_time: number;
    sensors_background_color: string;
    sensors_foreground_color: string;
    sensors_boxes_background_color: string;
    sensors_boxes_foreground_color: string;
    sensors_boxes_title_foreground_color: string;
    sensors_battery_background_color: string;
    sensors_battery_frame_color: string;
};

const initialSensorsConfig: SensorsConfig = {
    sensors_update_time: 2000,
    sensors_background_color: "#333",
    sensors_foreground_color: "#fff",
    sensors_boxes_background_color: "#2B2B2B",
    sensors_boxes_foreground_color: "#6d6d6d",
    sensors_boxes_title_foreground_color: "#9A9A9A",
    sensors_battery_background_color: "#1E1E1E",
    sensors_battery_frame_color: '#FFFFFF',
};

const useSensorsConfig = () => {
    const setSensorsConfig = useSetSensorsConfig();
    return useFetchAndSetConfig(initialSensorsConfig, "get_configs", setSensorsConfig);
};

export default useSensorsConfig;
