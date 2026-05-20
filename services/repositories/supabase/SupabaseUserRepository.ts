import { supabase } from '@/services/supabase/client';
import type { IProfileRepository } from '../interfaces';
import type { UserProfile, UserRole } from '@/types/user';
import type { ProfileRow, SyncMetadata } from '@/types/database';

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

// supabase client is untyped (no Database generic) — cast results explicitly
const db = supabase as any;

export class SupabaseUserRepository implements IProfileRepository {

  async getProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await db
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

  async saveProfile(profile: UserProfile): Promise<void> {
    if (!profile.id) return;
    try {
      await db.from('profiles').upsert({
        id:            profile.id,
        email:         profile.email      ?? '',
        display_name:  profile.display_name,
        rol:           profile.rol        ?? ('member' as UserRole),
        iglesia:       profile.iglesia    ?? null,
        ministerio:    profile.ministerio ?? null,
        ciudad:        profile.ciudad     ?? null,
        pais:          profile.pais       ?? null,
        bio:           profile.bio        ?? null,
        photo_url:     profile.photo_url  ?? null,
        church_id:     profile.churchId   ?? null,
        updated_at:    new Date().toISOString(),
      });
    } catch {
      // Offline — local state preserved, sync deferred
    }
  }

  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<void> {
    try {
      const row: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (updates.display_name !== undefined) row.display_name = updates.display_name;
      if (updates.email        !== undefined) row.email        = updates.email;
      if (updates.iglesia      !== undefined) row.iglesia      = updates.iglesia   ?? null;
      if (updates.ministerio   !== undefined) row.ministerio   = updates.ministerio ?? null;
      if (updates.ciudad       !== undefined) row.ciudad       = updates.ciudad     ?? null;
      if (updates.pais         !== undefined) row.pais         = updates.pais       ?? null;
      if (updates.bio          !== undefined) row.bio          = updates.bio        ?? null;
      if (updates.photo_url    !== undefined) row.photo_url    = updates.photo_url  ?? null;
      if (updates.churchId     !== undefined) row.church_id    = updates.churchId   ?? null;
      if (Object.keys(row).length <= 1) return; // only updated_at → skip
      await db.from('profiles').update(row).eq('id', userId);
    } catch {
      // Offline — silently defer
    }
  }

  async getSyncMetadata(_userId: string): Promise<SyncMetadata | null> {
    return { syncStatus: 'synced' };
  }

  async markSynced(_userId: string, _remoteId: string): Promise<void> {
    // No-op — Supabase is the source of truth
  }
}
