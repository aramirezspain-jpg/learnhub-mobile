import { type SQLiteDatabase } from 'expo-sqlite';
import {
  AuthLocalUsersRepository,
  authUserToProfile,
} from '@/database/repositories/authLocalUsers';
import { LocalUserProfileRepository } from '@/database/repositories/localUserProfile';
import type { IProfileRepository } from '../interfaces';
import type { UserProfile } from '@/types/user';
import type { SyncMetadata } from '@/types/database';

/**
 * LocalUserRepository — reads/writes user profile from SQLite.
 * Phase 5: SupabaseUserRepository syncs to remote after local save.
 */
export class LocalUserRepository implements IProfileRepository {
  private authRepo: AuthLocalUsersRepository;
  private localRepo: LocalUserProfileRepository;

  constructor(db: SQLiteDatabase) {
    this.authRepo   = new AuthLocalUsersRepository(db);
    this.localRepo  = new LocalUserProfileRepository(db);
  }

  async getProfile(userId: string): Promise<UserProfile | null> {
    const authUser = await this.authRepo.findById(userId);
    if (authUser) return authUserToProfile(authUser);
    return this.localRepo.get();
  }

  async saveProfile(profile: UserProfile): Promise<void> {
    await this.localRepo.save(profile);
    if (profile.id) {
      await this.authRepo.updateProfile(profile.id, {
        display_name: profile.display_name,
        iglesia:  profile.iglesia,
        ministerio: profile.ministerio,
        ciudad: profile.ciudad,
        pais: profile.pais,
        bio: profile.bio,
      });
    }
  }

  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<void> {
    await this.authRepo.updateProfile(userId, {
      display_name: updates.display_name,
      iglesia:      updates.iglesia,
      ministerio:   updates.ministerio,
      ciudad:       updates.ciudad,
      pais:         updates.pais,
      bio:          updates.bio,
    });
  }

  async getSyncMetadata(_userId: string): Promise<SyncMetadata | null> {
    return { syncStatus: 'local' };
  }

  async markSynced(_userId: string, _remoteId: string): Promise<void> {
    // Phase 5: update syncStatus to 'synced' after Supabase push
  }
}
