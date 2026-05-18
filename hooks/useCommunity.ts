import { useCallback } from 'react';
import { useDatabase } from './useDatabase';
import { CommunityNotificationsRepository } from '@/database/repositories/communityNotifications';
import { useCommunityStore } from '@/store/community.store';

export function useCommunity() {
  const db = useDatabase();
  const store = useCommunityStore();

  const markAsRead = useCallback(
    async (announcementId: string) => {
      store.markAnnouncementRead(announcementId);
      const repo = new CommunityNotificationsRepository(db);
      await repo.markAsRead(announcementId);
    },
    [db, store]
  );

  return {
    announcements: store.announcements,
    schedules: store.schedules,
    contacts: store.contacts,
    library: store.library,
    readAnnouncementIds: store.readAnnouncementIds,
    markAsRead,
  };
}
