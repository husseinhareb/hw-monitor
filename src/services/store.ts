import { create } from "zustand";

interface ProcessConfig {
  processes_update_time: number;
  processes_body_background_color: string;
  processes_body_color: string;
  processes_head_background_color: string;
  processes_head_color: string;
  processes_table_values: string[];
  processes_border_color: string;
  processes_tree_toggle_color: string;
  processes_monitor_border_color: string;
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
  show_virtual_interfaces: boolean;
  performance_scrollbar_color: string;
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
  sensors_battery_case_color: string;
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
  disks_partition_type_foreground_color: string;
  disks_partition_usage_foreground_color: string;
}

interface NavbarConfig {
  navbar_background_color: string;
  navbar_buttons_background_color: string;
  navbar_buttons_foreground_color: string;
  navbar_search_background_color: string;
  navbar_search_foreground_color: string;
}

interface HeatbarConfig {
  heatbar_color_one: string;
  heatbar_color_two: string;
  heatbar_color_three: string;
  heatbar_color_four: string;
  heatbar_color_five: string;
  heatbar_color_six: string;
  heatbar_color_seven: string;
  heatbar_color_eight: string;
  heatbar_color_nine: string;
  heatbar_color_ten: string;
  heatbar_background_color: string;
}

interface ConfigPanelConfig {
  config_background_color: string;
  config_container_background_color: string;
  config_input_background_color: string;
  config_input_border_color: string;
  config_button_background_color: string;
  config_button_foreground_color: string;
  config_text_color: string;
}

interface Store {
  cpu: number[];
  setCpu: (cpu: number[]) => void;

  cpuCores: number[][];
  setCpuCores: (cores: number[][]) => void;

  memory: number[];
  setMemory: (memory: number[]) => void;

  maxMemory: number;
  setMaxMemory: (maxMemory: number) => void;

  gpuUsages: { [id: string]: number[] };
  setGpuUsage: (id: string, usage: number[]) => void;

  networkSpeeds: { [name: string]: { download: number[]; upload: number[] } };
  setNetworkSpeed: (name: string, download: number[], upload: number[]) => void;

  networkFullData: { [name: string]: { download: { value: number; unit: string }[]; upload: { value: number; unit: string }[]; totalDownload: number; totalUpload: number } };
  setNetworkFullData: (name: string, data: { download: { value: number; unit: string }[]; upload: { value: number; unit: string }[]; totalDownload: number; totalUpload: number }) => void;

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

  navbarConfig: NavbarConfig;
  setNavbarConfig: (navbarConfig: NavbarConfig) => void;


  heatbarConfig: HeatbarConfig;
  setHeatbarConfig: (heatbarConfig: HeatbarConfig) => void;

  configPanelConfig: ConfigPanelConfig;
  setConfigPanelConfig: (configPanelConfig: ConfigPanelConfig) => void;

  paused: boolean;
  setPaused: (paused: boolean) => void;

  notifications: Notification[];
  addNotification: (messageKey: string, type?: 'error' | 'warning' | 'info') => void;
  dismissNotification: (id: string) => void;
}

export interface Notification {
  id: string;
  messageKey: string;
  type: 'error' | 'warning' | 'info';
}

