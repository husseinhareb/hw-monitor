import React, { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/tauri";

type ProcessConfig = {
    update_time: number;
    background_color: string;
    color: string;
};

const Config: React.FC = () => {
    // State variables for inputs
    const [updateTime, setUpdateTime] = useState<number>(0);
    const [backgroundColor, setBackgroundColor] = useState<string>("#ffffff");
    const [color, setColor] = useState<string>("#000000");

    // State to store the fetched process configuration
    const [processConfig, setProcessConfig] = useState<ProcessConfig>({
        update_time: 0,
        background_color: "#ffffff",
        color: "#000000",
    });

    // Function to send data to the backend
    const sendData = async (data: ProcessConfig) => {
        try {
            await invoke("set_proc_config", { data });
            console.log(data);
        } catch (error) {
            console.error('Error while sending data to backend:', error);
        }
    };

    // Event handlers for inputs
    const handleUpdateTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = Number(event.target.value);
        setUpdateTime(newValue);
        sendData({
            update_time: newValue,
            background_color: backgroundColor,
            color: color
        });
    };

    const handleBackgroundColorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = event.target.value;
        setBackgroundColor(newValue);
        sendData({
            update_time: updateTime,
            background_color: newValue,
            color: color
        });
    };

    const handleColorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = event.target.value;
        setColor(newValue);
        sendData({
            update_time: updateTime,
            background_color: backgroundColor,
            color: newValue
        });
    };

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const config: ProcessConfig = await invoke("get_process_configs");
                setProcessConfig(config);
                setUpdateTime(config.update_time);
                setBackgroundColor(config.background_color);
                setColor(config.color);
            } catch (error) {
                console.error("Error fetching process config:", error);
            }
        };

        fetchConfig();
    }, []);

    console.log(processConfig);
    return (
        <div>
            <h1>Config File</h1>
            <h2>
                Processes
                <hr />
                <p>update time</p>
                <input type="number" value={updateTime} onChange={handleUpdateTimeChange} />
                <p>background color</p>
                <input type="color" value={backgroundColor} onChange={handleBackgroundColorChange} />
                <p>color</p>
                <input type="color" value={color} onChange={handleColorChange} />
            </h2>
            <h2>Performance</h2>
            <h2>Sensors</h2>
            <h2>Disks</h2>
        </div>
    );
};

export default Config;
