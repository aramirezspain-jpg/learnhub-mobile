import { create } from 'zustand';
import { type SessionStatus } from '@/types/user';

interface AuthState {
  status: SessionStatus;
  isAuthenticated: boolean;
  sessionUserId: string | null;
  setStatus: (status: SessionStatus) => void;
  setAuthenticated: (userId: string) => void;
  resetAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  status: 'loading',
  isAuthenticated: false,
  sessionUserId: null,
  setStatus: (status) => set({ status }),
  setAuthenticated: (userId) =>
    set({ status: 'authenticated', isAuthenticated: true, sessionUserId: userId }),
  resetAuth: () =>
    set({ status: 'local', isAuthenticated: false, sessionUserId: null }),
}));
