// lib/serverStore.ts
import { create } from "zustand";

type Insight = any;

type State = {
  insights: Insight[];
  setInsights: (newInsights: Insight[]) => void;
  addInsights: (newInsights: Insight[]) => void;
  clear: () => void;
};

export const serverStore = create<State>((set, get) => ({
  insights: [],
  setInsights: (newInsights) => set({ insights: newInsights }),
  addInsights: (newInsights) => set({ insights: [...get().insights, ...newInsights] }),
  clear: () => set({ insights: [] }),
}));