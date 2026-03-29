import useFetchAndSetConfig from "../../utils/useConfigUtils";

export type PerformanceConfig = {
    performance_update_time: number;
    performance_sidebar_background_color: string;
    performance_sidebar_color: string;
    performance_sidebar_selected_color: string;
    performance_background_color: string;
    performance_title_color: string;
    performance_label_color: string;
    performance_value_color: string;
    performance_graph_color: string;
    performance_sec_graph_color: string;
    show_virtual_interfaces: boolean;
    performance_scrollbar_color: string;
};

const initialPerformanceConfig: PerformanceConfig = {
    performance_update_time: 1000,
    performance_sidebar_background_color: "#333333",
    performance_sidebar_color: "#ffffff",
    performance_sidebar_selected_color: "#ffffff",
    performance_background_color: "#2d2d2d",
    performance_title_color: "#ffffff",
    performance_label_color: "#6d6d6d",
    performance_value_color: "#ffffff",
    performance_graph_color: "#09ffff",
    performance_sec_graph_color: '#ff6384',
    show_virtual_interfaces: false,
    performance_scrollbar_color: "#888888",
};

const usePerformanceConfig = () => {

    return useFetchAndSetConfig(initialPerformanceConfig, "get_configs", "set_performance_configs");
};

export default usePerformanceConfig;
