import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { useProcessesConfig, useSetProcessesConfig } from "../services/store";

type ProcessConfig = {
    update_time: number;
    body_background_color: string;
    body_color: string;
    head_background_color: string;
    head_color: string;
    table_values: string[];
};

const useProcessConfig = () => {
    const processesConfig = useProcessesConfig();
    const setProcessesConfig = useSetProcessesConfig();

    const [config, setConfig] = useState<ProcessConfig>({
        update_time: 1000,
        body_background_color: "#ffffff",
        body_color: "#000000",
        head_background_color: "#252526",
        head_color: "#ffffff",
        table_values: ["user", "pid", "ppid", "name", "state", "memory", "cpu_usage"],
    });
    
    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const fetchedConfig: ProcessConfig | null = await invoke("get_process_configs");
    
                if (fetchedConfig) {
                    console.log("Fetched process config:", fetchedConfig);
                    setConfig(fetchedConfig);
                } else {
                    console.warn("Empty response received from server.");
                }
            } catch (error) {
                console.error("Error fetching process config:", error);
            }
        };
    
        fetchConfig(); // Initial fetch
    
        return () => {
            // No interval cleanup needed here
        };
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
        const newConfig = { ...config, table_values: newValues };
        setConfig(newConfig);
        sendData(newConfig);
    };

    // Update local config when processesConfig changes
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
