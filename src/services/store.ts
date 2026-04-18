import { create } from "zustand";

export interface NetworkPoint {
  value: number;
  unit: string;
}

export interface NetworkData {
  download: NetworkPoint[];
  upload: NetworkPoint[];
  totalDownload: number;
  totalUpload: number;
}

export interface NetworkSpeedData {
  download: number[];
  upload: number[];
}

export interface TotalUsages {
  memory: number | null;
  cpu: number | null;
  processes: number | null;
}

interface Store {
  cpu: number[];
  appendCpu: (value: number) => void;

  cpuCores: number[][];
  appendCpuCores: (coreUsages: number[]) => void;

  memory: number[];
  appendMemory: (value: number) => void;

  maxMemory: number;
  setMaxMemory: (maxMemory: number) => void;

  gpuUsages: { [id: string]: number[] };
  appendGpuUsage: (id: string, value: number) => void;

  totalUsages: TotalUsages;
  setTotalUsages: (data: TotalUsages) => void;

  networkInterfaces: string[];
  networkSpeeds: { [name: string]: NetworkSpeedData };
  networkFullData: { [name: string]: NetworkData };
  setNetworkSnapshot: (
    snapshot:
      | Record<string, NetworkData>
      | ((previous: Record<string, NetworkData>) => Record<string, NetworkData>),
  ) => void;

  processSearch: string;
  setProcessSearch: (processSearch: string) => void;

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
  appendCpu: (value) => set((state) => ({
    cpu: [...state.cpu, value].slice(-20),
  })),

  cpuCores: [],
  appendCpuCores: (coreUsages) => set((state) => {
    const coreCount = coreUsages.length;
    const updated = [...state.cpuCores];
    while (updated.length < coreCount) updated.push([]);
    if (updated.length > coreCount) updated.length = coreCount;
    for (let i = 0; i < coreCount; i++) {
      updated[i] = [...updated[i], coreUsages[i]].slice(-20);
    }
    return { cpuCores: updated };
  }),

  memory: [],
  appendMemory: (value) => set((state) => ({
    memory: [...state.memory, value].slice(-20),
  })),

  maxMemory: 0,
  setMaxMemory: (maxMemory) => set({ maxMemory }),

  gpuUsages: {},
  appendGpuUsage: (id, value) => set((state) => ({
    gpuUsages: {
      ...state.gpuUsages,
      [id]: [...(state.gpuUsages[id] || []), value].slice(-20),
    },
  })),

  totalUsages: { memory: null, cpu: null, processes: null },
  setTotalUsages: (data) => set({ totalUsages: data }),

  networkInterfaces: [],
  networkSpeeds: {},
  networkFullData: {},
  setNetworkSnapshot: (snapshot) =>
    set((state) => {
      const nextSnapshot =
        typeof snapshot === "function"
          ? snapshot(state.networkFullData)
          : snapshot;

      return {
      networkInterfaces: Object.keys(nextSnapshot).sort(),
      networkFullData: nextSnapshot,
      networkSpeeds: Object.fromEntries(
        Object.entries(nextSnapshot).map(([name, data]) => [
          name,
          {
            download: data.download.map((point) => point.value),
            upload: data.upload.map((point) => point.value),
          },
        ]),
      ),
    };
    }),

  processSearch: "",
  setProcessSearch: (processSearch) => set({ processSearch }),

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
export const useAppendCpu = () => useStore((state) => state.appendCpu);

export const useCpuCores = () => useStore((state) => state.cpuCores);
export const useAppendCpuCores = () => useStore((state) => state.appendCpuCores);

export const useMemory = () => useStore((state) => state.memory);
export const useAppendMemory = () => useStore((state) => state.appendMemory);

export const useMaxMemory = () => useStore((state) => state.maxMemory);
export const useSetMaxMemory = () => useStore((state) => state.setMaxMemory);

export const useGpuUsages = () => useStore((state) => state.gpuUsages);
export const useAppendGpuUsage = () => useStore((state) => state.appendGpuUsage);

export const useTotalUsages = () => useStore((state) => state.totalUsages);
export const useSetTotalUsages = () => useStore((state) => state.setTotalUsages);

export const useNetworkInterfaces = () => useStore((state) => state.networkInterfaces);
export const useNetworkSpeeds = () => useStore((state) => state.networkSpeeds);
export const useNetworkFullData = () => useStore((state) => state.networkFullData);
export const useSetNetworkSnapshot = () => useStore((state) => state.setNetworkSnapshot);

export const useProcessSearch = () => useStore((state) => state.processSearch);
export const useSetProcessSearch = () => useStore((state) => state.setProcessSearch);

export const usePaused = () => useStore((state) => state.paused);
export const useSetPaused = () => useStore((state) => state.setPaused);

export const useNotifications = () => useStore((state) => state.notifications);
export const useDismissNotification = () => useStore((state) => state.dismissNotification);

/** Fire-and-forget — safe to call from custom hooks and event handlers */
export const notify = (
  messageKey: string,
  type: 'error' | 'warning' | 'info' = 'error'
) => useStore.getState().addNotification(messageKey, type);
