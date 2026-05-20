/**
 * AuthService — Fase 4 foundation.
 *
 * Fase 4: autenticación local via MockAuthService (SQLite).
 * Fase 5: reemplazar stubs con llamadas reales a Supabase/Firebase.
 */

import type { AuthCredentials, RegisterData, AuthResult, UserProfile } from '@/types/user';

export type PasswordResetResult = { success: boolean; error?: string };

export class AuthService {
  static isLocalMode(): boolean {
    return true;
  }

  // ── Phase 5: Supabase email/password stubs ─────────────────────────────────

  /** Stub — Phase 5: supabase.auth.signInWithPassword() */
  static async loginSupabase(_credentials: AuthCredentials): Promise<AuthResult> {
    return { success: false, error: 'network_error' };
  }

  /** Stub — Phase 5: supabase.auth.signUp() */
  static async registerSupabase(_data: RegisterData): Promise<AuthResult> {
    return { success: false, error: 'network_error' };
  }

  /** Stub — Phase 5: supabase.auth.resetPasswordForEmail() */
  static async resetPassword(_email: string): Promise<PasswordResetResult> {
    return { success: false, error: 'backend_not_connected' };
  }

  /** Stub — Phase 5: supabase.auth.refreshSession() */
  static async refreshSessionSupabase(): Promise<{ access_token: string; expires_at: number } | null> {
    return null;
  }

  /** Stub — Phase 5: supabase.auth.signOut() */
  static async logoutSupabase(): Promise<void> {
    // no-op until Phase 5
  }

  // ── Phase 5: OAuth stubs ───────────────────────────────────────────────────

  /** Stub — Phase 5: supabase.auth.signInWithOAuth({ provider: 'google' }) */
  static async googleAuth(): Promise<AuthResult> {
    return { success: false, error: 'network_error' };
  }

  /** Stub — Phase 5: supabase.auth.signInWithOAuth({ provider: 'apple' }) */
  static async appleAuth(): Promise<AuthResult> {
    return { success: false, error: 'network_error' };
  }

  // ── Phase 5: Profile sync stub ─────────────────────────────────────────────

  /** Stub — Phase 5: sync local profile to remote users table */
  static async syncProfileSupabase(_profile: UserProfile): Promise<UserProfile | null> {
    return null;
  }
}
