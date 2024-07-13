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
            // Optional cleanup function if needed
        };
    }, [getConfigKey]); // Ensure getConfigKey is the only dependency if it changes


    let isSending = false;

    const sendData = async (data: T) => {
        if (isSending) return; // Prevent multiple sends
        isSending = true;
        try {
            console.log("Sending data", data);
            await invoke("set_config", { config: data });
            setConfigFunction(data);
        } catch (error) {
            console.error("Error while sending data to backend:", error);
        } finally {
            isSending = false; // Reset the flag after sending
        }
    };


    const updateConfig = async (key: keyof T, value: string | number | string[]) => {
        try {
            const fetchedConfig: T | null = await invoke(getConfigKey);
            if (fetchedConfig) {
                const newConfig = { ...fetchedConfig, [key]: value };
                setConfig(newConfig);
                await sendData(newConfig); // Wait for sendData to complete before setting new state
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
