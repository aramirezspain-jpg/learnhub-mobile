// ─── Cartelera / Anuncios ────────────────────────────────────────────────────

export type AnnouncementCategory = 'evento' | 'campana' | 'ayuno' | 'actividad' | 'general';
export type AnnouncementPriority = 'alta' | 'media' | 'baja';
export type AnnouncementStatus = 'activo' | 'expirado' | 'destacado';

export interface Announcement {
  id: string;
  titulo: string;
  descripcion: string;
  fecha: string;             // ISO date — fecha del evento/inicio
  fecha_expiracion?: string; // ISO date — cuándo deja de mostrarse
  categoria: AnnouncementCategory;
  prioridad: AnnouncementPriority;
  imagen_url?: string;
  estado: AnnouncementStatus;
  created_at: string;        // ISO datetime
}

// ─── Horarios ─────────────────────────────────────────────────────────────────

export type ScheduleType = 'culto' | 'discipulado' | 'escuela_biblica' | 'reunion' | 'actividad';

export interface Schedule {
  id: string;
  titulo: string;
  tipo: ScheduleType;
  hora: string;              // "HH:mm"
  dia_semana?: number;       // 0=Domingo … 6=Sábado (recurrentes)
  fecha_especifica?: string; // ISO date para eventos únicos
  ubicacion: string;
  responsable: string;
  descripcion?: string;
  categoria?: string;        // Agrupación: "Principal", "Jóvenes", "Formación"
  recordatorio?: boolean;    // Preparado para push notifications (Phase 4)
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
  email?: string;            // Email de contacto
  horario_atencion?: string; // Ej. "Lun–Vie 10:00–18:00"
  ubicacion?: string;
  zona?: string;
  color: string;             // hex
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
  fecha: string;             // ISO date
  categoria: string;
  destacado?: boolean;       // Recursos seleccionados por el equipo pastoral
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

// ─── Peticiones de Oración ────────────────────────────────────────────────────

export type PrayerCategory = 'sanidad' | 'familia' | 'trabajo' | 'finanzas' | 'espiritual' | 'otro';
export type PrayerRequestStatus = 'pendiente' | 'respondida' | 'archivada';

export interface PrayerRequest {
  id: string;
  titulo: string;
  descripcion?: string;
  categoria: PrayerCategory;
  privado: boolean;
  estado: PrayerRequestStatus;
  fecha: string;             // ISO date
  created_at: string;        // ISO datetime
}

// ─── Mensajes a Liderazgo ─────────────────────────────────────────────────────

export type MessagePriority = 'normal' | 'urgente';
export type MessageStatus = 'enviado' | 'leido';

export interface LeadershipMessage {
  id: string;
  ministerio: string;
  mensaje: string;
  prioridad: MessagePriority;
  estado: MessageStatus;
  created_at: string;
}

// ─── Solicitudes de Servicio ──────────────────────────────────────────────────

export type ServiceRequestType = 'consejeria' | 'visita_pastoral' | 'ayuda' | 'bautismo' | 'matrimonio' | 'otro';
export type ServiceRequestStatus = 'pendiente' | 'en_proceso' | 'completada';

export interface ServiceRequest {
  id: string;
  tipo: ServiceRequestType;
  descripcion?: string;
  estado: ServiceRequestStatus;
  created_at: string;
}
