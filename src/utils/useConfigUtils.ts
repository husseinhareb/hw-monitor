import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";

type ConfigType = Record<string, string | number | string[]>;

const useFetchAndSetConfig = <T extends ConfigType>(
    initialConfig: T,
    getConfigKey: string,
    setConfigFunction: (config: T) => void
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
            // No interval cleanup needed here
        };
    }, [setConfigFunction]);

    const sendData = async (data: T) => {
        try {
            await invoke("set_config", { config: data });
            setConfigFunction(data);
        } catch (error) {
            console.error("Error while sending data to backend:", error);
        }
    };

    const updateConfig = async (key: keyof T, value: string | number | string[]) => {
        try {
            const fetchedConfig: T | null = await invoke(getConfigKey);
            if (fetchedConfig) {
                const newConfig = { ...fetchedConfig, [key]: value };
                setConfig(newConfig);
                sendData(newConfig);
            } else {
                console.warn("Empty response received from server.");
            }
        } catch (error) {
            console.error("Error fetching config:", error);
        }
    };

    return {
        config,
        updateConfig,
    };
};

export default useFetchAndSetConfig;
