import { create } from 'zustand';

interface UIState {
  dbReady: boolean;
  contentReady: boolean;
  activeTab: string;
  setDbReady: () => void;
  setContentReady: () => void;
  setActiveTab: (tab: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  dbReady: false,
  contentReady: false,
  activeTab: 'index',
  setDbReady: () => set({ dbReady: true }),
  setContentReady: () => set({ contentReady: true }),
  setActiveTab: (tab) => set({ activeTab: tab }),
}));
