import useFetchAndSetConfig from "../../utils/useConfigUtils";
import type { ConfigData } from "../../bindings";

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
    "processes_services_active_color",
    "processes_services_inactive_color",
    "processes_services_failed_color",
    "processes_services_transitioning_color",
] as const;

type ProcessConfig = Pick<ConfigData, (typeof processConfigKeys)[number]>;

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
