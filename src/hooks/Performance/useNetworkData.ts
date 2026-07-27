import { useMemo } from "react";
import { invoke } from "@tauri-apps/api/core";
import usePerformanceConfig from "./usePerformanceConfig";
import {
  type NetworkData,
  useNetworkInterfaces,
  usePaused,
  useSetNetworkSnapshot,
} from "../../services/store";
import { notify } from "../../services/store";
import useSerialPolling from "../useSerialPolling";
import type { NetworkUsage } from "../../bindings";

const MAX_POINTS = 20;

function appendSample<T>(history: T[], value: T) {
  return [...history, value].slice(-MAX_POINTS);
}

const useNetworkData = () => {
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
              usage.download,
            ),
            upload: appendSample(
              previousInterfaceData?.upload ?? [],
              usage.upload,
            ),
            totalDownload: usage.total_download,
            totalUpload: usage.total_upload,
            macAddress: usage.mac_address,
            ipv4Addresses: usage.ipv4_addresses,
            ipv6Addresses: usage.ipv6_addresses,
            linkSpeedMbps: usage.link_speed_mbps,
            connectionState: usage.connection_state,
            interfaceType: usage.interface_type,
            wifiSignalPercent: usage.wifi_signal_percent,
            wifiSignalDbm: usage.wifi_signal_dbm,
            rxErrors: usage.rx_errors,
            txErrors: usage.tx_errors,
            rxDropped: usage.rx_dropped,
            txDropped: usage.tx_dropped,
          };
        });

        return next;
      });
    },
    onError: (error) => {
      console.error("Error fetching network data:", error);
      notify("error.fetch_failed");
    },
    deps: [performanceConfig.config.show_virtual_interfaces, setNetworkSnapshot],
  });

  return useMemo(
    () => ({ interfaceNames }),
    [interfaceNames],
  );
};

export default useNetworkData;
