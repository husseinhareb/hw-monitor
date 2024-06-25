import { useSetProcessesConfig } from "../services/store";
import useFetchAndSetConfig from "../utils/useConfigUtils";

type ProcessConfig = {
    processes_update_time: number;
    processes_body_background_color: string;
    processes_body_color: string;
    processes_head_background_color: string;
    processes_head_color: string;
    processes_table_values: string[];
};

const initialProcessConfig: ProcessConfig = {
    processes_update_time: 1000,
    processes_body_background_color: "#ffffff",
    processes_body_color: "#000000",
    processes_head_background_color: "#252526",
    processes_head_color: "#ffffff",
    processes_table_values: ["user", "pid", "ppid", "name", "state", "memory", "cpu_usage"],
};

const useProcessConfig = () => {
    const setProcessesConfig = useSetProcessesConfig();
    const { config, updateConfig, updateValues } = useFetchAndSetConfig(initialProcessConfig, "get_configs", setProcessesConfig);

    const updateTableValues = (newValues: string[]) => {
        const newConfig = { ...config, processes_table_values: newValues };
        updateValues(newConfig);
    };

    return {
        config,
        updateConfig,
        updateTableValues,
    };
};

export default useProcessConfig;
