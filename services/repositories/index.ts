import { type SQLiteDatabase } from 'expo-sqlite';
import { SUPABASE_ENABLED, supabaseConfig } from '@/services/supabase/client';
import { LocalAuthRepository } from './local/LocalAuthRepository';
import { LocalUserRepository } from './local/LocalUserRepository';
import { SupabaseAuthRepository } from './supabase/SupabaseAuthRepository';
import { SupabaseUserRepository } from './supabase/SupabaseUserRepository';
import type { IAuthRepository, IProfileRepository } from './interfaces';

// ─── Factory functions ────────────────────────────────────────────────────────

export function createAuthRepository(db: SQLiteDatabase): IAuthRepository {
  if (SUPABASE_ENABLED && supabaseConfig.isConfigured) {
    return new SupabaseAuthRepository();
  }
  return new LocalAuthRepository(db);
}

export function createUserRepository(db: SQLiteDatabase): IProfileRepository {
  if (SUPABASE_ENABLED && supabaseConfig.isConfigured) {
    return new SupabaseUserRepository();
  }
  return new LocalUserRepository(db);
}

// ─── Re-exports ───────────────────────────────────────────────────────────────

export type { IAuthRepository, IProfileRepository, IProgressRepository, INotificationRepository, ICourseRepository } from './interfaces';
export { LocalAuthRepository } from './local/LocalAuthRepository';
export { LocalUserRepository } from './local/LocalUserRepository';
export { SupabaseAuthRepository } from './supabase/SupabaseAuthRepository';
export { SupabaseUserRepository } from './supabase/SupabaseUserRepository';
