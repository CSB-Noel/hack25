import {create} from "zustand";

interface StoreState {
    slideIndex: number;
    slideChangeTrigger: number;
    incrementSlideChangeTrigger: () => void;
}

export const useStore = create<StoreState>((set) => ({
    slideIndex: 0,
    slideChangeTrigger: 0,
    incrementSlideChangeTrigger: () => set((state) => ({ slideChangeTrigger: state.slideChangeTrigger + 1 })),
}));