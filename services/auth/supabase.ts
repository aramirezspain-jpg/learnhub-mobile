/**
 * Supabase auth stubs — Phase 5 preparation.
 * Client is initialized; methods are stubs awaiting real implementation.
 *
 * Activation: implement each function body and set SUPABASE_ENABLED = true.
 */

import { supabase, supabaseConfig } from '@/services/supabase/client';
import type { AuthCredentials, AuthResult, RegisterData } from '@/types/user';
import type { PasswordResetResult } from './auth.service';

// ─── Diagnostics ──────────────────────────────────────────────────────────────

/** True only when URL + anon key are present in env vars. */
export function isSupabaseConfigured(): boolean {
  return supabaseConfig.isConfigured;
}

// ─── Auth stubs ───────────────────────────────────────────────────────────────

/**
 * Phase 5: sign in with email + password via Supabase Auth.
 * TODO: replace body with:
 *   const { data, error } = await supabase.auth.signInWithPassword(credentials);
 *   if (error) return { success: false, error: mapError(error.code) };
 *   return { success: true, user: supabaseUserToProfile(data.user) };
 */
export async function loginSupabase(_credentials: AuthCredentials): Promise<AuthResult> {
  void supabase; // client ready — remove when implementing
  return { success: false, error: 'network_error' };
}

/**
 * Phase 5: create account via Supabase Auth.
 * TODO: replace body with:
 *   const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { display_name } } });
 *   if (error) return { success: false, error: mapError(error.code) };
 *   return { success: true, user: supabaseUserToProfile(data.user) };
 */
export async function registerSupabase(_data: RegisterData): Promise<AuthResult> {
  return { success: false, error: 'network_error' };
}

/**
 * Phase 5: sign out from Supabase (invalidates server-side session).
 * TODO: await supabase.auth.signOut();
 */
export async function logoutSupabase(): Promise<void> {
  // no-op until Phase 5
}

/**
 * Phase 5: send password-reset email via Supabase Auth.
 * TODO:
 *   const { error } = await supabase.auth.resetPasswordForEmail(email, {
 *     redirectTo: 'learnhub://auth/reset-password',
 *   });
 *   if (error) return { success: false, error: error.message };
 *   return { success: true };
 */
export async function resetPasswordSupabase(_email: string): Promise<PasswordResetResult> {
  return { success: false, error: 'backend_not_connected' };
}

/**
 * Phase 5: OAuth sign-in with Google (requires expo-auth-session + Supabase OAuth setup).
 * TODO:
 *   const { data, error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
 *   handle redirect + session exchange
 */
export async function googleAuth(): Promise<AuthResult> {
  return { success: false, error: 'network_error' };
}

/**
 * Phase 5: OAuth sign-in with Apple (iOS only, requires Apple Developer enrollment).
 * TODO:
 *   const { data, error } = await supabase.auth.signInWithOAuth({ provider: 'apple' });
 */
export async function appleAuth(): Promise<AuthResult> {
  return { success: false, error: 'network_error' };
}

/**
 * Phase 5: restore session from stored tokens (expo-secure-store).
 * TODO:
 *   const stored = await SecureStore.getItemAsync('supabase_session');
 *   if (!stored) return null;
 *   const { data, error } = await supabase.auth.setSession(JSON.parse(stored));
 *   if (error || !data.session) return null;
 *   return { access_token: data.session.access_token, expires_at: data.session.expires_at ?? 0 };
 */
export async function restoreSupabaseSession(): Promise<{
  access_token: string;
  expires_at: number;
} | null> {
  return null;
}
