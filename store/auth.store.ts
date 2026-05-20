import { create } from 'zustand';
import { type SessionStatus } from '@/types/user';

interface AuthState {
  status: SessionStatus;
  isAuthenticated: boolean;
  sessionUserId: string | null;
  sessionError: string | null;
  setStatus: (status: SessionStatus) => void;
  setAuthenticated: (userId: string) => void;
  resetAuth: () => void;
  setSessionError: (err: string | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  status: 'loading',
  isAuthenticated: false,
  sessionUserId: null,
  sessionError: null,
  setStatus: (status) => set({ status }),
  setAuthenticated: (userId) =>
    set({ status: 'authenticated', isAuthenticated: true, sessionUserId: userId, sessionError: null }),
  resetAuth: () =>
    set({ status: 'local', isAuthenticated: false, sessionUserId: null, sessionError: null }),
  setSessionError: (err) => set({ sessionError: err }),
}));
