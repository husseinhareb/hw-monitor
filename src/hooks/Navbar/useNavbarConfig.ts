import useFetchAndSetConfig from "../../utils/useConfigUtils";

type NavbarConfig = {
    navbar_background_color: string;
    navbar_buttons_background_color: string;
    navbar_buttons_foreground_color: string;
    navbar_search_background_color: string;
    navbar_search_foreground_color: string;
};

const navbarConfigKeys = [
    "navbar_background_color",
    "navbar_buttons_background_color",
    "navbar_buttons_foreground_color",
    "navbar_search_background_color",
    "navbar_search_foreground_color",
] as const;

const useNavbarConfig = () => {
    return useFetchAndSetConfig<NavbarConfig>(navbarConfigKeys, "set_navbar_configs");
};

export default useNavbarConfig;
