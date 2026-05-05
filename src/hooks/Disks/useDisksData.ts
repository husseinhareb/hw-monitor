import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { convertData } from "../../helpers/useDataConverter";
import useDisksConfig from "./useDisksConfig";
import { usePaused, notify } from "../../services/store";
import useSerialPolling from "../useSerialPolling";

interface PartitionData {
    name: string;
    dev_path: string;
    major: number;
    minor: number;
    size: number;
    partition_number?: number;
    partuuid?: string;
    start_sector?: number;
    read_only?: boolean;
    alignment_offset?: number;
    discard_alignment?: number;
    holders: string[];
    file_system?: string;
    available_space?: number;
    total_space?: number;
    used_space?: number;
    mount_point?: string;
}

interface DiskData {
    name: string;
    dev_path: string;
    major: number;
    minor: number;
    sysfs_path?: string;
    model?: string;
    vendor?: string;
    serial?: string;
    firmware_rev?: string;
    wwid?: string;
    transport?: string;
    device_state?: string;
    partitions: PartitionData[];
    size: number;
    rotational: boolean;
    physical_block_size: number;
    logical_block_size: number;
    removable: boolean;
    read_only: boolean;
    trim_supported: boolean;
    scheduler?: string;
    active_scheduler?: string;
    available_schedulers: string[];
    write_cache?: string;
    queue_depth?: number;
    read_ahead_kb?: number;
    max_sectors_kb?: number;
    max_hw_sectors_kb?: number;
    minimum_io_size?: number;
    optimal_io_size?: number;
    discard_granularity?: number;
    discard_max_bytes?: number;
    discard_zeroes_data?: boolean;
    fua?: boolean;
    dax?: boolean;
    zoned?: string;
    nr_zones?: number;
    numa_node?: number;
    queue_count?: number;
    controller_id?: string;
    controller_address?: string;
    subsystem_nqn?: string;
    holders: string[];
    slaves: string[];
    read_speed: string;
    write_speed: string;
    read_iops: string;
    write_iops: string;
    io_busy_percent: string;
    total_read: number;
    total_write: number;
    total_discarded: number;
    total_reads: number;
    total_writes: number;
    total_discards: number;
    total_flushes: number;
    io_in_progress: number;
    io_time_ms: number;
    weighted_io_time_ms: number;
}

const useDiskData = () => {
    const [diskData, setDiskData] = useState<DiskData[]>([]);
    const [error, setError] = useState<string | null>(null);
    const disksConfig = useDisksConfig();
    const paused = usePaused();
    useSerialPolling({
        enabled: !paused,
        interval: disksConfig.config.disks_update_time,
        poll: () => invoke<DiskData[]>("get_disks"),
        onSuccess: (fetchedDiskData) => {
            setDiskData(fetchedDiskData);
            setError(null);
        },
        onError: (err) => {
            console.error("Error fetching data:", err);
            notify('error.disks_failed');
            setError(String(err));
            setDiskData([]);
        },
    });

    return { diskData, convertData, error };
};

export default useDiskData;
