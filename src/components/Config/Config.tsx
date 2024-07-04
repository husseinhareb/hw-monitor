import React, { useState } from "react";
import ProcessesConfig from "./ProcessesConfig";
import PerformanceConfig from "./PerformanceConfig";
import { invoke } from "@tauri-apps/api/tauri";

import { Wrapper, Container, StyledButton } from "./Styles/style";
import SensorsConfig from "./SensorsConfig";
import DisksConfig from "./DisksConfig";
import NavbarConfig from "./NavbarConfig";
import HeatbarConfig from "./HeatbarConfig";

const Config: React.FC = () => {
  const [key, setKey] = useState(0);

  const load_default_config = async () => {
    try {
      await invoke("set_default_config");
      setKey((prevKey) => prevKey + 1); 
    } catch (error) {
      console.error("Error fetching performance config:", error);
    }
  };

  return (
    <Wrapper>
      <StyledButton onClick={load_default_config}>Load Default Config</StyledButton>
      <Container key={key}>
        <ProcessesConfig />
        <PerformanceConfig />
        <SensorsConfig />
        <DisksConfig />
        <HeatbarConfig />
        <NavbarConfig />
      </Container>
    </Wrapper>
  );
};

export default Config;
