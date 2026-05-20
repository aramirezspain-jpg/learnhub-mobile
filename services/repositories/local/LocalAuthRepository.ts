import { type SQLiteDatabase } from 'expo-sqlite';
import { MockAuthService } from '@/services/auth/mock-auth.service';
import type { IAuthRepository } from '../interfaces';
import type { AuthCredentials, AuthResult, RegisterData, UserProfile } from '@/types/user';

/**
 * LocalAuthRepository — delegates to MockAuthService (SQLite-backed).
 * Phase 5: replaced by SupabaseAuthRepository when SUPABASE_ENABLED = true.
 */
export class LocalAuthRepository implements IAuthRepository {
  private svc: MockAuthService;

  constructor(db: SQLiteDatabase) {
    this.svc = new MockAuthService(db);
  }

  signIn(credentials: AuthCredentials): Promise<AuthResult> {
    return this.svc.signIn(credentials);
  }

  signUp(data: RegisterData): Promise<AuthResult> {
    return this.svc.signUp(data);
  }

  signOut(): Promise<void> {
    return this.svc.signOut();
  }

  getStoredSession(): Promise<UserProfile | null> {
    return this.svc.getStoredSession();
  }

  async resetPassword(_email: string): Promise<{ success: boolean; error?: string }> {
    return { success: false, error: 'backend_not_connected' };
  }
}
