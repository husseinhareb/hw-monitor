import { invoke } from "@tauri-apps/api/core";
import { useState, useCallback } from "react";
import type { SmartData } from "../../bindings";

export type { AtaSmartData, NvmeSmartData, SmartAttribute, SmartData } from "../../bindings";

const useSmartData = () => {
  const [data, setData] = useState<SmartData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [restartRequired, setRestartRequired] = useState(false);

  const fetchSmart = useCallback(async (devPath: string) => {
    setLoading(true);
    setData(null);
    setError(null);
    try {
      const result = await invoke<SmartData>("get_smart_data", { devPath });
      setData(result);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  const fixPermissions = useCallback(async (_devPath: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      await invoke("fix_nvme_permissions", { password });
      // setcap takes effect on next launch — signal UI to show restart prompt
      setRestartRequired(true);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, fetchSmart, fixPermissions, restartRequired };
};

export default useSmartData;
