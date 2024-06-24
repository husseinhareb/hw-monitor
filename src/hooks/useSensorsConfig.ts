import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { useZuSensorsConfig, useSetSensorsConfig } from "../services/store";

type SensorsConfig = {
    sensors_update_time: number;
    sensors_background_color: string;
    sensors_foreground_color: string;
    sensors_group_background_color: string;
    sensors_group_foreground_color: string;
};


const useSensorsConfig = () => {
    const SensorsConfig = useZuSensorsConfig();
    const setSensorsConfig = useSetSensorsConfig();

    const [config, setConfig] = useState<SensorsConfig>({
        sensors_update_time: 1000,
        sensors_background_color: "#333",
        sensors_foreground_color: "#fff",
        sensors_group_background_color: "#2B2B2B",
        sensors_group_foreground_color: "#6d6d6d",

    });

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const fetchedConfig: SensorsConfig | null = await invoke("get_sensors_configs");

                if (fetchedConfig) {
                    console.log("Fetched performance config:", fetchedConfig);
                    setConfig(fetchedConfig);
                } else {
                    console.warn("Empty response received from server.");
                }
            } catch (error) {
                console.error("Error fetching performance config:", error);
            }
        };

        fetchConfig(); // Initial fetch

        return () => {
            // No interval cleanup needed here
        };
    }, [setSensorsConfig]);

    const sendData = async (data: SensorsConfig) => {
        try {
            await invoke("set_sensors_config", { data });
            setSensorsConfig(data);
        } catch (error) {
            console.error('Error while sending data to backend:', error);
        }
    };

    const updateConfig = (key: keyof SensorsConfig, value: string | number) => {
        const newConfig = { ...config, [key]: value };
        setConfig(newConfig);
        sendData(newConfig);
    };

    // Update local config when SensorsConfig changes
    useEffect(() => {
        if (SensorsConfig) {
            setConfig(SensorsConfig);
        }
    }, [SensorsConfig]);

    return {
        config,
        updateConfig,
    };
};

export default useSensorsConfig;
