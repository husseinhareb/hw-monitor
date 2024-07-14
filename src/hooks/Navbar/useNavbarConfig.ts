import useFetchAndSetConfig from "../../utils/useConfigUtils";

type NavbarConfig = {
    navbar_background_color: string;
    navbar_buttons_background_color: string;
    navbar_buttons_foreground_color: string;
    navbar_search_background_color: string;
    navbar_search_foreground_color: string;
};

const initialNavbarConfig: NavbarConfig = {
    navbar_background_color: "#222222",
    navbar_buttons_background_color: "#f3eae8",
    navbar_buttons_foreground_color: "#212830",
    navbar_search_background_color: "#f3eae8",
    navbar_search_foreground_color: "#212830",
};

const useNavbarConfig = () => {

    return useFetchAndSetConfig(initialNavbarConfig, "get_configs", "set_navbar_configs");
};

export default useNavbarConfig;