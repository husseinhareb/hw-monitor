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

const processConfigKeys = [
    "processes_update_time",
    "processes_body_background_color",
    "processes_body_color",
    "processes_head_background_color",
    "processes_head_color",
    "processes_table_values",
    "processes_border_color",
    "processes_tree_toggle_color",
    "processes_monitor_border_color",
] as const;

const useProcessConfig = () => {
    const { config, updateConfig, hydrated, hydrating, lastLoadError } = useFetchAndSetConfig<ProcessConfig>(
        processConfigKeys,
        "set_processes_configs"
    );

    const updateTableValues = (newValues: string[]) => {
        void updateConfig("processes_table_values", newValues);
    };

    return {
        config,
        hydrated,
        hydrating,
        lastLoadError,
        updateConfig,
        updateTableValues,
    };
};

export default useProcessConfig;
