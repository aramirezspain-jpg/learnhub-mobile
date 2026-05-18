import type { Announcement, Schedule, Contact, CommunityResource, LocalNotification } from '@/types/community';

import announcementsData from '@/data/community/announcements.json';
import schedulesData from '@/data/community/schedules.json';
import contactsData from '@/data/community/contacts.json';
import libraryData from '@/data/community/community_library.json';

const announcements = announcementsData as unknown as Announcement[];
const schedules = schedulesData as unknown as Schedule[];
const contacts = contactsData as unknown as Contact[];
const library = libraryData as unknown as CommunityResource[];

export class CommunityService {
  static getAnnouncements(): Announcement[] {
    return announcements;
  }

  static getActiveAnnouncements(): Announcement[] {
    return announcements.filter(a => a.estado === 'activo');
  }

  static getAnnouncementById(id: string): Announcement | undefined {
    return announcements.find(a => a.id === id);
  }

  static getSchedules(): Schedule[] {
    return schedules.filter(s => s.activo);
  }

  static getSchedulesByDay(diaSemana: number): Schedule[] {
    return this.getSchedules().filter(s => s.dia_semana === diaSemana);
  }

  static getContacts(): Contact[] {
    return contacts;
  }

  static getContactsByType(tipo: Contact['tipo']): Contact[] {
    return contacts.filter(c => c.tipo === tipo);
  }

  static getCommunityLibrary(): CommunityResource[] {
    return library;
  }

  static getLibraryByType(tipo: CommunityResource['tipo']): CommunityResource[] {
    return library.filter(r => r.tipo === tipo);
  }

  // Genera notificaciones locales a partir de anuncios recientes (últimos 7 días)
  static getRecentNotifications(): LocalNotification[] {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 7);

    return announcements
      .filter(a => {
        if (a.estado !== 'activo') return false;
        return new Date(a.created_at) >= cutoff;
      })
      .map(a => ({
        id: `notif_${a.id}`,
        titulo: a.titulo,
        mensaje: a.descripcion,
        tipo: (a.categoria === 'evento' ? 'evento' : 'anuncio') as LocalNotification['tipo'],
        announcement_id: a.id,
        created_at: a.created_at,
      }));
  }
}
