// Config.tsx
import React, { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { useProcessesConfig, useSetProcessesConfig } from "../services/store";

type ProcessConfig = {
    update_time: number;
    background_color: string;
    color: string;
};

const Config: React.FC = () => {
    const [updateTime, setUpdateTime] = useState<number>(0);
    const [backgroundColor, setBackgroundColor] = useState<string>("#ffffff");
    const [color, setColor] = useState<string>("#000000");
    const setProcessesConfig = useSetProcessesConfig();

    const sendData = async (data: ProcessConfig) => {
        try {
            await invoke("set_proc_config", { data });
            console.log(data);
        } catch (error) {
            console.error('Error while sending data to backend:', error);
        }
    };

    const handleUpdateTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = Number(event.target.value);
        setUpdateTime(newValue);
        sendData({ update_time: newValue, background_color: backgroundColor, color: color });
    };

    const handleBackgroundColorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = event.target.value;
        setBackgroundColor(newValue);
        sendData({ update_time: updateTime, background_color: newValue, color: color });
    };

    const handleColorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = event.target.value;
        setColor(newValue);
        sendData({ update_time: updateTime, background_color: backgroundColor, color: newValue });
    };

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const config: ProcessConfig = await invoke("get_process_configs");
                setProcessesConfig(config);
                setUpdateTime(config.update_time);
                setBackgroundColor(config.background_color);
                setColor(config.color);
            } catch (error) {
                console.error("Error fetching process config:", error);
            }
        };
        fetchConfig();
    }, [setProcessesConfig]);

    return (
        <div>
            <h1>Config File</h1>
            <h2>
                Processes
                <hr />
                <p>Update Time</p>
                <input type="number" value={updateTime} onChange={handleUpdateTimeChange} />
                <p>Background Color</p>
                <input type="color" value={backgroundColor} onChange={handleBackgroundColorChange} />
                <p>Color</p>
                <input type="color" value={color} onChange={handleColorChange} />
            </h2>
            <h2>Performance</h2>
            <h2>Sensors</h2>
            <h2>Disks</h2>
        </div>
    );
};

export default Config;
