import { useCallback } from 'react';
import { useDatabase } from './useDatabase';
import { AppNotificationsRepository } from '@/database/repositories/appNotifications';
import { NotificationService } from '@/services/notification.service';
import { useNotificationStore } from '@/store/notification.store';
import type { Announcement, Schedule } from '@/types/community';
import type { NotificationType } from '@/types/notifications';

export function useNotifications() {
  const db = useDatabase();
  const store = useNotificationStore();

  /** Request OS permissions and update store. */
  const requestPermissions = useCallback(async (): Promise<boolean> => {
    const granted = await NotificationService.requestPermissions();
    store.setPermissionsGranted(granted);
    return granted;
  }, [store]);

  /** Mark a single notification as read (store + DB + badge). */
  const markRead = useCallback(async (id: string): Promise<void> => {
    const repo = new AppNotificationsRepository(db);
    await repo.markRead(id);
    store.markRead(id);
    const newCount = Math.max(0, store.unreadCount - 1);
    await NotificationService.setBadge(newCount);
  }, [db, store]);

  /** Mark all notifications as read. */
  const markAllRead = useCallback(async (): Promise<void> => {
    const repo = new AppNotificationsRepository(db);
    await repo.markAllRead();
    store.markAllRead();
    await NotificationService.setBadge(0);
  }, [db, store]);

  /** Remove a notification from history. */
  const remove = useCallback(async (id: string): Promise<void> => {
    const repo = new AppNotificationsRepository(db);
    await repo.delete(id);
    store.deleteNotification(id);
    await NotificationService.setBadge(Math.max(0, store.unreadCount - 1));
  }, [db, store]);

  /**
   * Called on boot: creates notification records for any active announcements
   * that haven't been recorded yet. Also triggers a local push if permitted.
   */
  const syncAnnouncements = useCallback(async (
    announcements: Announcement[],
    permissionsGranted: boolean
  ): Promise<void> => {
    const repo = new AppNotificationsRepository(db);
    const existing = await repo.getExistingReferenceIds('anuncio');
    const newAnns = announcements.filter(
      a => a.estado !== 'expirado' && !existing.includes(a.id)
    );
    if (newAnns.length === 0) return;

    const created = await Promise.all(
      newAnns.map(ann =>
        repo.create({
          titulo: ann.titulo,
          cuerpo: ann.descripcion.slice(0, 120),
          tipo: 'anuncio' as NotificationType,
          referencia_id: ann.id,
          ruta: '/announcements',
        })
      )
    );
    created.forEach(n => store.addNotification(n));

    // Push the first new announcement if permissions granted
    if (permissionsGranted && newAnns.length > 0) {
      await NotificationService.scheduleAnnouncement(newAnns[0]);
    }
    await NotificationService.setBadge(store.unreadCount);
  }, [db, store]);

  /**
   * (Re)schedule weekly reminders for all schedules with recordatorio=true.
   * Cancels all existing scheduled notifications first.
   */
  const syncScheduleReminders = useCallback(async (
    schedules: Schedule[],
    permissionsGranted: boolean
  ): Promise<void> => {
    if (!permissionsGranted) return;
    await NotificationService.cancelAllScheduled();
    const remindable = schedules.filter(s => s.activo && s.recordatorio && s.dia_semana !== undefined);
    await Promise.all(remindable.map(s => NotificationService.scheduleReminder(s)));
  }, []);

  return {
    notifications: store.notifications,
    unreadCount: store.unreadCount,
    permissionsGranted: store.permissionsGranted,
    requestPermissions,
    markRead,
    markAllRead,
    remove,
    syncAnnouncements,
    syncScheduleReminders,
  };
}
