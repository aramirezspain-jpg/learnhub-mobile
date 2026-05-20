// ─── Roles ───────────────────────────────────────────────────────────────────

export type UserRole = 'member' | 'leader' | 'admin';

export const ROLE_META: Record<UserRole, { label: string; color: string; icon: string }> = {
  member:  { label: 'Miembro', color: '#6366F1', icon: 'person-outline'  },
  leader:  { label: 'Líder',   color: '#8B5CF6', icon: 'star-outline'    },
  admin:   { label: 'Admin',   color: '#F59E0B', icon: 'shield-outline'  },
};

// ─── Profile ─────────────────────────────────────────────────────────────────

/**
 * Perfil de usuario.
 * Fase 3: almacenado localmente en SQLite (app_settings).
 * Fase 4: sincronizado con backend; `id` vendrá del proveedor de auth.
 */
export interface UserProfile {
  id?: string;            // Phase 4: set by auth provider (Supabase uid)
  display_name: string;
  email?: string;
  photo_url?: string;     // Phase 4: remote URL or local file URI
  iglesia?: string;
  ministerio?: string;
  rol: UserRole;
  updated_at: string;     // ISO datetime
}

export const DEFAULT_PROFILE: UserProfile = {
  display_name: 'Estudiante',
  rol: 'member',
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
