import React, { useState, useEffect, useRef, FunctionComponent, ChangeEvent } from "react";
import styled from 'styled-components';
import { GiProcessor } from "react-icons/gi";
import { MdSpeed } from "react-icons/md";
import { FaFloppyDisk, FaTemperatureHalf } from "react-icons/fa6";
import { FaSearch } from "react-icons/fa";
import { LuSettings2 } from "react-icons/lu";
import { StyledButton, StyledNav, StyledUl, StyledSearchButton, SearchInput, ContentContainer, ConfigButtonContainer } from "../../styles/navbar-style";
import Proc from "../Processes/Proc";
import Performance from "../Performance/Performance";
import Sensors from "../Sensors/Sensors";
import Disks from "../Disks/Disks";
import Config from "../Config/Config";
import { useSetProcessSearch } from "../../services/store";
import useNavbarConfig from "../../hooks/Navbar/useNavbarConfig";
import { useTranslation } from "react-i18next";

type ComponentName = "Proc" | "Performance" | "Sensors" | "Disks" | "Config";

const componentMap: { [key in ComponentName]: FunctionComponent<any> } = {
    Proc,
    Performance,
    Sensors,
    Disks,
    Config
};

// Create a styled container with overflow: hidden
const ProcContainer = styled.div`
    height: 100%;
    width: 100%;
    overflow: hidden;
`;

const MainContainer = styled.div`
    height: 100%;
    width: 100%;
    display: flex;
    align-items: center;
    flex-direction: column;
    overflow: hidden;
`;

const Navbar: React.FC = () => {
    const { t } =useTranslation(); 
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

    useEffect(() => {
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

    const DynamicComponent = componentMap[activeComponent] || null;

    return (
        <MainContainer>
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
                            <GiProcessor /> {t('navbar.processes')}
                        </StyledButton>
                    </li>
                    <li>
                        <StyledButton
                            navbarButtonsBackgroundColor={navbarConfig.config.navbar_buttons_background_color}
                            navbarButtonsForegroundColor={navbarConfig.config.navbar_buttons_foreground_color}
                            onClick={() => handleButtonClick("Performance")} active={activeComponent === "Performance"}
                        >
                            <MdSpeed /> {t('navbar.performance')}
                        </StyledButton>
                    </li>
                    <li>
                        <StyledButton
                            navbarButtonsBackgroundColor={navbarConfig.config.navbar_buttons_background_color}
                            navbarButtonsForegroundColor={navbarConfig.config.navbar_buttons_foreground_color}
                            onClick={() => handleButtonClick("Sensors")} active={activeComponent === "Sensors"}
                        >
                            <FaTemperatureHalf /> {t('navbar.sensors')}
                        </StyledButton>
                    </li>
                    <li>
                        <StyledButton
                            navbarButtonsBackgroundColor={navbarConfig.config.navbar_buttons_background_color}
                            navbarButtonsForegroundColor={navbarConfig.config.navbar_buttons_foreground_color}
                            onClick={() => handleButtonClick("Disks")} active={activeComponent === "Disks"}
                        >
                            <FaFloppyDisk /> {t('navbar.disks')}
                        </StyledButton>
                    </li>
                </StyledUl>
                {activeComponent === "Proc" && (
                    <>
                        {showSearchInput && <SearchInput
                        navbarSearchBackgroundColor={navbarConfig.config.navbar_search_background_color}
                        navbarSearchForegroundColor={navbarConfig.config.navbar_search_foreground_color}
                        type="text" placeholder={t('navbar.search.placeholder')} onChange={handleSearchInputChange} ref={searchInputRef} />}
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
                {activeComponent === "Proc" ? (
                    <ProcContainer>
                        <Proc />
                    </ProcContainer>
                ) : (
                    DynamicComponent && <DynamicComponent />
                )}
            </ContentContainer>
        </MainContainer>
    );
}

export default Navbar;
