import { type SQLiteDatabase } from 'expo-sqlite';

// Persiste qué anuncios ha leído el usuario usando la tabla app_settings existente.
// Preparado para migrar a tabla propia cuando se integre push/Supabase.

const SETTINGS_KEY = 'community_notifications_read';

export class CommunityNotificationsRepository {
  constructor(private db: SQLiteDatabase) {}

  async getReadIds(): Promise<string[]> {
    const row = await this.db.getFirstAsync<{ value: string }>(
      'SELECT value FROM app_settings WHERE key = ?',
      [SETTINGS_KEY]
    );
    if (!row) return [];
    try {
      return JSON.parse(row.value) as string[];
    } catch {
      return [];
    }
  }

  async markAsRead(announcementId: string): Promise<void> {
    const current = await this.getReadIds();
    if (current.includes(announcementId)) return;
    const updated = [...current, announcementId];
    await this.db.runAsync(
      `INSERT OR REPLACE INTO app_settings (key, value, updated_at)
       VALUES (?, ?, datetime('now'))`,
      [SETTINGS_KEY, JSON.stringify(updated)]
    );
  }

  async markAllRead(announcementIds: string[]): Promise<void> {
    await this.db.runAsync(
      `INSERT OR REPLACE INTO app_settings (key, value, updated_at)
       VALUES (?, ?, datetime('now'))`,
      [SETTINGS_KEY, JSON.stringify(announcementIds)]
    );
  }
}
