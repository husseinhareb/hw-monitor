import { invoke } from "@tauri-apps/api/core";
import useProcessConfig from '../Proc/useProcessConfig';
import { type TotalUsages, usePaused, useTotalUsages, useSetTotalUsages, notify } from '../../services/store';
import useSerialPolling from '../useSerialPolling';

const useTotalUsagesData = (): TotalUsages => {
    const totalUsages = useTotalUsages();
    const setTotalUsages = useSetTotalUsages();
    const processConfig = useProcessConfig();
    const paused = usePaused();
    useSerialPolling({
        enabled: !paused,
        interval: processConfig.config.processes_update_time,
        poll: () => invoke<TotalUsages>("get_total_usages"),
        onSuccess: setTotalUsages,
        onError: (error) => {
            console.error("Error fetching data:", error);
            notify('error.fetch_failed');
        },
    });

    return totalUsages;
};

export default useTotalUsagesData;
