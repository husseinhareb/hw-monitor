import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { useZuPerformanceConfig, useSetPerformanceConfig } from "../services/store";

type PerformanceConfig = {
    update_time: number;
    body_background_color: string;
    body_color: string;
    head_background_color: string;
    head_color: string;
};

const usePerformanceConfig = () => {
    const performanceConfig = useZuPerformanceConfig();
    const setPerformanceConfig = useSetPerformanceConfig();

    const [config, setConfig] = useState<PerformanceConfig>({
        update_time: 1000,
        body_background_color: "#ffffff",
        body_color: "#000000",
        head_background_color: "#252526",
        head_color: "#ffffff",
    });

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const fetchedConfig: PerformanceConfig | null = await invoke("get_performance_configs");

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
    }, [setPerformanceConfig]);

    const sendData = async (data: PerformanceConfig) => {
        try {
            await invoke("set_performance_config", { data });
            setPerformanceConfig(data);
        } catch (error) {
            console.error('Error while sending data to backend:', error);
        }
    };

    const updateConfig = (key: keyof PerformanceConfig, value: string | number) => {
        const newConfig = { ...config, [key]: value };
        setConfig(newConfig);
        sendData(newConfig);
    };

    // Update local config when performanceConfig changes
    useEffect(() => {
        if (performanceConfig) {
            setConfig(performanceConfig);
        }
    }, [performanceConfig]);

    return {
        config,
        updateConfig,
    };
};

export default usePerformanceConfig;
