import React, { useState, useEffect, useRef, FunctionComponent, ChangeEvent } from "react";
import { StyledButton, StyledNav, StyledUl, StyledSearchButton, SearchInput, ContentContainer } from "../styles/navbar-style";
import Proc from "./Processes/Proc";
import Performance from "./Performance/Performance";
import Sensors from "./Sensors/Sensors";
import Disks from "./Disks/Disks";
import { GiProcessor } from "react-icons/gi";
import { MdSpeed } from "react-icons/md";
import { FaFloppyDisk, FaTemperatureHalf } from "react-icons/fa6";
import { FaSearch } from "react-icons/fa";
import { useSetProcessSearch } from "../services/store";

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
    const setProcessSearch = useSetProcessSearch();
    const searchInputRef = useRef<HTMLInputElement>(null);

    const handleButtonClick = (componentName: ComponentName) => {
        setActiveComponent(componentName);
        if (componentName !== "Proc") {
            setShowSearchInput(false);
        }
    };

    const handleSearchButtonClick = () => {
        setShowSearchInput(prev => !prev);
    };

    const handleSearchInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        setProcessSearch(event.target.value);
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

    useEffect(() => {
        if (showSearchInput && searchInputRef.current) {
            searchInputRef.current.focus();
        } else {
            setProcessSearch("");
        }
    }, [showSearchInput, setProcessSearch]);

    const DynamicComponent: FunctionComponent | null = componentMap[activeComponent] || null;

    return (
        <div style={{height: '100%', width: '100',display: 'flex', alignItems: 'center', flexDirection: 'column'}}>
            <StyledNav>
                <StyledUl>
                    <li>
                        <StyledButton onClick={() => handleButtonClick("Proc")} active={activeComponent === "Proc"}>
                            <GiProcessor /> Processes
                        </StyledButton>
                    </li>
                    <li>
                        <StyledButton onClick={() => handleButtonClick("Performance")} active={activeComponent === "Performance"}>
                            <MdSpeed /> Performance
                        </StyledButton>
                    </li>
                    <li>
                        <StyledButton onClick={() => handleButtonClick("Sensors")} active={activeComponent === "Sensors"}>
                            <FaTemperatureHalf /> Sensors
                        </StyledButton>
                    </li>
                    <li>
                        <StyledButton onClick={() => handleButtonClick("Disks")} active={activeComponent === "Disks"}>
                            <FaFloppyDisk /> Disks
                        </StyledButton>
                    </li>
                </StyledUl>
                {activeComponent === "Proc" && (
                    <>
                        {showSearchInput && <SearchInput type="text" placeholder="Search..." onChange={handleSearchInputChange} ref={searchInputRef} />}
                        <StyledSearchButton onClick={handleSearchButtonClick}>
                            <FaSearch />
                        </StyledSearchButton>
                    </>
                )}
            </StyledNav>
            <ContentContainer>
                {DynamicComponent && <DynamicComponent />}
            </ContentContainer>
        </div>
    );
}

export default Navbar;
