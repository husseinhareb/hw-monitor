import useFetchAndSetConfig from "../../utils/useConfigUtils";
import type { ConfigData } from "../../bindings";

const systemInfoConfigKeys = [
    "system_info_update_time",
    "system_info_background_color",
    "system_info_boxes_background_color",
    "system_info_title_color",
    "system_info_label_color",
    "system_info_value_color",
    "system_info_border_color",
] as const;

type SystemInfoConfig = Pick<ConfigData, (typeof systemInfoConfigKeys)[number]>;

const useSystemInfoConfig = () => {
    const { config, updateConfig, hydrated, hydrating, lastLoadError } =
        useFetchAndSetConfig<SystemInfoConfig>(systemInfoConfigKeys, "set_system_info_configs");

    return { config, updateConfig, hydrated, hydrating, lastLoadError };
};

export default useSystemInfoConfig;
