import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import type { Schedule, Announcement } from '@/types/community';

// ── Foreground behavior ───────────────────────────────────────────────────────

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// ── Channel IDs ───────────────────────────────────────────────────────────────

const CHANNEL_ANNOUNCEMENTS = 'iglesia-anuncios';
const CHANNEL_SCHEDULES = 'iglesia-horarios';
const CHANNEL_GENERAL = 'iglesia-general';

// ── Helpers ───────────────────────────────────────────────────────────────────

function parseHora(hora: string): { hour: number; minute: number } | null {
  const [h, m] = hora.split(':').map(Number);
  if (isNaN(h) || isNaN(m)) return null;
  return { hour: h, minute: m };
}

function subtractMinutes(
  hour: number,
  minute: number,
  delta: number
): { hour: number; minute: number } {
  const total = Math.max(0, hour * 60 + minute - delta);
  return { hour: Math.floor(total / 60) % 24, minute: total % 60 };
}

// ── NotificationService ───────────────────────────────────────────────────────

export class NotificationService {
  /**
   * Call once on app start (inside RootLayout, outside SQLiteProvider boundary).
   * Sets up Android channels required for notifications on Android 8+.
   */
  static async initialize(): Promise<void> {
    if (Platform.OS !== 'android') return;
    try {
      await Promise.all([
        Notifications.setNotificationChannelAsync(CHANNEL_ANNOUNCEMENTS, {
          name: 'Anuncios de la iglesia',
          description: 'Nuevos anuncios y novedades',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#6366F1',
        }),
        Notifications.setNotificationChannelAsync(CHANNEL_SCHEDULES, {
          name: 'Recordatorios de horarios',
          description: 'Recordatorios 30 minutos antes del servicio',
          importance: Notifications.AndroidImportance.DEFAULT,
        }),
        Notifications.setNotificationChannelAsync(CHANNEL_GENERAL, {
          name: 'General',
          description: 'Notificaciones generales de la app',
          importance: Notifications.AndroidImportance.DEFAULT,
        }),
      ]);
    } catch {
      // Non-fatal: channels are optional
    }
  }

  /** Returns true if permissions are granted (or already were). */
  static async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'web') return false;
    try {
      const { status: existing } = await Notifications.getPermissionsAsync();
      if (existing === 'granted') return true;
      const { status } = await Notifications.requestPermissionsAsync();
      return status === 'granted';
    } catch {
      return false;
    }
  }

  /** Check current permission status without prompting. */
  static async hasPermissions(): Promise<boolean> {
    if (Platform.OS === 'web') return false;
    try {
      const { status } = await Notifications.getPermissionsAsync();
      return status === 'granted';
    } catch {
      return false;
    }
  }

  /**
   * Schedule an immediate local notification for a new announcement.
   * Returns the Expo notification identifier, or null on failure.
   */
  static async scheduleAnnouncement(ann: Announcement): Promise<string | null> {
    try {
      return await Notifications.scheduleNotificationAsync({
        content: {
          title: `📢 ${ann.titulo}`,
          body: ann.descripcion.slice(0, 120),
          data: { tipo: 'anuncio', referencia_id: ann.id, ruta: '/announcements' },
          sound: true,
          ...(Platform.OS === 'android' && { channelId: CHANNEL_ANNOUNCEMENTS }),
        },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 3, repeats: false },
      });
    } catch {
      return null;
    }
  }

  /**
   * Schedule a weekly recurring reminder 30 min before a schedule.
   * Returns the Expo notification identifier, or null on failure.
   */
  static async scheduleReminder(sch: Schedule): Promise<string | null> {
    if (!sch.recordatorio || sch.dia_semana === undefined) return null;
    const parsed = parseHora(sch.hora);
    if (!parsed) return null;

    const { hour, minute } = subtractMinutes(parsed.hour, parsed.minute, 30);

    try {
      return await Notifications.scheduleNotificationAsync({
        content: {
          title: `⛪ ${sch.titulo} en 30 minutos`,
          body: `${sch.hora} · ${sch.ubicacion}`,
          data: { tipo: 'horario', referencia_id: sch.id, ruta: '/schedules' },
          sound: true,
          ...(Platform.OS === 'android' && { channelId: CHANNEL_SCHEDULES }),
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
          weekday: ((sch.dia_semana + 1) as 1 | 2 | 3 | 4 | 5 | 6 | 7),
          hour,
          minute,
        },
      });
    } catch {
      return null;
    }
  }

  /** Cancel a specific scheduled notification by its Expo ID. */
  static async cancelScheduled(expoId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(expoId);
    } catch {}
  }

  /** Cancel all scheduled notifications (called before re-scheduling on boot). */
  static async cancelAllScheduled(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch {}
  }

  /** Set the app badge count. Pass 0 to clear. */
  static async setBadge(count: number): Promise<void> {
    try {
      await Notifications.setBadgeCountAsync(Math.max(0, count));
    } catch {}
  }

  /** Add a listener for foreground notifications. Returns a removable subscription. */
  static onNotificationReceived(
    cb: (notification: Notifications.Notification) => void
  ): Notifications.EventSubscription {
    return Notifications.addNotificationReceivedListener(cb);
  }

  /** Add a listener for when the user taps a notification. Returns a removable subscription. */
  static onNotificationResponse(
    cb: (response: Notifications.NotificationResponse) => void
  ): Notifications.EventSubscription {
    return Notifications.addNotificationResponseReceivedListener(cb);
  }
}
