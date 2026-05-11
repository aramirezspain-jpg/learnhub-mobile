import { type SQLiteDatabase } from 'expo-sqlite';
import { type Favorite } from '@/types';

function genId(): string {
  return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

export class FavoritesRepository {
  constructor(private db: SQLiteDatabase) {}

  async addFavorite(
    contentId: string,
    contentType: Favorite['content_type'],
    courseId?: string
  ): Promise<void> {
    await this.db.runAsync(
      `INSERT OR IGNORE INTO favorites (id, content_id, content_type, course_id)
       VALUES (?, ?, ?, ?)`,
      [genId(), contentId, contentType, courseId ?? null]
    );
  }

  async removeFavorite(contentId: string): Promise<void> {
    await this.db.runAsync(
      'DELETE FROM favorites WHERE content_id = ?',
      [contentId]
    );
  }

  async isFavorite(contentId: string): Promise<boolean> {
    const result = await this.db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM favorites WHERE content_id = ?',
      [contentId]
    );
    return (result?.count ?? 0) > 0;
  }

  async getAllFavorites(): Promise<Favorite[]> {
    return await this.db.getAllAsync<Favorite>(
      'SELECT * FROM favorites ORDER BY created_at DESC'
    );
  }

  async getFavoritesByType(type: Favorite['content_type']): Promise<Favorite[]> {
    return await this.db.getAllAsync<Favorite>(
      'SELECT * FROM favorites WHERE content_type = ? ORDER BY created_at DESC',
      [type]
    );
  }
}
