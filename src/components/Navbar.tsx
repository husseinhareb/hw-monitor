import React, { useState, useEffect, FunctionComponent } from "react";
import { StyledButton, StyledNav, StyledUl, StyledSearchButton, SearchInput } from "../styles/navbar-style";
import Proc from "./Processes/Proc";
import Performance from "./Performance/Performance";
import Sensors from "./Sensors/Sensors";
import Disks from "./Disks/Disks";
import { GiProcessor } from "react-icons/gi";
import { MdSpeed } from "react-icons/md";
import { FaFloppyDisk, FaTemperatureHalf } from "react-icons/fa6";
import { FaSearch } from "react-icons/fa"; 

type ComponentName = "Proc" | "Performance" | "Sensors" | "Disks";

const componentMap: { [key in ComponentName]: FunctionComponent<any> } = {
    Proc,
    Performance,
    Sensors,
    Disks
};

const Navbar: React.FC = () => {
    const [activeComponent, setActiveComponent] = useState<ComponentName>("Proc");
    const [showSearchInput, setShowSearchInput] = useState(false);

    const handleButtonClick = (componentName: ComponentName) => {
        setActiveComponent(componentName);
    };

    const handleSearchButtonClick = () => {
        setShowSearchInput(!showSearchInput);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
        if (event.altKey) {
            switch (event.key) {
                case '1':
                    setActiveComponent("Proc");
                    break;
                case '2':
                    setActiveComponent("Performance");
                    break;
                case '3':
                    setActiveComponent("Sensors");
                    break;
                case '4':
                    setActiveComponent("Disks");
                    break;
                default:
                    break;
            }
        }
    };

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    const DynamicComponent: FunctionComponent | null = componentMap[activeComponent] || null;

    return (
        <div>
            <StyledNav>
                <StyledUl>
                    <li>
                        <StyledButton onClick={() => handleButtonClick("Proc")}><GiProcessor /> Processes</StyledButton>
                    </li>
                    <li>
                        <StyledButton onClick={() => handleButtonClick("Performance")}><MdSpeed /> Performance</StyledButton>
                    </li>
                    <li>
                        <StyledButton onClick={() => handleButtonClick("Sensors")}><FaTemperatureHalf /> Sensors</StyledButton>
                    </li>
                    <li>
                        <StyledButton onClick={() => handleButtonClick("Disks")}><FaFloppyDisk /> Disks</StyledButton>
                    </li>
                </StyledUl>
                {activeComponent === "Proc" && (
                    <>
                        {showSearchInput && <SearchInput type="text" placeholder="Search..." />}
                        <StyledSearchButton onClick={handleSearchButtonClick}>
                            <FaSearch style={{ marginLeft: '0.5em' }} />
                        </StyledSearchButton>
                    </>
                )}
            </StyledNav>
            <div>
                {DynamicComponent && <DynamicComponent />}
            </div>
        </div>
    );
}

export default Navbar;
