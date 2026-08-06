import useFetchAndSetConfig from "../../utils/useConfigUtils";
import type { ConfigData } from "../../bindings";

const connectionsConfigKeys = [
    "connections_update_time",
    "connections_background_color",
    "connections_body_background_color",
    "connections_body_color",
    "connections_head_background_color",
    "connections_head_color",
    "connections_border_color",
] as const;

type ConnectionsConfig = Pick<ConfigData, (typeof connectionsConfigKeys)[number]>;

const useConnectionsConfig = () => {
    const { config, updateConfig, hydrated, hydrating, lastLoadError } =
        useFetchAndSetConfig<ConnectionsConfig>(connectionsConfigKeys, "set_connections_configs");

    return { config, updateConfig, hydrated, hydrating, lastLoadError };
};

export default useConnectionsConfig;
