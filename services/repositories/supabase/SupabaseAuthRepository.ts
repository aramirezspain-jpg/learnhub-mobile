import type { IAuthRepository } from '../interfaces';
import type { AuthCredentials, AuthResult, RegisterData, UserProfile } from '@/types/user';

/**
 * SupabaseAuthRepository — Phase 5 stub.
 * TODO: replace body of each method with real supabase.auth.* calls.
 *
 * Activation checklist:
 *   1. npx expo install @supabase/supabase-js
 *   2. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in .env
 *   3. Set SUPABASE_ENABLED = true in services/supabase/client.ts
 *   4. Implement each method below using the supabase client
 */
export class SupabaseAuthRepository implements IAuthRepository {
  async signIn(_credentials: AuthCredentials): Promise<AuthResult> {
    // TODO: const { data, error } = await supabase.auth.signInWithPassword(credentials);
    // TODO: if (error) return { success: false, error: mapSupabaseError(error) };
    // TODO: return { success: true, user: supabaseUserToProfile(data.user) };
    return { success: false, error: 'network_error' };
  }

  async signUp(_data: RegisterData): Promise<AuthResult> {
    // TODO: const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { display_name } } });
    // TODO: if (error) return { success: false, error: mapSupabaseError(error) };
    // TODO: return { success: true, user: supabaseUserToProfile(data.user) };
    return { success: false, error: 'network_error' };
  }

  async signOut(): Promise<void> {
    // TODO: await supabase.auth.signOut();
  }

  async getStoredSession(): Promise<UserProfile | null> {
    // TODO: const { data } = await supabase.auth.getSession();
    // TODO: if (!data.session) return null;
    // TODO: return supabaseUserToProfile(data.session.user);
    return null;
  }

  async refreshSession(): Promise<{ access_token: string; expires_at: number } | null> {
    // TODO: const { data, error } = await supabase.auth.refreshSession();
    // TODO: if (error || !data.session) return null;
    // TODO: return { access_token: data.session.access_token, expires_at: data.session.expires_at ?? 0 };
    return null;
  }

  async resetPassword(_email: string): Promise<{ success: boolean; error?: string }> {
    // TODO: const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: '...' });
    // TODO: if (error) return { success: false, error: error.message };
    // TODO: return { success: true };
    return { success: false, error: 'backend_not_connected' };
  }
}
