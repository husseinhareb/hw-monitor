import React, { useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";

const Config: React.FC = () => {
    // State variables for inputs
    const [updateTime, setUpdateTime] = useState<number>(0);
    const [backgroundColor, setBackgroundColor] = useState<string>("#ffffff");
    const [color, setColor] = useState<string>("#000000");

    // Function to send data to the backend
    const sendData = async () => {
        const data = {
            update_time: updateTime, // Ensure keys match the Rust struct
            background_color: backgroundColor, // Ensure keys match the Rust struct
            color: color // Ensure keys match the Rust struct
        };

        try {
            await invoke("set_proc_config", { data });
            console.log(data);
        } catch (error) {
            console.error('Error while sending data to backend:', error);
        }
    };

    // Event handlers for inputs
    const handleUpdateTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setUpdateTime(Number(event.target.value));
        sendData();
    };

    const handleBackgroundColorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setBackgroundColor(event.target.value);
        sendData();
    };

    const handleColorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setColor(event.target.value);
        sendData();
    };

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
