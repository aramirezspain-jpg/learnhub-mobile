import { create } from 'zustand';
import type { AppNotification } from '@/types/notifications';

interface NotificationState {
  notifications: AppNotification[];
  unreadCount: number;           // Cached primitive — safe for React 19 + Zustand 5
  permissionsGranted: boolean;

  setNotifications: (items: AppNotification[]) => void;
  addNotification: (item: AppNotification) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  deleteNotification: (id: string) => void;
  setPermissionsGranted: (granted: boolean) => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  permissionsGranted: false,

  setNotifications: (items) =>
    set({ notifications: items, unreadCount: items.filter(n => !n.leida).length }),

  addNotification: (item) => {
    const next = [item, ...get().notifications];
    set({ notifications: next, unreadCount: next.filter(n => !n.leida).length });
  },

  markRead: (id) => {
    const next = get().notifications.map(n => n.id === id ? { ...n, leida: true } : n);
    set({ notifications: next, unreadCount: next.filter(n => !n.leida).length });
  },

  markAllRead: () => {
    const next = get().notifications.map(n => ({ ...n, leida: true }));
    set({ notifications: next, unreadCount: 0 });
  },

  deleteNotification: (id) => {
    const next = get().notifications.filter(n => n.id !== id);
    set({ notifications: next, unreadCount: next.filter(n => !n.leida).length });
  },

  setPermissionsGranted: (granted) => set({ permissionsGranted: granted }),
}));
