import useFetchAndSetConfig from "../../utils/useConfigUtils";

type ConfigPanelConfig = {
    config_background_color: string;
    config_container_background_color: string;
    config_input_background_color: string;
    config_input_border_color: string;
    config_button_background_color: string;
    config_button_foreground_color: string;
};

const initialConfigPanelConfig: ConfigPanelConfig = {
    config_background_color: "#2b2b2b",
    config_container_background_color: "#3a3a3a",
    config_input_background_color: "#333333",
    config_input_border_color: "#444444",
    config_button_background_color: "#f3eae8",
    config_button_foreground_color: "#212830",
};

const useConfigPanelConfig = () => {
    return useFetchAndSetConfig(initialConfigPanelConfig, "get_configs", "set_config_panel_configs");
};

export default useConfigPanelConfig;
