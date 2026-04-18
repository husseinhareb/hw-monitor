import useFetchAndSetConfig from "../../utils/useConfigUtils";

type ConfigPanelConfig = {
    config_background_color: string;
    config_container_background_color: string;
    config_input_background_color: string;
    config_input_border_color: string;
    config_button_background_color: string;
    config_button_foreground_color: string;
    config_text_color: string;
};

const configPanelKeys = [
    "config_background_color",
    "config_container_background_color",
    "config_input_background_color",
    "config_input_border_color",
    "config_button_background_color",
    "config_button_foreground_color",
    "config_text_color",
] as const;

const useConfigPanelConfig = () => {
    return useFetchAndSetConfig<ConfigPanelConfig>(configPanelKeys, "set_config_panel_configs");
};

export default useConfigPanelConfig;
