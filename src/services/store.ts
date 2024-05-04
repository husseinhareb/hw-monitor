import create from "zustand";

interface Store {
  cpu: number[];
  setTotalCpu: (cpu: number[]) => void;
}

export const useStore = create<Store>((set) => ({
  cpu: [],
  setTotalCpu: (cpu) => set({ cpu }),
}));

export const useCpu = () => useStore(state => state.cpu)
export const useSetCpu = () => useStore(state => state.setTotalCpu);
