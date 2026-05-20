import { type SQLiteDatabase } from 'expo-sqlite';
import { type UserProfile, DEFAULT_PROFILE } from '@/types/user';

const SETTINGS_KEY = 'local_user_profile';

/**
 * Persiste el perfil de usuario en la tabla app_settings existente.
 * Fase 4: migrar a tabla propia o a Supabase user metadata.
 */
export class LocalUserProfileRepository {
  constructor(private db: SQLiteDatabase) {}

  async get(): Promise<UserProfile> {
    const row = await this.db.getFirstAsync<{ value: string }>(
      'SELECT value FROM app_settings WHERE key = ?',
      [SETTINGS_KEY]
    );
    if (!row) return { ...DEFAULT_PROFILE, updated_at: new Date().toISOString() };
    try {
      return JSON.parse(row.value) as UserProfile;
    } catch {
      return { ...DEFAULT_PROFILE, updated_at: new Date().toISOString() };
    }
  }

  async save(profile: UserProfile): Promise<void> {
    await this.db.runAsync(
      `INSERT OR REPLACE INTO app_settings (key, value, updated_at)
       VALUES (?, ?, datetime('now'))`,
      [SETTINGS_KEY, JSON.stringify(profile)]
    );
  }
}
