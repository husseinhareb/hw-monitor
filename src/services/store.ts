import { create } from "zustand";

interface ProcessConfig {
  processes_update_time: number;
  processes_body_background_color: string;
  processes_body_color: string;
  processes_head_background_color: string;
  processes_head_color: string;
  processes_table_values: string[]; 
}

interface PerformanceConfig {
  performance_update_time: number;
  performance_sidebar_background_color: string;
  performance_sidebar_color: string;
  performance_sidebar_selected_color: string;
  performance_background_color: string;
  performance_title_color: string;
  performance_label_color: string;
  performance_value_color: string;
  performance_graph_color: string;
  performance_sec_graph_color: string;
}

interface SensorsConfig {
  sensors_update_time: number;
  sensors_background_color: string;
  sensors_foreground_color: string;
  sensors_boxes_background_color: string;
  sensors_boxes_foreground_color: string;
  sensors_boxes_title_foreground_color: string;
  sensors_battery_background_color: string;
  sensors_battery_frame_color: string;
}

interface DisksConfig {
  disks_update_time: number;
  disks_background_color: string;
  disks_boxes_background_color: string;
  disks_name_foreground_color: string;
  disks_size_foreground_color: string;
  disks_partition_background_color: string;
  disks_partition_usage_background_color: string;
  disks_partition_name_foreground_color: string;
  disks_paritition_type_foreground_color: string;
  disks_partition_usage_foreground_color: string;
}


interface Store {
  cpu: number[];
  setCpu: (cpu: number[]) => void;

  memory: number[];
  setMemory: (memory: number[]) => void;

  maxMemory: number;
  setMaxMemory: (maxMemory: number) => void;

  wifiDownloadSpeed: number[];
  wifiUploadSpeed: number[];
  setWifiSpeed: (downloadSpeed: number[], uploadSpeed: number[]) => void;

  ethernetDownloadSpeed: number[];
  ethernetUploadSpeed: number[];
  setEthernetSpeed: (downloadSpeed: number[], uploadSpeed: number[]) => void;

  processSearch: string;
  setProcessSearch: (processSearch: string) => void;

  processesConfig: ProcessConfig;
  setProcessesConfig: (processesConfig: ProcessConfig) => void;

  performanceConfig: PerformanceConfig;
  setPerformanceConfig: (performanceConfig: PerformanceConfig) => void;

  sensorsConfig: SensorsConfig;
  setSensorsConfig: (sensorsConfig: SensorsConfig) => void;

  disksConfig: DisksConfig;
  setDisksConfig: (disksConfig: DisksConfig) => void;
}

export const useStore = create<Store>((set) => ({
  cpu: [],
  setCpu: (cpu) => set({ cpu }),

  memory: [],
  setMemory: (memory) => set({ memory }),

  maxMemory: 0,
  setMaxMemory: (maxMemory) => set({ maxMemory }),

  wifiDownloadSpeed: [],
  wifiUploadSpeed: [],
  setWifiSpeed: (downloadSpeed, uploadSpeed) => set({ wifiDownloadSpeed: downloadSpeed, wifiUploadSpeed: uploadSpeed }),

  ethernetDownloadSpeed: [],
  ethernetUploadSpeed: [],
  setEthernetSpeed: (downloadSpeed, uploadSpeed) => set({ ethernetDownloadSpeed: downloadSpeed, ethernetUploadSpeed: uploadSpeed }),

  processSearch: "",
  setProcessSearch: (processSearch) => set({ processSearch }),

  processesConfig: {
    processes_update_time: 1000,
    processes_body_background_color: "#2d2d2d",
    processes_body_color: "#ffffff",
    processes_head_background_color: "#252526",
    processes_head_color: "#ffffff",
    processes_table_values: ["user","pid","ppid","name","state","memory","cpu"],
  },
  setProcessesConfig: (processesConfig) => set({ processesConfig }),

  performanceConfig: {
    performance_update_time: 1000,
    performance_sidebar_background_color: "#ffffff",
    performance_sidebar_color: "#ffffff",
    performance_sidebar_selected_color: "#ffffff",
    performance_background_color: "#ffffff",
    performance_title_color: "#ffffff",
    performance_label_color: "#6d6d6d",
    performance_value_color: "#ffffff",
    performance_graph_color: "#09ffff",
    performance_sec_graph_color: '#ff6384',
  },
  setPerformanceConfig: (performanceConfig) => set({ performanceConfig }),

  sensorsConfig: {
    sensors_update_time: 1000,
    sensors_background_color: "#333",
    sensors_foreground_color: "#ffffff",
    sensors_boxes_background_color: "#2B2B2B",
    sensors_boxes_foreground_color: "#6d6d6d",
    sensors_boxes_title_foreground_color: "#9A9A9A",
    sensors_battery_background_color: "#1E1E1E",
    sensors_battery_frame_color: "#FFFFFF",
  },
  setSensorsConfig: (sensorsConfig) => set({ sensorsConfig }),

  disksConfig: {
    disks_update_time: 1000,
    disks_background_color: "#2b2b2b",
    disks_boxes_background_color: "#3a3a3a",
    disks_name_foreground_color: "#ffffff",
    disks_size_foreground_color: "#cccccc",
    disks_partition_background_color: "#4a4a4a",
    disks_partition_usage_background_color: "#2b2b2b",
    disks_partition_name_foreground_color: "#61dafb",
    disks_paritition_type_foreground_color: "#a3be8c",
    disks_partition_usage_foreground_color: "#ffcb6b",
  },
  setDisksConfig: (disksConfig) => set({ disksConfig }),
}));



export const useCpu = () => useStore((state) => state.cpu);
export const useSetCpu = () => useStore((state) => state.setCpu);

export const useMemory = () => useStore((state) => state.memory);
export const useSetMemory = () => useStore((state) => state.setMemory);

export const useMaxMemory = () => useStore((state) => state.maxMemory);
export const useSetMaxMemory = () => useStore((state) => state.setMaxMemory);

export const useWifiSpeed = () => useStore((state) => [state.wifiDownloadSpeed, state.wifiUploadSpeed]);
export const useSetWifiSpeed = () => useStore((state) => state.setWifiSpeed);

export const useEthernetSpeed = () => useStore((state) => [state.ethernetDownloadSpeed, state.ethernetUploadSpeed]);
export const useSetEthernetSpeed = () => useStore((state) => state.setEthernetSpeed);

export const useProcessSearch = () => useStore((state) => state.processSearch);
export const useSetProcessSearch = () => useStore((state) => state.setProcessSearch);

export const useProcessesConfig = () => useStore((state) => state.processesConfig);
export const useSetProcessesConfig = () => useStore((state) => state.setProcessesConfig);

export const useZuPerformanceConfig = () => useStore((state) => state.performanceConfig);
export const useSetPerformanceConfig = () => useStore((state) => state.setPerformanceConfig);

export const useZuSensorsConfig = () => useStore((state) => state.sensorsConfig);
export const useSetSensorsConfig = () => useStore((state) => state.setSensorsConfig);

export const useZuDisksConfig = () => useStore((state) => state.disksConfig);
export const useSetDisksConfig = () => useStore((state) => state.setDisksConfig);
