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
  performance_background_color: string;
  performance_label_color: string;
  performance_value_color: string;
  performance_graph_color: string;
  performance_sec_graph_color: string;
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
    performance_sidebar_background_color: "#fff",
    performance_sidebar_color: "#fff",
    performance_background_color: "#fff",
    performance_label_color: "#fff",
    performance_value_color: "#fff",
    performance_graph_color: "#fff",
    performance_sec_graph_color: '#fff',
  },
  setPerformanceConfig: (performanceConfig) => set({ performanceConfig }),
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
