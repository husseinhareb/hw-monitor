// useProcessConfig.ts
import { useState, useEffect, useCallback } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { useSetProcessesConfig } from "../services/store";

type ProcessConfig = {
    update_time: number;
    body_background_color: string;
    body_color: string;
    head_background_color: string;
    head_color: string;
};

const useProcessConfig = () => {
    const [config, setConfig] = useState<ProcessConfig>({
        update_time: 0,
        body_background_color: "#ffffff",
        body_color: "#000000",
        head_background_color: "#ffffff",
        head_color: "#000000",
    });
    const setProcessesConfig = useSetProcessesConfig();

    const fetchConfig = useCallback(async () => {
        try {
            const config: ProcessConfig = await invoke("get_process_configs");
            setProcessesConfig(config);
            setConfig(config);
        } catch (error) {
            console.error("Error fetching process config:", error);
        }
    }, [setProcessesConfig]);

    const sendData = async (data: ProcessConfig) => {
        try {
            await invoke("set_proc_config", { data });
            console.log(data);
        } catch (error) {
            console.error('Error while sending data to backend:', error);
        }
    };

    const updateConfig = (key: keyof ProcessConfig, value: string | number) => {
        const newConfig = { ...config, [key]: value };
        setConfig(newConfig);
        sendData(newConfig);
    };

    useEffect(() => {
        fetchConfig();
    }, [fetchConfig]);

    return {
        config,
        updateConfig,
    };
};

export default useProcessConfig;
