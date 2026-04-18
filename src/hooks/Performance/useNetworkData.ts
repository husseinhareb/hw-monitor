import { useMemo } from "react";
import { invoke } from "@tauri-apps/api/core";
import useDataConverter from "../../helpers/useDataConverter";
import usePerformanceConfig from "./usePerformanceConfig";
import {
  type NetworkData,
  useNetworkInterfaces,
  usePaused,
  useSetNetworkSnapshot,
} from "../../services/store";
import { notify } from "../../services/store";
import useSerialPolling from "../useSerialPolling";

interface NetworkUsage {
  download: number;
  upload: number;
  total_download: number;
  total_upload: number;
  interface: string;
}

const MAX_POINTS = 20;

function appendSample<T>(history: T[], value: T) {
  return [...history, value].slice(-MAX_POINTS);
}

const useNetworkData = () => {
  const convertData = useDataConverter();
  const performanceConfig = usePerformanceConfig();
  const paused = usePaused();
  const interfaceNames = useNetworkInterfaces();
  const setNetworkSnapshot = useSetNetworkSnapshot();

  useSerialPolling({
    enabled: !paused,
    interval: performanceConfig.config.performance_update_time,
    poll: () =>
      invoke<NetworkUsage[]>("get_network", {
        showVirtual: performanceConfig.config.show_virtual_interfaces,
      }),
    onSuccess: (fetchedNetworkUsages) => {
      setNetworkSnapshot((previous) => {
        const next: Record<string, NetworkData> = {};

        fetchedNetworkUsages.forEach((usage) => {
          const previousInterfaceData = previous[usage.interface];
          next[usage.interface] = {
            download: appendSample(
              previousInterfaceData?.download ?? [],
              convertData(usage.download),
            ),
            upload: appendSample(
              previousInterfaceData?.upload ?? [],
              convertData(usage.upload),
            ),
            totalDownload: usage.total_download,
            totalUpload: usage.total_upload,
          };
        });

        return next;
      });
    },
    onError: (error) => {
      console.error("Error fetching network data:", error);
      notify("error.fetch_failed");
    },
    deps: [convertData, performanceConfig.config.show_virtual_interfaces, setNetworkSnapshot],
  });

  return useMemo(
    () => ({ interfaceNames }),
    [interfaceNames],
  );
};

export default useNetworkData;
