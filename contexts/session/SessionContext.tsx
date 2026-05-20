import React, { createContext, useContext, useCallback } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import { useUserProfileStore } from '@/store/userProfile.store';
import { useAuthStore } from '@/store/auth.store';
import { MockAuthService } from '@/services/auth/mock-auth.service';
import { ROLE_META } from '@/types/user';
import type {
  UserProfile,
  UserRole,
  SessionStatus,
  AuthCredentials,
  RegisterData,
  AuthResult,
} from '@/types/user';

interface SessionContextValue {
  status: SessionStatus;
  profile: UserProfile | null;
  isAuthenticated: boolean;
  role: UserRole;
  roleMeta: (typeof ROLE_META)[UserRole];
  login: (credentials: AuthCredentials) => Promise<AuthResult>;
  logout: () => Promise<void>;
  register: (data: RegisterData) => Promise<AuthResult>;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const db = useSQLiteContext();
  const profile    = useUserProfileStore(s => s.profile);
  const setProfile = useUserProfileStore(s => s.setProfile);
  const status         = useAuthStore(s => s.status);
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const setAuthenticated = useAuthStore(s => s.setAuthenticated);
  const resetAuth       = useAuthStore(s => s.resetAuth);

  const role: UserRole = profile?.rol ?? 'member';
  const roleMeta = ROLE_META[role];

  const login = useCallback(async (credentials: AuthCredentials): Promise<AuthResult> => {
    const svc = new MockAuthService(db);
    const result = await svc.signIn(credentials);
    if (result.success && result.user) {
      setAuthenticated(result.user.id ?? '');
      setProfile(result.user);
    }
    return result;
  }, [db, setAuthenticated, setProfile]);

  const logout = useCallback(async (): Promise<void> => {
    const svc = new MockAuthService(db);
    await svc.signOut();
    resetAuth();
    setProfile(null);
  }, [db, resetAuth, setProfile]);

  const register = useCallback(async (data: RegisterData): Promise<AuthResult> => {
    const svc = new MockAuthService(db);
    const result = await svc.signUp(data);
    if (result.success && result.user) {
      setAuthenticated(result.user.id ?? '');
      setProfile(result.user);
    }
    return result;
  }, [db, setAuthenticated, setProfile]);

  return (
    <SessionContext.Provider
      value={{ status, profile, isAuthenticated, role, roleMeta, login, logout, register }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSessionContext(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSessionContext must be used within SessionProvider');
  return ctx;
}
