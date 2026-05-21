/**
 * Supabase auth — standalone helpers + Google/Apple OAuth stubs.
 * Primary auth flow: SessionContext → createAuthRepository → SupabaseAuthRepository.
 * These helpers can be used directly for password reset, OAuth prep, diagnostics.
 */

import { supabase, supabaseConfig } from '@/services/supabase/client';
import type { AuthCredentials, AuthResult, RegisterData, AuthError } from '@/types/user';
import type { PasswordResetResult } from './auth.service';

// ─── Diagnostics ──────────────────────────────────────────────────────────────

export function isSupabaseConfigured(): boolean {
  return supabaseConfig.isConfigured;
}

// ─── Auth helpers (delegate to supabase client) ───────────────────────────────

export async function loginSupabase(credentials: AuthCredentials): Promise<AuthResult> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email:    credentials.email.trim().toLowerCase(),
      password: credentials.password,
    });
    if (error) return { success: false, error: 'invalid_credentials' };
    if (!data.user || !data.session) return { success: false, error: 'unknown' };
    return { success: true };
  } catch {
    return { success: false, error: 'network_error' };
  }
}

export async function registerSupabase(data: RegisterData): Promise<AuthResult> {
  try {
    const { data: authData, error } = await supabase.auth.signUp({
      email:    data.email.trim().toLowerCase(),
      password: data.password,
      options:  { data: { display_name: data.display_name.trim() } },
    });
    if (error) return { success: false, error: 'unknown' };
    if (!authData.user) return { success: false, error: 'unknown' };
    return { success: true };
  } catch {
    return { success: false, error: 'network_error' };
  }
}

export async function logoutSupabase(): Promise<void> {
  try {
    await supabase.auth.signOut();
  } catch {
    // Ignore
  }
}

export async function resetPasswordSupabase(email: string): Promise<PasswordResetResult> {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(
      email.trim().toLowerCase(),
      { redirectTo: 'learnhub://reset-password' }
    );
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch {
    return { success: false, error: 'network_error' };
  }
}

export async function restoreSupabaseSession(): Promise<{
  access_token: string;
  expires_at: number;
} | null> {
  try {
    const { data, error } = await supabase.auth.refreshSession();
    if (error || !data.session) return null;
    return {
      access_token: data.session.access_token,
      expires_at:   data.session.expires_at ?? 0,
    };
  } catch {
    return null;
  }
}

// ─── OAuth stubs — Phase 6 ────────────────────────────────────────────────────
// Structure ready. Implementation requires:
//   - expo-auth-session (for redirect handling)
//   - Supabase OAuth provider configured in dashboard
//   - Deep link scheme configured in app.json

/** Google OAuth — Phase 6 stub */
export async function googleAuth(): Promise<AuthResult> {
  // TODO Phase 6:
  //   import * as AuthSession from 'expo-auth-session';
  //   import * as WebBrowser from 'expo-web-browser';
  //   WebBrowser.maybeCompleteAuthSession();
  //   const { data, error } = await supabase.auth.signInWithOAuth({
  //     provider: 'google',
  //     options: { redirectTo: AuthSession.makeRedirectUri({ scheme: 'learnhub' }) },
  //   });
  void supabase;
  return { success: false, error: 'network_error' };
}

/** Apple OAuth — Phase 6 stub (iOS only) */
export async function appleAuth(): Promise<AuthResult> {
  // TODO Phase 6:
  //   const { data, error } = await supabase.auth.signInWithOAuth({
  //     provider: 'apple',
  //     options: { redirectTo: AuthSession.makeRedirectUri({ scheme: 'learnhub' }) },
  //   });
  return { success: false, error: 'network_error' };
}

// Re-export AuthError type for callers
export type { AuthError };
