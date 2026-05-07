import useFetchAndSetConfig from "../../utils/useConfigUtils";
import type { ConfigData } from "../../bindings";

const disksConfigKeys = [
    "disks_update_time",
    "disks_background_color",
    "disks_boxes_background_color",
    "disks_name_foreground_color",
    "disks_size_foreground_color",
    "disks_partition_background_color",
    "disks_partition_usage_background_color",
    "disks_partition_name_foreground_color",
    "disks_partition_type_foreground_color",
    "disks_partition_usage_foreground_color",
] as const;

type DisksConfig = Pick<ConfigData, (typeof disksConfigKeys)[number]>;

const useDisksConfig = () => {
    return useFetchAndSetConfig<DisksConfig>(disksConfigKeys, "set_disks_configs");
};

export default useDisksConfig;
