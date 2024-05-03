// store.ts
import create from "zustand";

interface CpuUsageStore {
  cpu: number[];
  setTotalCpu: (cpu: number[]) => void;
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


interface NetworkUsageStore {
  interfaces: {
    [interfaceName: string]: {
      download: number[];
      upload: number[];
    };
  };
  setNetworkUsage: (interfaceName: string, download: number[], upload: number[]) => void;
}

export const useNetworkUsageStore = create<NetworkUsageStore>((set) => ({
  interfaces: {},
  setNetworkUsage: (interfaceName, download, upload) =>
    set((state) => ({
      interfaces: {
        ...state.interfaces,
        [interfaceName]: { download, upload },
      },
    })),
}));
