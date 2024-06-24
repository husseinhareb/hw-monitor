import React from "react";
import ProcessesConfig from "./ProcessesConfig";
import PerformanceConfig from "./PerformanceConfig";
import { invoke } from "@tauri-apps/api/tauri";

import { Container, StyledButton } from "./Styles/style";
import SensorsConfig from "./SensorsConfig";

const Config: React.FC = () => {

    const load_default_config = () => {
        const fetchConfig = async () => {
            try {
                const fetchedConfig: PerformanceConfig | null = await invoke("get_performance_configs");

                if (fetchedConfig) {
                    console.log("Fetched performance config:", fetchedConfig);
                } else {
                    console.warn("Empty response received from server.");
                }
            } catch (error) {
                console.error("Error fetching performance config:", error);
            }
        };   
    }
    
    return (
        <>
            <StyledButton onClick={load_default_config}>Load Default Config</StyledButton>
            <Container>
                <ProcessesConfig />
                <PerformanceConfig />
                <SensorsConfig />
            </Container>
        </>

    );
};

export default Config;
