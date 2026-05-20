import { type SQLiteDatabase } from 'expo-sqlite';
import type { AppNotification, AppNotificationRow, NotificationType } from '@/types/notifications';

function genId(): string {
  return `notif_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

function rowToModel(row: AppNotificationRow): AppNotification {
  return { ...row, leida: row.leida === 1 };
}

export class AppNotificationsRepository {
  constructor(private db: SQLiteDatabase) {}

  async getAll(): Promise<AppNotification[]> {
    const rows = await this.db.getAllAsync<AppNotificationRow>(
      'SELECT * FROM app_notifications ORDER BY created_at DESC'
    );
    return rows.map(rowToModel);
  }

  async getUnreadCount(): Promise<number> {
    const row = await this.db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM app_notifications WHERE leida = 0'
    );
    return row?.count ?? 0;
  }

  // Returns referencia_ids already recorded for a given tipo (to avoid duplicate notifications)
  async getExistingReferenceIds(tipo: NotificationType): Promise<string[]> {
    const rows = await this.db.getAllAsync<{ referencia_id: string }>(
      'SELECT referencia_id FROM app_notifications WHERE tipo = ? AND referencia_id IS NOT NULL',
      [tipo]
    );
    return rows.map(r => r.referencia_id);
  }

  async create(data: {
    titulo: string;
    cuerpo: string;
    tipo: NotificationType;
    referencia_id?: string;
    ruta?: string;
  }): Promise<AppNotification> {
    const id = genId();
    await this.db.runAsync(
      `INSERT INTO app_notifications (id, titulo, cuerpo, tipo, referencia_id, ruta, leida)
       VALUES (?, ?, ?, ?, ?, ?, 0)`,
      [id, data.titulo, data.cuerpo, data.tipo, data.referencia_id ?? null, data.ruta ?? null]
    );
    const row = await this.db.getFirstAsync<AppNotificationRow>(
      'SELECT * FROM app_notifications WHERE id = ?',
      [id]
    );
    return rowToModel(row!);
  }

  async markRead(id: string): Promise<void> {
    await this.db.runAsync(
      'UPDATE app_notifications SET leida = 1 WHERE id = ?',
      [id]
    );
  }

  async markAllRead(): Promise<void> {
    await this.db.runAsync('UPDATE app_notifications SET leida = 1');
  }

  async delete(id: string): Promise<void> {
    await this.db.runAsync('DELETE FROM app_notifications WHERE id = ?', [id]);
  }

  async deleteAll(): Promise<void> {
    await this.db.runAsync('DELETE FROM app_notifications');
  }
}
