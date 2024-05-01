//store.ts
import create from "zustand";

interface CpuUsageStore {
  cpu: number[];
  setTotalCpu: (cpu: number[]) => void;
}

interface NetworkSpeedStore {
  download: number[];
  setNetworkUsage: (download: number[]) => void;
}

interface MemoryUsageStore {
  memory: number[];
  setMemoryUsage: (memory: number[]) => void;
}


export const useCpuUsageStore = create<CpuUsageStore>((set) => ({
  cpu: null,
  setTotalCpu: (cpu) => set({ cpu }),
}));

export const useMemoryUsageStore = create<MemoryUsageStore>((set) => ({
  memory: null,
  setMemoryUsage: (memory) => set({ memory }),
}));

export const useNetworkSpeedStore = create<NetworkSpeedStore>((set) => ({
  download: null,
  setNetworkUsage: (download) => set({ download }),
}));