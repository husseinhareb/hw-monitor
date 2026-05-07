import useFetchAndSetConfig from "../../utils/useConfigUtils";
import type { ConfigData } from "../../bindings";

const navbarConfigKeys = [
    "navbar_background_color",
    "navbar_buttons_background_color",
    "navbar_buttons_foreground_color",
    "navbar_search_background_color",
    "navbar_search_foreground_color",
] as const;

type NavbarConfig = Pick<ConfigData, (typeof navbarConfigKeys)[number]>;

const useNavbarConfig = () => {
    return useFetchAndSetConfig<NavbarConfig>(navbarConfigKeys, "set_navbar_configs");
};

export default useNavbarConfig;
