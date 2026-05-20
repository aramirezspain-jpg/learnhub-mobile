/**
 * MockAuthService — local-only authentication for Phase 4.
 * Stores credentials in SQLite (auth_local_users table).
 * Phase 5: replace with Supabase/Firebase calls.
 */

import { type SQLiteDatabase } from 'expo-sqlite';
import {
  AuthLocalUsersRepository,
  AuthSessionRepository,
  authUserToProfile,
} from '@/database/repositories/authLocalUsers';
import type { AuthCredentials, RegisterData, AuthResult, UserProfile } from '@/types/user';

export class MockAuthService {
  constructor(private db: SQLiteDatabase) {}

  async signIn(credentials: AuthCredentials): Promise<AuthResult> {
    try {
      const repo = new AuthLocalUsersRepository(this.db);
      const user = await repo.findByCredentials(credentials.email, credentials.password);
      if (!user) return { success: false, error: 'invalid_credentials' };
      await new AuthSessionRepository(this.db).saveSession(user.id);
      return { success: true, user: authUserToProfile(user) };
    } catch {
      return { success: false, error: 'unknown' };
    }
  }

  async signUp(data: RegisterData): Promise<AuthResult> {
    if (!data.password || data.password.length < 6) {
      return { success: false, error: 'weak_password' };
    }
    try {
      const repo = new AuthLocalUsersRepository(this.db);
      const existing = await repo.findByEmail(data.email);
      if (existing) return { success: false, error: 'email_taken' };
      const user = await repo.create(data);
      await new AuthSessionRepository(this.db).saveSession(user.id);
      return { success: true, user: authUserToProfile(user) };
    } catch {
      return { success: false, error: 'unknown' };
    }
  }

  async signOut(): Promise<void> {
    await new AuthSessionRepository(this.db).clearSession();
  }

  /** Called on app boot — restores session if persisted */
  async getStoredSession(): Promise<UserProfile | null> {
    const session = await new AuthSessionRepository(this.db).getSession();
    if (!session) return null;
    const user = await new AuthLocalUsersRepository(this.db).findById(session.user_id);
    if (!user) {
      await new AuthSessionRepository(this.db).clearSession();
      return null;
    }
    return authUserToProfile(user);
  }
}
