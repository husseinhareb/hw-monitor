import React from "react";
import ProcessesConfig from "./ProcessesConfig";
import PerformanceConfig from "./PerformanceConfig";
import { invoke } from "@tauri-apps/api/tauri";

import { Wrapper, Container, StyledButton } from "./Styles/style";
import SensorsConfig from "./SensorsConfig";
import DisksConfig from "./DisksConfig";

const Config: React.FC = () => {
  const load_default_config = async () => {
    try {
      await invoke("set_default_config");
    } catch (error) {
      console.error("Error fetching performance config:", error);
    }
  };

  return (
    <Wrapper>
      <StyledButton onClick={load_default_config}>Load Default Config</StyledButton>
      <Container>
        <ProcessesConfig />
        <PerformanceConfig />
        <SensorsConfig />
        <DisksConfig />
      </Container>
    </Wrapper>
  );
};

export default Config;
