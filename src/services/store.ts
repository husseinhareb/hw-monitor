// store.ts
import create from "zustand";

interface CpuUsageStore {
  cpu: number[];
  setTotalCpu: (cpu: number[]) => void;
}

interface NetworkSpeedStore {
  download: number[];
  networkInterface: string;
  setNetworkUsage: (download: number[], networkInterface: string) => void;
}

interface MemoryUsageStore {
  memory: number[];
  setMemoryUsage: (memory: number[]) => void;
}

export const useCpuUsageStore = create<CpuUsageStore>((set) => ({
  cpu: [],
  setTotalCpu: (cpu) => set({ cpu }),
}));

export const useMemoryUsageStore = create<MemoryUsageStore>((set) => ({
  memory: [],
  setMemoryUsage: (memory) => set({ memory }),
}));

export const useNetworkSpeedStore = create<NetworkSpeedStore>((set) => ({
  download: [],
  networkInterface: "",
  setNetworkUsage: (download, networkInterface) => set({ download, networkInterface }),
}));
