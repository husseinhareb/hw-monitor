import { invoke } from "@tauri-apps/api/core";
import { useState, useCallback } from "react";

export type SmartAttribute = {
  id: number;
  name: string;
  current: number;
  worst: number;
  threshold: number;
  raw: number;
  raw_string: string;
  pre_failure: boolean;
  failed: boolean;
};

export type AtaSmartData = {
  type: "Ata";
  overall_health: boolean;
  attributes: SmartAttribute[];
  power_on_hours: number | null;
  temperature_celsius: number | null;
  reallocated_sectors: number | null;
  pending_sectors: number | null;
  uncorrectable_sectors: number | null;
};

export type NvmeSmartData = {
  type: "Nvme";
  overall_health: boolean;
  critical_warning: number;
  temperature_celsius: number | null;
  available_spare_percent: number;
  available_spare_threshold: number;
  percentage_used: number;
  power_on_hours: number | null;
  power_cycles: number | null;
  unsafe_shutdowns: number | null;
  media_errors: number | null;
  data_units_read_gb: number | null;
  data_units_written_gb: number | null;
  limited: boolean;
};

export type SmartData = AtaSmartData | NvmeSmartData;

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
