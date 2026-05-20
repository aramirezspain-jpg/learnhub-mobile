import { create } from 'zustand';
import type {
  PrayerRequest, PrayerRequestStatus,
  LeadershipMessage,
  ServiceRequest, ServiceRequestStatus,
} from '@/types/community';

interface UserActivityState {
  prayerRequests: PrayerRequest[];
  leadershipMessages: LeadershipMessage[];
  serviceRequests: ServiceRequest[];

  setPrayerRequests: (items: PrayerRequest[]) => void;
  addPrayerRequest: (item: PrayerRequest) => void;
  updatePrayerRequestStatus: (id: string, estado: PrayerRequestStatus) => void;
  deletePrayerRequest: (id: string) => void;

  setLeadershipMessages: (items: LeadershipMessage[]) => void;
  addLeadershipMessage: (item: LeadershipMessage) => void;
  deleteLeadershipMessage: (id: string) => void;

  setServiceRequests: (items: ServiceRequest[]) => void;
  addServiceRequest: (item: ServiceRequest) => void;
  updateServiceRequestStatus: (id: string, estado: ServiceRequestStatus) => void;
  deleteServiceRequest: (id: string) => void;
}

export const useUserActivityStore = create<UserActivityState>((set, get) => ({
  prayerRequests: [],
  leadershipMessages: [],
  serviceRequests: [],

  setPrayerRequests: (items) => set({ prayerRequests: items }),
  addPrayerRequest: (item) => set({ prayerRequests: [item, ...get().prayerRequests] }),
  updatePrayerRequestStatus: (id, estado) =>
    set({
      prayerRequests: get().prayerRequests.map(p =>
        p.id === id ? { ...p, estado } : p
      ),
    }),
  deletePrayerRequest: (id) =>
    set({ prayerRequests: get().prayerRequests.filter(p => p.id !== id) }),

  setLeadershipMessages: (items) => set({ leadershipMessages: items }),
  addLeadershipMessage: (item) => set({ leadershipMessages: [item, ...get().leadershipMessages] }),
  deleteLeadershipMessage: (id) =>
    set({ leadershipMessages: get().leadershipMessages.filter(m => m.id !== id) }),

  setServiceRequests: (items) => set({ serviceRequests: items }),
  addServiceRequest: (item) => set({ serviceRequests: [item, ...get().serviceRequests] }),
  updateServiceRequestStatus: (id, estado) =>
    set({
      serviceRequests: get().serviceRequests.map(s =>
        s.id === id ? { ...s, estado } : s
      ),
    }),
  deleteServiceRequest: (id) =>
    set({ serviceRequests: get().serviceRequests.filter(s => s.id !== id) }),
}));
