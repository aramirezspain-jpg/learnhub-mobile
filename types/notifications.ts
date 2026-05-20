export type NotificationType = 'anuncio' | 'horario' | 'evento' | 'curso' | 'sistema';

export interface AppNotification {
  id: string;
  titulo: string;
  cuerpo: string;
  tipo: NotificationType;
  referencia_id?: string;  // ID del anuncio, horario o curso relacionado
  ruta?: string;           // Ruta de navegación al pulsar
  leida: boolean;
  created_at: string;
}

// Row representation in SQLite (boolean stored as 0/1)
export type AppNotificationRow = Omit<AppNotification, 'leida'> & { leida: number };
