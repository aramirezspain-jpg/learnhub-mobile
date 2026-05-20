import type { UserRole } from '@/types/user';

// Extends SyncStatus — adds 'error' for failed sync attempts
export type SyncStatusExtended = 'local' | 'pending' | 'synced' | 'error';

export interface SyncMetadata {
  syncStatus: SyncStatusExtended;
  lastSyncedAt?: string;
  syncConflict?: boolean;
  syncError?: string;
  localId?: string;
  remoteId?: string;
}

export type UserId = string;
export type ChurchId = string;

// ─── Table row shapes (match SQLite schema) ───────────────────────────────────

export interface ProfileRow {
  id: UserId;
  display_name: string;
  email: string;
  rol: UserRole;
  iglesia: string | null;
  ministerio: string | null;
  ciudad: string | null;
  pais: string | null;
  bio: string | null;
  photo_url: string | null;
  church_id: ChurchId | null;
  fecha_registro: string;
  created_at: string;
  updated_at: string;
}

export interface LessonProgressRow {
  id: number;
  lesson_id: string;
  course_id: string;
  user_id: UserId | null;
  completed: 0 | 1;
  score: number | null;
  completed_at: string | null;
  updated_at: string;
}

export interface NoteRow {
  id: string;
  lesson_id: string;
  user_id: UserId | null;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface FavoriteRow {
  id: string;
  item_id: string;
  item_type: 'course' | 'lesson' | 'resource';
  user_id: UserId | null;
  created_at: string;
}

export interface PrayerRequestRow {
  id: string;
  user_id: UserId | null;
  title: string;
  body: string;
  status: 'active' | 'answered' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface CourseRow {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  level: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Database shape (Supabase-compatible generic) ─────────────────────────────

type TableDef<Row extends object> = {
  Row: Row;
  Insert: Partial<Row>;
  Update: Partial<Row>;
};

export interface Database {
  public: {
    Tables: {
      profiles:         TableDef<ProfileRow>;
      lesson_progress:  TableDef<LessonProgressRow>;
      notes:            TableDef<NoteRow>;
      favorites:        TableDef<FavoriteRow>;
      prayer_requests:  TableDef<PrayerRequestRow>;
      courses:          TableDef<CourseRow>;
    };
  };
}