export const useStore = create<Store>((set) => ({
  cpu: [],
  setCpu: (cpu) => set({ cpu }),

  cpuCores: [],
  setCpuCores: (cpuCores) => set({ cpuCores }),

  memory: [],
  setMemory: (memory) => set({ memory }),

  maxMemory: 0,
  setMaxMemory: (maxMemory) => set({ maxMemory }),

  gpuUsages: {},
  setGpuUsage: (id, usage) => set((state) => ({
    gpuUsages: { ...state.gpuUsages, [id]: usage },
  })),

  networkSpeeds: {},
  setNetworkSpeed: (name, download, upload) => set((state) => ({
    networkSpeeds: { ...state.networkSpeeds, [name]: { download, upload } },
  })),

  networkFullData: {},
  setNetworkFullData: (name, data) => set((state) => ({
    networkFullData: { ...state.networkFullData, [name]: data },
  })),

  processSearch: "",
  setProcessSearch: (processSearch) => set({ processSearch }),

  processesConfig: {
    processes_update_time: 2000,
    processes_body_background_color: "#2d2d2d",
    processes_body_color: "#ffffff",
    processes_head_background_color: "#252526",
    processes_head_color: "#ffffff",
    processes_table_values: ["user","pid","ppid","name","state","memory","cpu_usage"],
    processes_border_color: "#333333",
    processes_tree_toggle_color: "#888888",
    processes_monitor_border_color: "#555555",
  },
  setProcessesConfig: (processesConfig) => set({ processesConfig }),

  performanceConfig: {
    performance_update_time: 1000,
    performance_sidebar_background_color: "#333333",
    performance_sidebar_color: "#ffffff",
    performance_sidebar_selected_color: "#ffffff",
    performance_background_color: "#2d2d2d",
    performance_title_color: "#ffffff",
    performance_label_color: "#6d6d6d",
    performance_value_color: "#ffffff",
    performance_graph_color: "#09ffff",
    performance_sec_graph_color: '#ff6384',
    show_virtual_interfaces: false,
    performance_scrollbar_color: "#888888",
  },
  setPerformanceConfig: (performanceConfig) => set({ performanceConfig }),

  sensorsConfig: {
    sensors_update_time: 2000,
    sensors_background_color: "#2b2b2b",
    sensors_foreground_color: "#ffffff",
    sensors_boxes_background_color: "#3a3a3a",
    sensors_boxes_foreground_color: "#ffffff",
    sensors_boxes_title_foreground_color: "#0088dd",
    sensors_battery_background_color: "#38e740",
    sensors_battery_frame_color: "#ffffff",
    sensors_battery_case_color: "#060606",
  },
  setSensorsConfig: (sensorsConfig) => set({ sensorsConfig }),

  disksConfig: {
    disks_update_time: 5000,
    disks_background_color: "#2b2b2b",
    disks_boxes_background_color: "#3a3a3a",
    disks_name_foreground_color: "#ffffff",
    disks_size_foreground_color: "#cccccc",
    disks_partition_background_color: "#4a4a4a",
    disks_partition_usage_background_color: "#2b2b2b",
    disks_partition_name_foreground_color: "#61dafb",
    disks_partition_type_foreground_color: "#a3be8c",
    disks_partition_usage_foreground_color: "#ffcb6b",
  },
  setDisksConfig: (disksConfig) => set({ disksConfig }),

  navbarConfig: {
    navbar_background_color: "#222222",
    navbar_buttons_background_color: "#f3eae8",
    navbar_buttons_foreground_color: "#212830",
    navbar_search_background_color: "#f3eae8",
    navbar_search_foreground_color: "#212830",
  },
  setNavbarConfig: (navbarConfig) => set({ navbarConfig }),

  heatbarConfig: {
    heatbar_color_one: "#00FF00",
    heatbar_color_two: "#33FF00",
    heatbar_color_three: "#66FF00",
    heatbar_color_four: "#99FF00",
    heatbar_color_five: "#CCFF00",
    heatbar_color_six: "#FFFF00",
    heatbar_color_seven: "#FFCC00",
    heatbar_color_eight: "#FF9900",
    heatbar_color_nine: "#FF6600",
    heatbar_color_ten: "#FF0000",
    heatbar_background_color: "#eeeeee",
  },
  setHeatbarConfig: (heatbarConfig) => set({ heatbarConfig }),

  configPanelConfig: {
    config_background_color: "#2b2b2b",
    config_container_background_color: "#3a3a3a",
    config_input_background_color: "#333333",
    config_input_border_color: "#444444",
    config_button_background_color: "#f3eae8",
    config_button_foreground_color: "#212830",
    config_text_color: "#ffffff",
  },
  setConfigPanelConfig: (configPanelConfig) => set({ configPanelConfig }),

  paused: false,
  setPaused: (paused) => set({ paused }),

  notifications: [],
  addNotification: (messageKey, type = 'error') =>
    set((state) => {
      if (state.notifications.some((n) => n.messageKey === messageKey)) return state;
      return {
        notifications: [
          ...state.notifications,
          { id: crypto.randomUUID(), messageKey, type },
        ],
      };
    }),
  dismissNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
}));



export const useCpu = () => useStore((state) => state.cpu);
export const useSetCpu = () => useStore((state) => state.setCpu);

export const useCpuCores = () => useStore((state) => state.cpuCores);
export const useSetCpuCores = () => useStore((state) => state.setCpuCores);

export const useMemory = () => useStore((state) => state.memory);
export const useSetMemory = () => useStore((state) => state.setMemory);

export const useMaxMemory = () => useStore((state) => state.maxMemory);
export const useSetMaxMemory = () => useStore((state) => state.setMaxMemory);

export const useGpuUsages = () => useStore((state) => state.gpuUsages);
export const useSetGpuUsage = () => useStore((state) => state.setGpuUsage);

export const useNetworkSpeeds = () => useStore((state) => state.networkSpeeds);
export const useSetNetworkSpeed = () => useStore((state) => state.setNetworkSpeed);

export const useNetworkFullData = () => useStore((state) => state.networkFullData);
export const useSetNetworkFullData = () => useStore((state) => state.setNetworkFullData);

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

export const useZuNavbarConfig = () => useStore((state) => state.navbarConfig);
export const useSetNavbarConfig = () => useStore((state) => state.setNavbarConfig);

export const useZuHeatbarConfig = () => useStore((state) => state.heatbarConfig);
export const useSetHeatbarConfig = () => useStore((state) => state.setHeatbarConfig);

export const useZuConfigPanelConfig = () => useStore((state) => state.configPanelConfig);
export const useSetConfigPanelConfig = () => useStore((state) => state.setConfigPanelConfig);

export const usePaused = () => useStore((state) => state.paused);
export const useSetPaused = () => useStore((state) => state.setPaused);

export const useNotifications = () => useStore((state) => state.notifications);
export const useDismissNotification = () => useStore((state) => state.dismissNotification);

/** Fire-and-forget — safe to call from custom hooks and event handlers */
export const notify = (
  messageKey: string,
  type: 'error' | 'warning' | 'info' = 'error'
) => useStore.getState().addNotification(messageKey, type);
