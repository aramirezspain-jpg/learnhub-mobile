import { create } from 'zustand';
import type { Announcement, Schedule, Contact, CommunityResource } from '@/types/community';

interface CommunityState {
  announcements: Announcement[];
  schedules: Schedule[];
  contacts: Contact[];
  library: CommunityResource[];
  readAnnouncementIds: string[];

  setAnnouncements: (items: Announcement[]) => void;
  setSchedules: (items: Schedule[]) => void;
  setContacts: (items: Contact[]) => void;
  setLibrary: (items: CommunityResource[]) => void;
  setReadAnnouncementIds: (ids: string[]) => void;
  markAnnouncementRead: (id: string) => void;
}

export const useCommunityStore = create<CommunityState>((set, get) => ({
  announcements: [],
  schedules: [],
  contacts: [],
  library: [],
  readAnnouncementIds: [],

  setAnnouncements: (items) => set({ announcements: items }),
  setSchedules: (items) => set({ schedules: items }),
  setContacts: (items) => set({ contacts: items }),
  setLibrary: (items) => set({ library: items }),
  setReadAnnouncementIds: (ids) => set({ readAnnouncementIds: ids }),

  markAnnouncementRead: (id) => {
    const { readAnnouncementIds } = get();
    if (readAnnouncementIds.includes(id)) return;
    set({ readAnnouncementIds: [...readAnnouncementIds, id] });
  },
}));
