import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";

type ConfigType = Record<string, string | number | boolean | string[]>;

// All config hooks call invoke("get_configs") which returns the full ConfigData.
// Share a single fetch promise so only one backend call is made per session.
let sharedConfigPromise: Promise<Record<string, unknown>> | null = null;

function fetchAllConfigs(): Promise<Record<string, unknown>> {
    if (!sharedConfigPromise) {
        sharedConfigPromise = (invoke("get_configs") as Promise<Record<string, unknown>>)
            .catch((err) => {
                sharedConfigPromise = null; // allow retry on next mount
                return Promise.reject(err);
            });
    }
    return sharedConfigPromise;
}

const useFetchAndSetConfig = <T extends ConfigType>(
    initialConfig: T,
    _getConfigKey: string,
    setConfigCommand: string
) => {
    const [config, setConfig] = useState<T>(initialConfig);

    useEffect(() => {
        const loadConfig = async () => {
            try {
                const fetchedConfig = await fetchAllConfigs() as T;
                if (fetchedConfig) {
                    setConfig(fetchedConfig);
                } else {
                    console.warn("Empty response received from server.");
                }
            } catch (error) {
                console.error("Error fetching config:", error);
            }
        };

        loadConfig();
    }, []);

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
