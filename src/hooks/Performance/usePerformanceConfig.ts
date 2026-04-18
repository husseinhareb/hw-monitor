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

const performanceConfigKeys = [
    "performance_update_time",
    "performance_sidebar_background_color",
    "performance_sidebar_color",
    "performance_sidebar_selected_color",
    "performance_background_color",
    "performance_title_color",
    "performance_label_color",
    "performance_value_color",
    "performance_graph_color",
    "performance_sec_graph_color",
    "show_virtual_interfaces",
    "performance_scrollbar_color",
] as const;

const usePerformanceConfig = () => {
    return useFetchAndSetConfig<PerformanceConfig>(performanceConfigKeys, "set_performance_configs");
};

export default usePerformanceConfig;
