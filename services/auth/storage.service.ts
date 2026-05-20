/**
 * Security abstractions — Phase 5 will implement these with expo-secure-store + JWT.
 * Phase 4: interfaces only, no real implementation needed.
 */

/** Secure key-value storage — Phase 5: swap for expo-secure-store */
export interface ISecureStorage {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
}

/** JWT token storage — Phase 5: store access + refresh tokens securely */
export interface ITokenStorage {
  getAccessToken(): Promise<string | null>;
  setAccessToken(token: string, expiresAt: number): Promise<void>;
  getRefreshToken(): Promise<string | null>;
  setRefreshToken(token: string): Promise<void>;
  clearTokens(): Promise<void>;
  isTokenExpired(): Promise<boolean>;
}

/** Session refresh — Phase 5: call backend to refresh expired sessions */
export interface ISessionRefresh {
  refresh(): Promise<{ access_token: string; expires_at: number } | null>;
}
