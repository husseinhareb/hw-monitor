import useFetchAndSetConfig from "../../utils/useConfigUtils";

type ProcessConfig = {
    processes_update_time: number;
    processes_body_background_color: string;
    processes_body_color: string;
    processes_head_background_color: string;
    processes_head_color: string;
    processes_table_values: string[];
    processes_border_color: string;
    processes_tree_toggle_color: string;
    processes_monitor_border_color: string;
};

const initialProcessConfig: ProcessConfig = {
    processes_update_time: 2000,
    processes_body_background_color: "#2d2d2d",
    processes_body_color: "#ffffff",
    processes_head_background_color: "#252526",
    processes_head_color: "#ffffff",
    processes_table_values: ["user", "pid", "ppid", "name", "state", "memory", "cpu_usage"],
    processes_border_color: "#333333",
    processes_tree_toggle_color: "#888888",
    processes_monitor_border_color: "#555555",
};

const useProcessConfig = () => {


    const { config, updateConfig } = useFetchAndSetConfig(initialProcessConfig, "get_configs", "set_processes_configs");

    const updateTableValues = (newValues: string[]) => {
        updateConfig("processes_table_values", newValues);
    };

    return {
        config,
        updateConfig,
        updateTableValues,
    };
};

export default useProcessConfig;
