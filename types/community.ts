// ─── Cartelera / Anuncios ────────────────────────────────────────────────────

export type AnnouncementCategory = 'evento' | 'campana' | 'ayuno' | 'actividad' | 'general';
export type AnnouncementPriority = 'alta' | 'media' | 'baja';
export type AnnouncementStatus = 'activo' | 'expirado';

export interface Announcement {
  id: string;
  titulo: string;
  descripcion: string;
  fecha: string; // ISO date — ej. "2026-06-14"
  categoria: AnnouncementCategory;
  prioridad: AnnouncementPriority;
  imagen_url?: string;
  estado: AnnouncementStatus;
  created_at: string; // ISO datetime
}

// ─── Horarios ─────────────────────────────────────────────────────────────────

export type ScheduleType = 'culto' | 'discipulado' | 'escuela_biblica' | 'reunion' | 'actividad';

export interface Schedule {
  id: string;
  titulo: string;
  tipo: ScheduleType;
  hora: string; // "HH:mm" — ej. "10:00"
  dia_semana?: number; // 0=Domingo … 6=Sábado (para recurrentes)
  fecha_especifica?: string; // ISO date para eventos únicos
  ubicacion: string;
  responsable: string;
  descripcion?: string;
  es_recurrente: boolean;
  activo: boolean;
}

// ─── Contactos / Grupos ───────────────────────────────────────────────────────

export type ContactType = 'lider' | 'ministerio' | 'grupo';

export interface Contact {
  id: string;
  nombre: string;
  tipo: ContactType;
  cargo?: string;
  descripcion?: string;
  whatsapp?: string;
  telegram?: string;
  ubicacion?: string;
  zona?: string;
  color: string; // hex
}

// ─── Biblioteca Comunidad ─────────────────────────────────────────────────────

export type CommunityResourceType = 'pdf' | 'sermon' | 'enlace' | 'recurso';

export interface CommunityResource {
  id: string;
  titulo: string;
  tipo: CommunityResourceType;
  descripcion?: string;
  url?: string;
  autor?: string;
  fecha: string; // ISO date
  categoria: string;
}

// ─── Notificaciones locales ───────────────────────────────────────────────────

export interface LocalNotification {
  id: string;
  titulo: string;
  mensaje: string;
  tipo: 'anuncio' | 'evento' | 'novedad';
  announcement_id?: string;
  created_at: string;
}
