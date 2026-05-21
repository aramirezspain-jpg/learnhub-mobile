import { supabase } from '@/services/supabase/client';
import type { IAuthRepository } from '../interfaces';
import type {
  AuthCredentials, AuthResult, RegisterData, UserProfile, UserRole,
  AuthError as AppAuthError,
} from '@/types/user';
import type { User } from '@supabase/supabase-js';
import type { ProfileRow } from '@/types/database';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function mapError(err: { message?: string; code?: string } | null): AppAuthError {
  if (!err) return 'unknown';
  const msg  = (err.message ?? '').toLowerCase();
  const code = err.code ?? '';
  if (code === 'invalid_credentials' || msg.includes('invalid login') || msg.includes('invalid credentials'))
    return 'invalid_credentials';
  if (code === 'user_already_exists' || code === 'email_exists' ||
      msg.includes('already registered') || msg.includes('email_exists') || msg.includes('already exists'))
    return 'email_taken';
  if (code === 'weak_password' || msg.includes('weak password'))
    return 'weak_password';
  if (msg.includes('network') || msg.includes('fetch') || msg.includes('connection'))
    return 'network_error';
  return 'unknown';
}

function userMetaToProfile(user: User): UserProfile {
  const meta = (user.user_metadata ?? {}) as Record<string, string | undefined>;
  return {
    id:            user.id,
    userId:        user.id,
    display_name:  meta.display_name ?? meta.full_name ?? user.email?.split('@')[0] ?? 'Usuario',
    email:         user.email ?? '',
    rol:           (meta.rol as UserRole) ?? 'member',
    iglesia:       meta.iglesia  ?? undefined,
    ministerio:    meta.ministerio ?? undefined,
    ciudad:        meta.ciudad   ?? undefined,
    pais:          meta.pais     ?? undefined,
    bio:           meta.bio      ?? undefined,
    photo_url:     user.user_metadata?.avatar_url ?? undefined,
    fecha_registro: user.created_at,
    syncStatus:    'synced',
    updated_at:    user.updated_at ?? new Date().toISOString(),
  };
}

function rowToProfile(row: ProfileRow): UserProfile {
  return {
    id:            row.id,
    userId:        row.id,
    display_name:  row.display_name,
    email:         row.email,
    rol:           row.rol,
    iglesia:       row.iglesia    ?? undefined,
    ministerio:    row.ministerio ?? undefined,
    ciudad:        row.ciudad     ?? undefined,
    pais:          row.pais       ?? undefined,
    bio:           row.bio        ?? undefined,
    photo_url:     row.photo_url  ?? undefined,
    churchId:      row.church_id  ?? undefined,
    fecha_registro: row.fecha_registro,
    syncStatus:    'synced',
    updated_at:    row.updated_at,
  };
}

async function fetchProfileRow(userId: string): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single() as { data: ProfileRow | null; error: unknown };
    if (error || !data) return null;
    return rowToProfile(data);
  } catch {
    return null;
  }
}

// ─── Repository ───────────────────────────────────────────────────────────────

export class SupabaseAuthRepository implements IAuthRepository {

  async signIn(credentials: AuthCredentials): Promise<AuthResult> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email:    credentials.email.trim().toLowerCase(),
        password: credentials.password,
      });
      if (error) return { success: false, error: mapError(error) };
      if (!data.user || !data.session) return { success: false, error: 'unknown' };
      const profile = await fetchProfileRow(data.user.id) ?? userMetaToProfile(data.user);
      return { success: true, user: profile };
    } catch {
      return { success: false, error: 'network_error' };
    }
  }

  async signUp(data: RegisterData): Promise<AuthResult> {
    try {
      const { data: authData, error } = await supabase.auth.signUp({
        email:    data.email.trim().toLowerCase(),
        password: data.password,
        options:  {
          data: {
            display_name: data.display_name.trim(),
            iglesia:      data.iglesia   ?? null,
            ministerio:   data.ministerio ?? null,
          },
        },
      });
      if (error) return { success: false, error: mapError(error) };
      if (!authData.user) return { success: false, error: 'unknown' };
      // Null session = email confirmation required. Disable it in Supabase →
      // Authentication → Providers → Email → "Confirm email" toggle OFF.
      if (!authData.session) return { success: false, error: 'unknown' };

      // Trigger auto-creates base profile; update extra fields if provided
      if (data.iglesia || data.ministerio) {
        await (supabase.from('profiles') as any)
          .update({
            iglesia:    data.iglesia    ?? null,
            ministerio: data.ministerio ?? null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', authData.user.id);
      }

      const profile = await fetchProfileRow(authData.user.id) ?? userMetaToProfile(authData.user);
      return { success: true, user: profile };
    } catch {
      return { success: false, error: 'network_error' };
    }
  }

  async signOut(): Promise<void> {
    try {
      await supabase.auth.signOut();
    } catch {
      // Local state is reset by SessionContext regardless
    }
  }

  async getStoredSession(): Promise<UserProfile | null> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session) return null;

      // Proactive refresh if session expires within 5 minutes
      const fiveMinFromNow = Math.floor(Date.now() / 1000) + 300;
      if ((session.expires_at ?? 0) < fiveMinFromNow) {
        const { data: refreshed } = await supabase.auth.refreshSession();
        if (!refreshed.session) return null;
      }

      // Fetch full profile — falls back to user_metadata if offline
      return await fetchProfileRow(session.user.id) ?? userMetaToProfile(session.user);
    } catch {
      return null;
    }
  }

  async refreshSession(): Promise<{ access_token: string; expires_at: number } | null> {
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

  async resetPassword(email: string): Promise<{ success: boolean; error?: string }> {
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
}
