import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { useZuPerformanceConfig, useSetPerformanceConfig } from "../services/store";

type PerformanceConfig = {
    performance_update_time: number;
    performance_sidebar_background_color: string;
    performance_sidebar_color: string;
    performance_background_color: string;
    performance_label_color: string;
    performance_value_color: string;
    performance_graph_color: string;
    performance_sec_graph_color: string;
};


const usePerformanceConfig = () => {
    const performanceConfig = useZuPerformanceConfig();
    const setPerformanceConfig = useSetPerformanceConfig();

    const [config, setConfig] = useState<PerformanceConfig>({
        performance_update_time: 1000,
        performance_sidebar_background_color: "#333",
        performance_sidebar_color: "#fff",
        performance_background_color: "#2B2B2B",
        performance_label_color: "#6d6d6d",
        performance_value_color: "#fff",
        performance_graph_color: "#09ffff33",
        performance_sec_graph_color: '#ff638433',
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
