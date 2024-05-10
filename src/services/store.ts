import { create } from "zustand";

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
  setEthernetSpeed: (downloadSpeed, uploadSpeed) => set({ ethernetDownloadSpeed: downloadSpeed, ethernetUploadSpeed: uploadSpeed })
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
