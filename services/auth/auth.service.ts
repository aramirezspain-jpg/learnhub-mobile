/**
 * AuthService — Fase 4 foundation.
 *
 * Fase 4: autenticación local via MockAuthService (SQLite).
 * Fase 5: reemplazar stubs con llamadas reales a Supabase/Firebase.
 */

import type { AuthCredentials, RegisterData, AuthResult, UserProfile } from '@/types/user';

export class AuthService {
  static isLocalMode(): boolean {
    return true;
  }

  // ── Phase 5: Supabase stubs ─────────────────────────────────────────────────
  // Implementar en Phase 5: conectar con supabase.auth.*

  /** Stub — Phase 5: supabase.auth.signInWithPassword() */
  static async loginSupabase(_credentials: AuthCredentials): Promise<AuthResult> {
    return { success: false, error: 'network_error' };
  }

  /** Stub — Phase 5: supabase.auth.signUp() */
  static async registerSupabase(_data: RegisterData): Promise<AuthResult> {
    return { success: false, error: 'network_error' };
  }

  /** Stub — Phase 5: supabase.auth.refreshSession() */
  static async refreshSessionSupabase(): Promise<{ access_token: string; expires_at: number } | null> {
    return null;
  }

  /** Stub — Phase 5: supabase.auth.signOut() */
  static async logoutSupabase(): Promise<void> {
    // no-op until Phase 5
  }

  /** Stub — Phase 5: sync local profile to remote users table */
  static async syncProfileSupabase(_profile: UserProfile): Promise<UserProfile | null> {
    return null;
  }
}
