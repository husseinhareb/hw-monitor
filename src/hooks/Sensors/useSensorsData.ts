import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import useSensorsConfig from "../Sensors/useSensorsConfig";
import { usePaused, notify } from "../../services/store";
import useSerialPolling from "../useSerialPolling";
import type { HwMonData } from "../../bindings";

export type { HwMonData, SensorData } from "../../bindings";

const useSensorsData = (): HwMonData[] => {
  const [sensors, setSensors] = useState<HwMonData[]>([]);
  const sensorsConfig = useSensorsConfig();
  const paused = usePaused();

  useSerialPolling({
    enabled: !paused,
    interval: sensorsConfig.config.sensors_update_time,
    poll: () => invoke<HwMonData[]>("get_sensors"),
    onSuccess: setSensors,
    onError: (error) => {
      console.error("Error fetching data:", error);
      notify('error.fetch_failed');
    },
  });

  return sensors;
};

export default useSensorsData;
