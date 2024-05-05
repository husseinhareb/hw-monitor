import create from "zustand";

interface Store {
  cpu: number[];
  setCpu: (cpu: number[]) => void;
  memory: number[];
  maxMemory: number;
  setMemory: (memory: number[], maxMemory: number) => void;
}

export const useStore = create<Store>((set) => ({
  cpu: [],
  setCpu: (cpu) => set({ cpu }),
  memory: [],
  maxMemory: 0,
  setMemory: (memory, maxMemory) => set({ memory, maxMemory }),
}));

export const useCpu = () => useStore((state) => state.cpu);
export const useSetCpu = () => useStore((state) => state.setCpu);

// Inside your store file

export const useMemory = () => {
  const { memory, maxMemory } = useStore((state) => ({
    memory: state.memory,
    maxMemory: state.maxMemory,
  }));
  return { memory, maxMemory };
};
export const useSetMemory = () => useStore((state) => state.setMemory);
