import useFetchAndSetConfig from "../../utils/useConfigUtils";

type DisksConfig = {
    disks_update_time: number;
    disks_background_color: string;
    disks_boxes_background_color: string;
    disks_name_foreground_color: string;
    disks_size_foreground_color: string;
    disks_partition_background_color: string;
    disks_partition_usage_background_color: string;
    disks_partition_name_foreground_color: string;
    disks_partition_type_foreground_color: string;
    disks_partition_usage_foreground_color: string;
};

const initialDisksConfig: DisksConfig = {
    disks_update_time: 5000,
    disks_background_color: "#2b2b2b",
    disks_boxes_background_color: "#3a3a3a",
    disks_name_foreground_color: "#ffffff",
    disks_size_foreground_color: "#cccccc",
    disks_partition_background_color: "#4a4a4a",
    disks_partition_usage_background_color: "#2b2b2b",
    disks_partition_name_foreground_color: "#61dafb",
    disks_partition_type_foreground_color: "#a3be8c",
    disks_partition_usage_foreground_color: "#ffcb6b",
};

const useDisksConfig = () => {
    return useFetchAndSetConfig(initialDisksConfig, "get_configs", "set_disks_configs");
};

export default useDisksConfig;
