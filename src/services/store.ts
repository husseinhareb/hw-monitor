import { create } from "zustand";

interface ProcessConfig {
  update_time: number;
  background_color: string;
  color: string;
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

  processesConfig: { update_time: 0, background_color: "#ffffff", color: "#000000" },
  setProcessesConfig: (processesConfig) => set({ processesConfig }),
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
