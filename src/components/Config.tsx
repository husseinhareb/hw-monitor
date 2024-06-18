// Config.tsx
import React from "react";
import useProcessConfig from "../hooks/useProcessConfig";

const Config: React.FC = () => {
    const {
        config,
        updateConfig,
    } = useProcessConfig();

    return (
        <div>
            <h1>Config File</h1>
            <h2>
                Processes
                <hr />
                <p>Update Time</p>
                <input
                    type="number"
                    value={config.update_time}
                    min={1000}
                    step={100}
                    onChange={(e) => updateConfig("update_time", Number(e.target.value))}
                />
                <p>Body Background Color</p>
                <input
                    type="color"
                    value={config.body_background_color}
                    onChange={(e) => updateConfig("body_background_color", e.target.value)}
                />
                <p>Body Color</p>
                <input
                    type="color"
                    value={config.body_color}
                    onChange={(e) => updateConfig("body_color", e.target.value)}
                />
                <p>Head Background Color</p>
                <input
                    type="color"
                    value={config.head_background_color}
                    onChange={(e) => updateConfig("head_background_color", e.target.value)}
                />
                <p>Head Color</p>
                <input
                    type="color"
                    value={config.head_color}
                    onChange={(e) => updateConfig("head_color", e.target.value)}
                />
                <label>
                    <input
                        type="radio"
                        value="user"
                    />
                    User
                </label>
                <label>
                    <input
                        type="radio"
                        value="pid"
                    />
                    Pid
                </label>
                <label>
                    <input
                        type="radio"
                        value="ppid"
                    />
                    Ppid
                </label>
                <label>
                    <input
                        type="radio"
                        value="name"
                    />
                    Name
                </label>
                <label>
                    <input
                        type="radio"
                        value="state"
                    />
                    State
                </label>
                <label>
                    <input
                        type="radio"
                        value="memory"
                    />
                    Memory
                </label>
                <label>
                    <input
                        type="radio"
                        value="cpu"
                    />
                    Cpu Usage
                </label>
                <label>
                    <input
                        type="radio"
                        value="diskReadTotal"
                    />
                    Disk Read Total
                </label>
                <label>
                    <input
                        type="radio"
                        value="diskWriteTotal"
                    />
                    Disk Write Total
                </label>
                <label>
                    <input
                        type="radio"
                        value="User"
                    />
                    User
                </label>
                <label>
                    <input
                        type="radio"
                        value="User"
                    />
                    User
                </label>
                <label>
                    <input
                        type="radio"
                        value="User"
                    />
                    User
                </label>
            </h2>
            <h2>Performance</h2>
            <h2>Sensors</h2>
            <h2>Disks</h2>
        </div>
    );
};

export default Config;
