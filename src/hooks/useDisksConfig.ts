// useDisksConfig.ts
import { useSetDisksConfig } from "../services/store";
import useFetchAndSetConfig from "../utils/useConfigUtils";

type DisksConfig = {
    disks_update_time: number;
    disks_background_color: string;
    disks_foreground_color: string;
    disks_group_background_color: string;
    disks_group_foreground_color: string;
};

const initialDisksConfig: DisksConfig = {
    disks_update_time: 1000,
    disks_background_color: "#333",
    disks_foreground_color: "#fff",
    disks_group_background_color: "#2B2B2B",
    disks_group_foreground_color: "#6d6d6d",
};

const useDisksConfig = () => {
    const setDisksConfig = useSetDisksConfig();
    return useFetchAndSetConfig(initialDisksConfig, "get_configs", setDisksConfig);
};

export default useDisksConfig;
