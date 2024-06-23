import React from "react";
import ProcessesConfig from "./ProcessesConfig";
import PerformanceConfig from "./PerformanceConfig";

import { Container } from "./Styles/style";

const Config: React.FC = () => {
    return (
        <Container>
            <ProcessesConfig />
            <PerformanceConfig />
        </Container>
    );
};

export default Config;
