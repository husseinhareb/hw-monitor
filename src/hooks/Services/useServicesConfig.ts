import useFetchAndSetConfig from "../../utils/useConfigUtils";
import type { ConfigData } from "../../bindings";

const servicesConfigKeys = [
    "services_update_time",
    "services_background_color",
    "services_body_background_color",
    "services_body_color",
    "services_head_background_color",
    "services_head_color",
    "services_border_color",
    "services_active_color",
    "services_inactive_color",
    "services_failed_color",
    "services_transitioning_color",
] as const;

type ServicesConfig = Pick<ConfigData, (typeof servicesConfigKeys)[number]>;

const useServicesConfig = () => {
    const { config, updateConfig, hydrated, hydrating, lastLoadError } =
        useFetchAndSetConfig<ServicesConfig>(servicesConfigKeys, "set_services_configs");

    return { config, updateConfig, hydrated, hydrating, lastLoadError };
};

export default useServicesConfig;
