import React, { createContext, useContext } from 'react';
import { useUserProfileStore } from '@/store/userProfile.store';
import type { UserProfile, Session, SessionStatus } from '@/types/user';

interface SessionContextValue {
  /** Estado actual de la sesión. En Fase 3 siempre 'local'. */
  status: SessionStatus;
  /** Perfil del usuario (local en Fase 3, remoto en Fase 4). */
  profile: UserProfile | null;
  // Phase 4: signIn, signOut, register
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const profile = useUserProfileStore(s => s.profile);

  const status: SessionStatus = 'local'; // Phase 4: derive from real auth state

  return (
    <SessionContext.Provider value={{ status, profile }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSessionContext(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSessionContext must be used within SessionProvider');
  return ctx;
}
