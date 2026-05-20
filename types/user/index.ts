// ─── Roles ───────────────────────────────────────────────────────────────────

export type UserRole = 'member' | 'leader' | 'admin';

export const ROLE_META: Record<UserRole, { label: string; color: string; icon: string }> = {
  member:  { label: 'Miembro', color: '#6366F1', icon: 'person-outline'  },
  leader:  { label: 'Líder',   color: '#8B5CF6', icon: 'star-outline'    },
  admin:   { label: 'Admin',   color: '#F59E0B', icon: 'shield-outline'  },
};

// ─── Sync ────────────────────────────────────────────────────────────────────

/** Estado de sincronización. Phase 5: 'synced' when Supabase is connected. */
export type SyncStatus = 'local' | 'pending_sync' | 'synced';

// ─── Profile ─────────────────────────────────────────────────────────────────

/**
 * Perfil de usuario.
 * Phase 3: almacenado localmente en SQLite (app_settings o auth_local_users).
 * Phase 5: sincronizado con Supabase; userId/churchId vendrán del proveedor de auth.
 */
export interface UserProfile {
  id?: string;              // Phase 5: Supabase auth UID (mismo que userId)
  userId?: string;          // Phase 5: Supabase auth UID (preparado para cloud)
  churchId?: string;        // Phase 5: Supabase church record ID
  display_name: string;
  email?: string;
  photo_url?: string;       // Phase 5: remote URL o local file URI
  iglesia?: string;
  ministerio?: string;
  ciudad?: string;
  pais?: string;
  bio?: string;             // Presentación corta del usuario
  fecha_registro?: string;  // ISO — cuándo el usuario se unió a la app
  syncStatus: SyncStatus;   // Siempre 'local' hasta Phase 5
  rol: UserRole;
  updated_at: string;       // ISO datetime
}

export const DEFAULT_PROFILE: UserProfile = {
  display_name: 'Estudiante',
  rol: 'member',
  syncStatus: 'local',
  updated_at: new Date().toISOString(),
};

// ─── Session ─────────────────────────────────────────────────────────────────

/**
 * Estados de sesión:
 * - loading       : cargando desde SQLite en boot
 * - local         : sin auth, usando perfil local (Fase 3)
 * - authenticated : con auth real (Fase 4)
 * - unauthenticated: Fase 4, no hay sesión activa
 */
export type SessionStatus = 'loading' | 'local' | 'authenticated' | 'unauthenticated';

export interface Session {
  status: SessionStatus;
  profile: UserProfile | null;
  // Phase 4 additions (uncomment when implementing auth):
  // access_token?: string;
  // refresh_token?: string;
  // expires_at?: number;
}

// ─── Auth types ───────────────────────────────────────────────────────────────

/** Row in auth_local_users table (mock-only, replaced by remote in Phase 5) */
export interface LocalAuthUser {
  id: string;
  email: string;
  display_name: string;
  password_hash: string;
  rol: UserRole;
  iglesia?: string;
  ministerio?: string;
  ciudad?: string;
  pais?: string;
  bio?: string;
  fecha_registro?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  display_name: string;
  email: string;
  password: string;
  iglesia?: string;
  ministerio?: string;
}

export type AuthError =
  | 'invalid_credentials'
  | 'email_taken'
  | 'weak_password'
  | 'network_error'
  | 'unknown';

export interface AuthResult {
  success: boolean;
  error?: AuthError;
  user?: UserProfile;
}
