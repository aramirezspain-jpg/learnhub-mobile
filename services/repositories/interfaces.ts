import type { AuthCredentials, AuthResult, RegisterData, UserProfile } from '@/types/user';
import type { SyncMetadata } from '@/types/database';

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface IAuthRepository {
  signIn(credentials: AuthCredentials): Promise<AuthResult>;
  signUp(data: RegisterData): Promise<AuthResult>;
  signOut(): Promise<void>;
  getStoredSession(): Promise<UserProfile | null>;
  // Phase 5: Supabase-specific methods
  refreshSession?(): Promise<{ access_token: string; expires_at: number } | null>;
  resetPassword?(email: string): Promise<{ success: boolean; error?: string }>;
}

// ─── User profile ─────────────────────────────────────────────────────────────

export interface IProfileRepository {
  getProfile(userId: string): Promise<UserProfile | null>;
  saveProfile(profile: UserProfile): Promise<void>;
  updateProfile(userId: string, updates: Partial<UserProfile>): Promise<void>;
  // Phase 5: sync support
  getSyncMetadata?(userId: string): Promise<SyncMetadata | null>;
  markSynced?(userId: string, remoteId: string): Promise<void>;
}

// ─── Progress ─────────────────────────────────────────────────────────────────

export interface IProgressRepository {
  getCompletedLessons(userId?: string): Promise<string[]>;
  markLessonComplete(lessonId: string, courseId: string, userId?: string): Promise<void>;
  getLessonScore(lessonId: string, userId?: string): Promise<number | null>;
}

// ─── Notifications ────────────────────────────────────────────────────────────

export interface INotificationRepository {
  getUnread(userId?: string): Promise<string[]>;
  markRead(id: string): Promise<void>;
  markAllRead(userId?: string): Promise<void>;
}

// ─── Content (read-only, JSON-backed) ─────────────────────────────────────────

export interface ICourseRepository {
  getCourses(): Promise<import('@/types').Course[]>;
  getCourseById(id: string): Promise<import('@/types').Course | null>;
}
