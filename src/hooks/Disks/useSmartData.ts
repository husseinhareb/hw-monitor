import { invoke } from "@tauri-apps/api/core";
import { useState, useCallback, useEffect, useRef } from "react";
import type { SmartData } from "../../bindings";

export type { AtaSmartData, NvmeSmartData, SmartAttribute, SmartData } from "../../bindings";

const useSmartData = () => {
  const [data, setData] = useState<SmartData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  useEffect(() => () => {
    requestIdRef.current += 1;
  }, []);

  const fetchSmart = useCallback(async (devPath: string) => {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    setData(null);
    setError(null);
    try {
      const result = await invoke<SmartData>("get_smart_data", { devPath });
      if (requestId === requestIdRef.current) {
        setData(result);
      }
    } catch (e) {
      if (requestId === requestIdRef.current) {
        setError(String(e));
      }
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, []);

  const cancel = useCallback(() => {
    requestIdRef.current += 1;
    setLoading(false);
  }, []);

  return { data, loading, error, fetchSmart, cancel };
};

export default useSmartData;
