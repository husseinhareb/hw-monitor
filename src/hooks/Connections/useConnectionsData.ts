import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { usePaused, notify } from "../../services/store";
import useSerialPolling from "../useSerialPolling";
import type { Connection } from "../../bindings";

export type { Connection } from "../../bindings";

// Resolving socket owners walks every /proc/[pid]/fd entry on the machine, so
// the table refreshes less aggressively than the process list.
const UPDATE_INTERVAL_MS = 3000;

const useConnectionsData = () => {
    const [connections, setConnections] = useState<Connection[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const paused = usePaused();

    const { pollNow } = useSerialPolling({
        enabled: !paused,
        interval: UPDATE_INTERVAL_MS,
        poll: () => invoke<Connection[]>("get_connections"),
        onSuccess: (fetchedConnections) => {
            setConnections(fetchedConnections);
            setLoading(false);
            setError(null);
        },
        onError: (error) => {
            console.error("Error fetching connections:", error);
            setLoading(false);
            setError(String(error));
            notify("error.connections_failed");
        },
    });

    return { connections, loading, error, refetch: pollNow };
};

export default useConnectionsData;
