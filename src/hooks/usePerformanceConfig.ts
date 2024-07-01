// usePerformanceConfig.ts
import { useSetPerformanceConfig } from "../services/store";
import useFetchAndSetConfig from "../utils/useConfigUtils";

type PerformanceConfig = {
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
};

const initialPerformanceConfig: PerformanceConfig = {
    performance_update_time: 1000,
    performance_sidebar_background_color: "#333",
    performance_sidebar_color: "#ffffff",
    performance_sidebar_selected_color: "#ffffff",
    performance_background_color: "#2B2B2B",
    performance_title_color: "#ffffff",
    performance_label_color: "#6d6d6d",
    performance_value_color: "#fff",
    performance_graph_color: "#09ffff",
    performance_sec_graph_color: '#ff6384',
};

const usePerformanceConfig = () => {
    const setPerformanceConfig = useSetPerformanceConfig();
    return useFetchAndSetConfig(initialPerformanceConfig, "get_configs", setPerformanceConfig);
};

export default usePerformanceConfig;
