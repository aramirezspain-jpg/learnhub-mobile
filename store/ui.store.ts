import { create } from 'zustand';

interface UIState {
  dbReady: boolean;
  contentReady: boolean;
  activeTab: string;
  onboardingCompleted: boolean;
  setDbReady: () => void;
  setContentReady: () => void;
  setActiveTab: (tab: string) => void;
  setOnboardingCompleted: (v: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  dbReady: false,
  contentReady: false,
  activeTab: 'index',
  onboardingCompleted: false,
  setDbReady: () => set({ dbReady: true }),
  setContentReady: () => set({ contentReady: true }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setOnboardingCompleted: (v) => set({ onboardingCompleted: v }),
}));
