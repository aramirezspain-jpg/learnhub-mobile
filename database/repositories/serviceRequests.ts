import { type SQLiteDatabase } from 'expo-sqlite';
import type { ServiceRequest, ServiceRequestType, ServiceRequestStatus } from '@/types/community';

function genId(): string {
  return `sr_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

export class ServiceRequestsRepository {
  constructor(private db: SQLiteDatabase) {}

  async getAll(): Promise<ServiceRequest[]> {
    return this.db.getAllAsync<ServiceRequest>(
      'SELECT * FROM service_requests ORDER BY created_at DESC'
    );
  }

  async create(data: {
    tipo: ServiceRequestType;
    descripcion?: string;
  }): Promise<ServiceRequest> {
    const id = genId();
    await this.db.runAsync(
      `INSERT INTO service_requests (id, tipo, descripcion, estado)
       VALUES (?, ?, ?, 'pendiente')`,
      [id, data.tipo, data.descripcion ?? null]
    );
    const row = await this.db.getFirstAsync<ServiceRequest>(
      'SELECT * FROM service_requests WHERE id = ?',
      [id]
    );
    return row!;
  }

  async updateStatus(id: string, estado: ServiceRequestStatus): Promise<void> {
    await this.db.runAsync(
      'UPDATE service_requests SET estado = ? WHERE id = ?',
      [estado, id]
    );
  }

  async delete(id: string): Promise<void> {
    await this.db.runAsync('DELETE FROM service_requests WHERE id = ?', [id]);
  }
}
