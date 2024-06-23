import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { useProcessesConfig, useSetProcessesConfig } from "../services/store";

type ProcessConfig = {
    processes_update_time: number;
    processes_body_background_color: string;
    processes_body_color: string;
    processes_head_background_color: string;
    processes_head_color: string;
    processes_table_values: string[];
};

const useProcessConfig = () => {
    const processesConfig = useProcessesConfig();
    const setProcessesConfig = useSetProcessesConfig();

    const [config, setConfig] = useState<ProcessConfig>({
        processes_update_time: 1000,
        processes_body_background_color: "#ffffff",
        processes_body_color: "#000000",
        processes_head_background_color: "#252526",
        processes_head_color: "#ffffff",
        processes_table_values: ["user", "pid", "ppid", "name", "state", "memory", "cpu_usage"],
    });

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const fetchedConfig: ProcessConfig | null = await invoke("get_process_configs");
                if (fetchedConfig) {
                    setConfig(fetchedConfig);
                }
            } catch (error) {
                console.error("Error fetching process config:", error);
            }
        };

        fetchConfig();
    }, [setProcessesConfig]);

    const sendData = async (data: ProcessConfig) => {
        try {
            await invoke("set_proc_config", { data });
            setProcessesConfig(data);
        } catch (error) {
            console.error('Error while sending data to backend:', error);
        }
    };

    const updateConfig = (key: keyof ProcessConfig, value: string | number) => {
        const newConfig = { ...config, [key]: value };
        setConfig(newConfig);
        sendData(newConfig);
    };

    const updateTableValues = (newValues: string[]) => {
        const newConfig = { ...config, processes_table_values: newValues };
        setConfig(newConfig);
        sendData(newConfig);
    };

    useEffect(() => {
        if (processesConfig) {
            setConfig(processesConfig);
        }
    }, [processesConfig]);

    return {
        config,
        updateConfig,
        updateTableValues,
    };
};

export default useProcessConfig;
