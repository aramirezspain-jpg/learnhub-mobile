import type { IProfileRepository } from '../interfaces';
import type { UserProfile } from '@/types/user';
import type { SyncMetadata } from '@/types/database';

/**
 * SupabaseUserRepository — Phase 5 stub.
 * TODO: implement using supabase.from('profiles').select/insert/update
 */
export class SupabaseUserRepository implements IProfileRepository {
  async getProfile(_userId: string): Promise<UserProfile | null> {
    // TODO: const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
    // TODO: if (error || !data) return null;
    // TODO: return supabaseRowToProfile(data);
    return null;
  }

  async saveProfile(_profile: UserProfile): Promise<void> {
    // TODO: await supabase.from('profiles').upsert(profileToSupabaseRow(profile));
  }

  async updateProfile(_userId: string, _updates: Partial<UserProfile>): Promise<void> {
    // TODO: await supabase.from('profiles').update(updates).eq('id', userId);
  }

  async getSyncMetadata(_userId: string): Promise<SyncMetadata | null> {
    // TODO: query sync_metadata table or profiles.sync_status column
    return { syncStatus: 'pending' };
  }

  async markSynced(userId: string, remoteId: string): Promise<void> {
    // TODO: await supabase.from('profiles').update({ sync_status: 'synced', remote_id: remoteId }).eq('id', userId);
    void userId; void remoteId;
  }
}
