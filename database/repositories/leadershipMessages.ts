import { type SQLiteDatabase } from 'expo-sqlite';
import type { LeadershipMessage, MessagePriority } from '@/types/community';

function genId(): string {
  return `lm_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

export class LeadershipMessagesRepository {
  constructor(private db: SQLiteDatabase) {}

  async getAll(): Promise<LeadershipMessage[]> {
    return this.db.getAllAsync<LeadershipMessage>(
      'SELECT * FROM leadership_messages ORDER BY created_at DESC'
    );
  }

  async create(data: {
    ministerio: string;
    mensaje: string;
    prioridad: MessagePriority;
  }): Promise<LeadershipMessage> {
    const id = genId();
    await this.db.runAsync(
      `INSERT INTO leadership_messages (id, ministerio, mensaje, prioridad, estado)
       VALUES (?, ?, ?, ?, 'enviado')`,
      [id, data.ministerio, data.mensaje, data.prioridad]
    );
    const row = await this.db.getFirstAsync<LeadershipMessage>(
      'SELECT * FROM leadership_messages WHERE id = ?',
      [id]
    );
    return row!;
  }

  async delete(id: string): Promise<void> {
    await this.db.runAsync('DELETE FROM leadership_messages WHERE id = ?', [id]);
  }
}
