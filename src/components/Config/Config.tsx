// Config.tsx
import React from "react";
import ProcessesConfig from "./ProcessesConfig";
import PerformanceConfig from "./PerformanceConfig";

const Config: React.FC = () => {

    return (
        <div>
            <h1>Config File</h1>
            <ProcessesConfig />
            <PerformanceConfig/>
            <h2>Sensors</h2>
            <h2>Disks</h2>
        </div>
    );
};

export default Config;
