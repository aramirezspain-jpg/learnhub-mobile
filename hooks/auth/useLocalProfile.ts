import { useSQLiteContext } from 'expo-sqlite';
import { useUserProfileStore } from '@/store/userProfile.store';
import { LocalUserProfileRepository } from '@/database/repositories/localUserProfile';
import type { UserProfile } from '@/types/user';

/**
 * Hook para leer y actualizar el perfil local almacenado en SQLite.
 * En Fase 4 este hook coexistirá con el perfil remoto; los cambios locales
 * se sincronizarán cuando haya conexión.
 */
export function useLocalProfile() {
  const db = useSQLiteContext();
  const profile = useUserProfileStore(s => s.profile);
  const setProfile = useUserProfileStore(s => s.setProfile);

  const save = async (updates: Partial<Omit<UserProfile, 'updated_at'>>) => {
    const repo = new LocalUserProfileRepository(db);
    const current = profile ?? { display_name: 'Estudiante', rol: 'member' as const, updated_at: new Date().toISOString() };
    const updated: UserProfile = {
      ...current,
      ...updates,
      updated_at: new Date().toISOString(),
    };
    await repo.save(updated);
    setProfile(updated);
  };

  return { profile, save } as const;
}
