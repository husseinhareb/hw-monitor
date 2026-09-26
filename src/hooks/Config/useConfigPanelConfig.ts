import useFetchAndSetConfig from "../../utils/useConfigUtils";
import type { ConfigData } from "../../bindings";

const configPanelKeys = [
    "config_background_color",
    "config_container_background_color",
    "config_input_background_color",
    "config_input_border_color",
    "config_button_background_color",
    "config_button_foreground_color",
    "config_text_color",
    "config_toast_error_color",
    "config_toast_warning_color",
    "config_toast_info_color",
] as const;

type ConfigPanelConfig = Pick<ConfigData, (typeof configPanelKeys)[number]>;

const useConfigPanelConfig = () => {
    return useFetchAndSetConfig<ConfigPanelConfig>(configPanelKeys, "set_config_panel_configs");
};

export default useConfigPanelConfig;
