// store.ts
import create from "zustand";

interface TotalUsagesStore {
  cpu: number[] | null;
  setTotalCpu: (cpu: number[] | null) => void;
}

interface NetworkUsages {
  download: number[] | null;
  upload: number[] | null;
  setNe
}
export const useTotalUsagesStore = create<TotalUsagesStore>((set) => ({
  cpu: null,
  setTotalCpu: (cpu) => set({ cpu }),
}));
