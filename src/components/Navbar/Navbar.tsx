import React, { useState, useEffect, useRef, FunctionComponent, ChangeEvent } from "react";
import { StyledButton, StyledNav, StyledUl, StyledSearchButton, SearchInput, ContentContainer, ConfigButtonContainer } from "../../styles/navbar-style";
import Proc from "../Processes/Proc";
import Performance from "../Performance/Performance";
import Sensors from "../Sensors/Sensors";
import Disks from "../Disks/Disks";
import Config from "../Config/Config";
import { GiProcessor } from "react-icons/gi";
import { MdSpeed } from "react-icons/md";
import { FaFloppyDisk, FaTemperatureHalf } from "react-icons/fa6";
import { FaSearch } from "react-icons/fa";
import { useSetProcessSearch } from "../../services/store";
import { LuSettings2 } from "react-icons/lu";
import useNavbarConfig from "../../hooks/Navbar/useNavbarConfig";

type ComponentName = "Proc" | "Performance" | "Sensors" | "Disks" | "Config";

const componentMap: { [key in ComponentName]: FunctionComponent<any> } = {
    Proc,
    Performance,
    Sensors,
    Disks,
    Config
};

const Navbar: React.FC = () => {
    const [activeComponent, setActiveComponent] = useState<ComponentName>("Proc");
    const [showSearchInput, setShowSearchInput] = useState(false);
    const setProcessSearch = useSetProcessSearch();
    const searchInputRef = useRef<HTMLInputElement>(null);
    const navbarConfig = useNavbarConfig();

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
                case '0':
                    setActiveComponent("Config");
                    break;
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
        <div style={{ height: '100%', width: '100%', display: 'flex', alignItems: 'center', flexDirection: 'column',overflow: 'hidden' }}>
            <StyledNav
                navbarBackgroundColor={navbarConfig.config.navbar_background_color}
            >
                <ConfigButtonContainer>
                    <StyledButton
                        navbarButtonsBackgroundColor={navbarConfig.config.navbar_buttons_background_color}
                        navbarButtonsForegroundColor={navbarConfig.config.navbar_buttons_foreground_color}
                        onClick={() => handleButtonClick("Config")} active={activeComponent === "Config"}
                    >
                        <LuSettings2 />
                    </StyledButton>
                </ConfigButtonContainer>
                <StyledUl>
                    <li>
                        <StyledButton
                            navbarButtonsBackgroundColor={navbarConfig.config.navbar_buttons_background_color}
                            navbarButtonsForegroundColor={navbarConfig.config.navbar_buttons_foreground_color}
                            onClick={() => handleButtonClick("Proc")} active={activeComponent === "Proc"}
                        >
                            <GiProcessor /> Processes
                        </StyledButton>
                    </li>
                    <li>
                        <StyledButton
                            navbarButtonsBackgroundColor={navbarConfig.config.navbar_buttons_background_color}
                            navbarButtonsForegroundColor={navbarConfig.config.navbar_buttons_foreground_color}
                            onClick={() => handleButtonClick("Performance")} active={activeComponent === "Performance"}
                        >
                            <MdSpeed /> Performance
                        </StyledButton>
                    </li>
                    <li>
                        <StyledButton
                            navbarButtonsBackgroundColor={navbarConfig.config.navbar_buttons_background_color}
                            navbarButtonsForegroundColor={navbarConfig.config.navbar_buttons_foreground_color}
                            onClick={() => handleButtonClick("Sensors")} active={activeComponent === "Sensors"}
                        >
                            <FaTemperatureHalf /> Sensors
                        </StyledButton>
                    </li>
                    <li>
                        <StyledButton
                            navbarButtonsBackgroundColor={navbarConfig.config.navbar_buttons_background_color}
                            navbarButtonsForegroundColor={navbarConfig.config.navbar_buttons_foreground_color}
                            onClick={() => handleButtonClick("Disks")} active={activeComponent === "Disks"}
                        >
                            <FaFloppyDisk /> Disks
                        </StyledButton>
                    </li>
                </StyledUl>
                {activeComponent === "Proc" && (
                    <>
                        {showSearchInput && <SearchInput
                        navbarSearchBackgroundColor={navbarConfig.config.navbar_search_background_color}
                        navbarSearchForegroundColor={navbarConfig.config.navbar_search_foreground_color}
                        type="text" placeholder="Search..." onChange={handleSearchInputChange} ref={searchInputRef} />}
                        <StyledSearchButton
                        navbarButtonsBackgroundColor={navbarConfig.config.navbar_buttons_background_color}
                        navbarButtonsForegroundColor={navbarConfig.config.navbar_buttons_foreground_color}
                        onClick={handleSearchButtonClick}>
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
