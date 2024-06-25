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
                    console.log("Fetched config:", fetchedConfig);
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

    const updateValues = (newConfig: T) => {
        setConfig(newConfig);
        sendData(newConfig);
    };

    const updateConfig = (key: keyof T, value: string | number | string[]) => {
        const newConfig = { ...config, [key]: value };
        updateValues(newConfig);
    };

    return {
        config,
        updateConfig,
        updateValues,
    };
};

export default useFetchAndSetConfig;
