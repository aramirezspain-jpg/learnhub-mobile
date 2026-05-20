import { useSQLiteContext } from 'expo-sqlite';
import { useUserProfileStore } from '@/store/userProfile.store';
import { useAuthStore } from '@/store/auth.store';
import { LocalUserProfileRepository } from '@/database/repositories/localUserProfile';
import { AuthLocalUsersRepository } from '@/database/repositories/authLocalUsers';
import { DEFAULT_PROFILE, type UserProfile } from '@/types/user';

/**
 * Hook para leer y actualizar el perfil del usuario activo.
 * - Modo local (no autenticado): persiste en app_settings.local_user_profile
 * - Modo autenticado: persiste en auth_local_users
 * Phase 5: modo autenticado llamará a Supabase.
 */
export function useLocalProfile() {
  const db              = useSQLiteContext();
  const profile         = useUserProfileStore(s => s.profile);
  const setProfile      = useUserProfileStore(s => s.setProfile);
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const sessionUserId   = useAuthStore(s => s.sessionUserId);

  const save = async (updates: Partial<Omit<UserProfile, 'updated_at' | 'syncStatus' | 'userId' | 'churchId'>>) => {
    const current = profile ?? { ...DEFAULT_PROFILE, updated_at: new Date().toISOString() };
    const updated: UserProfile = {
      ...current,
      ...updates,
      syncStatus: isAuthenticated ? 'pending_sync' : 'local',
      userId: isAuthenticated ? (sessionUserId ?? current.userId) : current.userId,
      fecha_registro: current.fecha_registro ?? new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isAuthenticated && sessionUserId) {
      const authRepo = new AuthLocalUsersRepository(db);
      await authRepo.updateProfile(sessionUserId, {
        display_name: updates.display_name ?? current.display_name,
        iglesia:    updates.iglesia,
        ministerio: updates.ministerio,
        ciudad:     updates.ciudad,
        pais:       updates.pais,
        bio:        updates.bio,
      });
    } else {
      await new LocalUserProfileRepository(db).save(updated);
    }
    setProfile(updated);
  };

  return { profile, save } as const;
}
