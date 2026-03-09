import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";

type ConfigType = Record<string, string | number | boolean | string[]>;

const useFetchAndSetConfig = <T extends ConfigType>(
    initialConfig: T,
    getConfigKey: string,
    setConfigCommand: string
) => {
    const [config, setConfig] = useState<T>(initialConfig);

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const fetchedConfig: T | null = await invoke(getConfigKey);
                if (fetchedConfig) {
                    setConfig(fetchedConfig);
                } else {
                    console.warn("Empty response received from server.");
                }
            } catch (error) {
                console.error("Error fetching config:", error);
            }
        };

        fetchConfig();

        return () => {
            // Optional cleanup function if needed
        };
    }, [getConfigKey]); // Added getConfigKey as a dependency

    const sendData = async (data: T) => {
        try {
            await invoke(setConfigCommand, { configs: data }); 
        } catch (error) {
            console.error("Error while sending data to backend:", error);
        }
    };

    const updateConfig = async (key: keyof T, value: string | number | boolean | string[]) => {
        const newConfig = { ...config, [key]: value } as T;
        setConfig(newConfig);
        sendData(newConfig);
    };

    return {
        config,
        updateConfig,
    };
};

export default useFetchAndSetConfig;
