/**
 * AuthService — Fase 4 foundation stub.
 *
 * En Fase 3 la app opera completamente offline con perfil local.
 * En Fase 4 este servicio se conectará al backend (Supabase u otro).
 * Los métodos están preparados con la firma correcta para no romper
 * la integración cuando se active.
 */

import type { UserProfile, Session } from '@/types/user';

export class AuthService {
  /** Siempre true en Fase 3. Fase 4: false cuando hay sesión activa. */
  static isLocalMode(): boolean {
    return true;
  }

  // ── Phase 4: uncomment and implement when backend is ready ──────────────────

  // static async signIn(email: string, password: string): Promise<Session> {
  //   throw new Error('signIn not implemented — Phase 4');
  // }

  // static async signUp(
  //   email: string,
  //   password: string,
  //   profile: Pick<UserProfile, 'display_name' | 'iglesia'>
  // ): Promise<Session> {
  //   throw new Error('signUp not implemented — Phase 4');
  // }

  // static async signOut(): Promise<void> {
  //   throw new Error('signOut not implemented — Phase 4');
  // }

  // static async refreshSession(): Promise<Session | null> {
  //   throw new Error('refreshSession not implemented — Phase 4');
  // }

  // static async getSession(): Promise<Session | null> {
  //   throw new Error('getSession not implemented — Phase 4');
  // }

  // static async updateRemoteProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
  //   throw new Error('updateRemoteProfile not implemented — Phase 4');
  // }
}
