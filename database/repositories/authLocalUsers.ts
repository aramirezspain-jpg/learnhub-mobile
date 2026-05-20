import { type SQLiteDatabase } from 'expo-sqlite';
import {
  type LocalAuthUser,
  type RegisterData,
  type UserProfile,
  type UserRole,
  DEFAULT_PROFILE,
} from '@/types/user';

// NOTE: not cryptographic — mock-only hash, replaced by backend auth in Phase 5
function mockHash(str: string): string {
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) + h) ^ str.charCodeAt(i);
    h = h >>> 0;
  }
  return h.toString(16).padStart(8, '0');
}

function generateId(): string {
  return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 9);
}

export function authUserToProfile(user: LocalAuthUser): UserProfile {
  return {
    id: user.id,
    display_name: user.display_name,
    email: user.email,
    rol: user.rol as UserRole,
    iglesia: user.iglesia,
    ministerio: user.ministerio,
    updated_at: user.updated_at,
  };
}

export class AuthLocalUsersRepository {
  constructor(private db: SQLiteDatabase) {}

  async findByEmail(email: string): Promise<LocalAuthUser | null> {
    const row = await this.db.getFirstAsync<LocalAuthUser>(
      'SELECT * FROM auth_local_users WHERE email = ?',
      [email.toLowerCase().trim()]
    );
    return row ?? null;
  }

  async findById(id: string): Promise<LocalAuthUser | null> {
    const row = await this.db.getFirstAsync<LocalAuthUser>(
      'SELECT * FROM auth_local_users WHERE id = ?',
      [id]
    );
    return row ?? null;
  }

  async findByCredentials(email: string, password: string): Promise<LocalAuthUser | null> {
    const hash = mockHash(password);
    const row = await this.db.getFirstAsync<LocalAuthUser>(
      'SELECT * FROM auth_local_users WHERE email = ? AND password_hash = ?',
      [email.toLowerCase().trim(), hash]
    );
    return row ?? null;
  }

  async create(data: RegisterData): Promise<LocalAuthUser> {
    const id = generateId();
    const now = new Date().toISOString();
    const hash = mockHash(data.password);
    const email = data.email.toLowerCase().trim();
    await this.db.runAsync(
      `INSERT INTO auth_local_users
         (id, email, display_name, password_hash, rol, iglesia, ministerio, created_at, updated_at)
       VALUES (?, ?, ?, ?, 'member', ?, ?, ?, ?)`,
      [id, email, data.display_name.trim(), hash,
        data.iglesia?.trim() ?? null, data.ministerio?.trim() ?? null, now, now]
    );
    return (await this.findById(id))!;
  }

  async updateProfile(
    id: string,
    updates: Partial<Pick<LocalAuthUser, 'display_name' | 'iglesia' | 'ministerio' | 'rol'>>
  ): Promise<void> {
    const now = new Date().toISOString();
    const fields: string[] = [];
    const values: (string | null)[] = [];
    if (updates.display_name !== undefined) { fields.push('display_name = ?'); values.push(updates.display_name); }
    if (updates.iglesia !== undefined)       { fields.push('iglesia = ?');      values.push(updates.iglesia ?? null); }
    if (updates.ministerio !== undefined)    { fields.push('ministerio = ?');   values.push(updates.ministerio ?? null); }
    if (updates.rol !== undefined)           { fields.push('rol = ?');          values.push(updates.rol); }
    if (fields.length === 0) return;
    fields.push('updated_at = ?');
    values.push(now);
    await this.db.runAsync(
      `UPDATE auth_local_users SET ${fields.join(', ')} WHERE id = ?`,
      [...values, id]
    );
  }
}

// ─── Session persistence (stored in app_settings) ─────────────────────────────

const SESSION_KEY = 'auth_session';

export class AuthSessionRepository {
  constructor(private db: SQLiteDatabase) {}

  async getSession(): Promise<{ user_id: string } | null> {
    const row = await this.db.getFirstAsync<{ value: string }>(
      'SELECT value FROM app_settings WHERE key = ?',
      [SESSION_KEY]
    );
    if (!row) return null;
    try {
      return JSON.parse(row.value) as { user_id: string };
    } catch {
      return null;
    }
  }

  async saveSession(userId: string): Promise<void> {
    const value = JSON.stringify({ user_id: userId, created_at: new Date().toISOString() });
    await this.db.runAsync(
      `INSERT OR REPLACE INTO app_settings (key, value, updated_at)
       VALUES (?, ?, datetime('now'))`,
      [SESSION_KEY, value]
    );
  }

  async clearSession(): Promise<void> {
    await this.db.runAsync('DELETE FROM app_settings WHERE key = ?', [SESSION_KEY]);
  }
}
