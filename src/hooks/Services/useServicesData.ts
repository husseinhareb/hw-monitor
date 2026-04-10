import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { usePaused, notify } from "../../services/store";

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
    const paused = usePaused();

    const fetchServices = async () => {
        try {
            const fetched: SystemService[] = await invoke("get_services");
            setServices(fetched);
        } catch (error) {
            console.error("Error fetching services:", error);
            notify("error.fetch_failed");
        }
    };

    useEffect(() => {
        if (paused) return;
        fetchServices();
        const intervalId = setInterval(fetchServices, 5000);
        return () => clearInterval(intervalId);
    }, [paused]);

    return { services, refetch: fetchServices };
};

export default useServicesData;
