import React, { useState, FunctionComponent } from "react";
import { StyledButton, StyledNav, StyledUl } from "../styled-components/navbar-style";
import Proc from "./Proc";
import Sidebar from "./Performance";
import Sensors from "./Sensors";
import Disks from "./Disks";

type ComponentName = "Proc" | "Sidebar" | "Sensors" | "Disks";

const componentMap: { [key in ComponentName]: FunctionComponent<any> } = {
    Proc,
    Sidebar,
    Sensors,
    Disks
};

const Navbar: React.FC = () => {
    const [activeComponent, setActiveComponent] = useState<ComponentName>("Proc");

    const handleButtonClick = (componentName: ComponentName) => {
        setActiveComponent(componentName);
    };

    const DynamicComponent: FunctionComponent | null = componentMap[activeComponent] || null;

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
