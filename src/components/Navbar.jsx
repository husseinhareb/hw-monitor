import React, { useState } from "react";
import { StyledButton, StyledNav, StyledUl } from "../styled-components/navbar-style";
import Proc from "./Proc";
import Sidebar from "./Performance";
import Sensors from "./Sensors";
import Disks from "./Disks";

function Navbar() {
    const [activeComponent, setActiveComponent] = useState("Proc");

    const componentMap = {
        Proc: Proc,
        Sidebar: Sidebar,
        Sensors: Sensors,
        Disks: Disks
    };

    const handleButtonClick = (componentName) => {
        setActiveComponent(componentName);
    };

    const DynamicComponent = componentMap[activeComponent]; // Get the component dynamically

    return (
        <div>
            <StyledNav>
                <StyledUl>
                    <li>
                        <StyledButton onClick={() => handleButtonClick("Proc")}>Processes</StyledButton>
                    </li>
                    <li>
                        <StyledButton onClick={() => handleButtonClick("Sidebar")}>Performance</StyledButton>
                    </li>
                    <li>
                        <StyledButton onClick={() => handleButtonClick("Sensors")}>Sensors</StyledButton>
                    </li>
                    <li>
                        <StyledButton onClick={() => handleButtonClick("Disks")}>Disks</StyledButton>
                    </li>
                </StyledUl>
            </StyledNav>
            <div>
                {DynamicComponent && <DynamicComponent />}
            </div>
        </div>
    );
}

export default Navbar;
