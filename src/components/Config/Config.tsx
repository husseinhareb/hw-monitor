// Config.tsx
import React from "react";
import ProcessesConfig from "./ProcessesConfig";

const Config: React.FC = () => {

    return (
        <div>
            <h1>Config File</h1>
            <ProcessesConfig />
            <h2>Performance</h2>
            <h2>Sensors</h2>
            <h2>Disks</h2>
        </div>
    );
};

export default Config;
