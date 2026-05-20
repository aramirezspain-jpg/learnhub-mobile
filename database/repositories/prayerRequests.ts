import { type SQLiteDatabase } from 'expo-sqlite';
import type { PrayerRequest, PrayerCategory, PrayerRequestStatus } from '@/types/community';

function genId(): string {
  return `pr_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

type PrayerRequestRow = Omit<PrayerRequest, 'privado'> & { privado: number };

function rowToModel(row: PrayerRequestRow): PrayerRequest {
  return { ...row, privado: row.privado === 1 };
}

export class PrayerRequestsRepository {
  constructor(private db: SQLiteDatabase) {}

  async getAll(): Promise<PrayerRequest[]> {
    const rows = await this.db.getAllAsync<PrayerRequestRow>(
      'SELECT * FROM prayer_requests ORDER BY created_at DESC'
    );
    return rows.map(rowToModel);
  }

  async create(data: {
    titulo: string;
    descripcion?: string;
    categoria: PrayerCategory;
    privado: boolean;
    fecha: string;
  }): Promise<PrayerRequest> {
    const id = genId();
    await this.db.runAsync(
      `INSERT INTO prayer_requests (id, titulo, descripcion, categoria, privado, estado, fecha)
       VALUES (?, ?, ?, ?, ?, 'pendiente', ?)`,
      [id, data.titulo, data.descripcion ?? null, data.categoria, data.privado ? 1 : 0, data.fecha]
    );
    const row = await this.db.getFirstAsync<PrayerRequestRow>(
      'SELECT * FROM prayer_requests WHERE id = ?',
      [id]
    );
    return rowToModel(row!);
  }

  async updateStatus(id: string, estado: PrayerRequestStatus): Promise<void> {
    await this.db.runAsync(
      'UPDATE prayer_requests SET estado = ? WHERE id = ?',
      [estado, id]
    );
  }

  async delete(id: string): Promise<void> {
    await this.db.runAsync('DELETE FROM prayer_requests WHERE id = ?', [id]);
  }
}
