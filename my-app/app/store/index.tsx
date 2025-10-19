import {create} from "zustand";

type Insight = {
  id: string;
  kind: 'subscription' | 'bill' | 'anomaly' | 'goal' | 'advice';
  title: string;
  merchantOrBill: string;
  amount: number;
  date: string;
  account: string;
  category: string;
  delta30: number;
  delta90: number;
  email: string;
  aiHeader: {
    bullets: string[];
    nextStep: string;
    badges: string[];
    confidence: number;
  };
};

interface StoreState {
    slideIndex: number;
    slideChangeTrigger: number;
    incrementSlideChangeTrigger: () => void;
    // Shared data cache
    analyzedData: any | null;
    insights: Insight[] | null;
    isDataLoading: boolean;
    setAnalyzedData: (data: any) => void;
    setInsights: (insights: Insight[]) => void;
    setIsDataLoading: (loading: boolean) => void;
}

export const useStore = create<StoreState>((set) => ({
    slideIndex: 0,
    slideChangeTrigger: 0,
    incrementSlideChangeTrigger: () => set((state) => ({ slideChangeTrigger: state.slideChangeTrigger + 1 })),
    // Initialize shared data cache
    analyzedData: null,
    insights: null,
    isDataLoading: false,
    setAnalyzedData: (data) => set({ analyzedData: data }),
    setInsights: (insights) => set({ insights }),
    setIsDataLoading: (loading) => set({ isDataLoading: loading }),
}));