import React from "react";
import ProcessesConfig from "./ProcessesConfig";
import PerformanceConfig from "./PerformanceConfig";
import DisksConfig from "./DisksConfig";
import SensorsConfig from "./SensorsConfig";
import { Container } from "./Styles/style";

const Config: React.FC = () => {
    return (
        <Container>
            <ProcessesConfig />
            <PerformanceConfig />
            <DisksConfig />
            <SensorsConfig />
        </Container>
    );
};

export default Config;
