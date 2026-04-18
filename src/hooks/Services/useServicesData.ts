import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { usePaused, notify } from "../../services/store";
import useSerialPolling from "../useSerialPolling";

export interface SystemService {
    name: string;
    description: string;
    load_state: string;
    active_state: string;
    sub_state: string;
    unit_file_state: string;
}

const useServicesData = () => {
    const [services, setServices] = useState<SystemService[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const paused = usePaused();

    const { pollNow } = useSerialPolling({
        enabled: !paused,
        interval: 5000,
        poll: () => invoke<SystemService[]>("get_services"),
        onSuccess: (fetchedServices) => {
            setServices(fetchedServices);
            setLoading(false);
            setError(null);
        },
        onError: (error) => {
            console.error("Error fetching services:", error);
            setLoading(false);
            setError(String(error));
            notify("error.fetch_failed");
        },
    });

    return { services, loading, error, refetch: pollNow };
};

export default useServicesData;
