// useSensorsConfig.ts
import { useSetSensorsConfig } from "../services/store";
import useFetchAndSetConfig from "../utils/useConfigUtils";

type SensorsConfig = {
    sensors_update_time: number;
    sensors_background_color: string;
    sensors_foreground_color: string;
    sensors_group_background_color: string;
    sensors_group_foreground_color: string;
};

const initialSensorsConfig: SensorsConfig = {
    sensors_update_time: 1000,
    sensors_background_color: "#333",
    sensors_foreground_color: "#fff",
    sensors_group_background_color: "#2B2B2B",
    sensors_group_foreground_color: "#6d6d6d",
};

const useSensorsConfig = () => {
    const setSensorsConfig = useSetSensorsConfig();
    return useFetchAndSetConfig(initialSensorsConfig, "get_configs", setSensorsConfig);
};

export default useSensorsConfig;
