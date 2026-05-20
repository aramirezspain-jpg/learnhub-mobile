import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SQLiteProvider } from 'expo-sqlite';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { migrateDatabase } from '@/database';
import { ContentService } from '@/services/content.service';
import { useCoursesStore } from '@/store/courses.store';
import { useProgressStore } from '@/store/progress.store';
import { useUIStore } from '@/store/ui.store';
import { useFavoritesStore } from '@/store/favorites.store';
import { useNotesStore } from '@/store/notes.store';
import { ProgressRepository } from '@/database/repositories/progress';
import { FavoritesRepository } from '@/database/repositories/favorites';
import { NotesRepository } from '@/database/repositories/notes';
import { CommunityNotificationsRepository } from '@/database/repositories/communityNotifications';
import { PrayerRequestsRepository } from '@/database/repositories/prayerRequests';
import { LeadershipMessagesRepository } from '@/database/repositories/leadershipMessages';
import { ServiceRequestsRepository } from '@/database/repositories/serviceRequests';
import { AppNotificationsRepository } from '@/database/repositories/appNotifications';
import { CommunityService } from '@/services/community.service';
import { NotificationService } from '@/services/notification.service';
import { useCommunityStore } from '@/store/community.store';
import { useUserActivityStore } from '@/store/userActivity.store';
import { useNotificationStore } from '@/store/notification.store';
import { Colors } from '@/constants/theme';
import { useSQLiteContext } from 'expo-sqlite';

function AppBootstrap({ children }: { children: React.ReactNode }) {
  const db = useSQLiteContext();
  const setCourses = useCoursesStore(s => s.setCourses);
  const setLevels = useCoursesStore(s => s.setLevels);
  const setInitialized = useCoursesStore(s => s.setInitialized);
  const setAllProgress = useProgressStore(s => s.setAllProgress);
  const setLastViewed = useProgressStore(s => s.setLastViewed);
  const setDbReady = useUIStore(s => s.setDbReady);
  const setContentReady = useUIStore(s => s.setContentReady);
  const dbReady = useUIStore(s => s.dbReady);
  const setFavorites = useFavoritesStore(s => s.setFavorites);
  const setAllNotes = useNotesStore(s => s.setAllNotes);
  const setCommunityAnnouncements = useCommunityStore(s => s.setAnnouncements);
  const setCommunitySchedules = useCommunityStore(s => s.setSchedules);
  const setCommunityContacts = useCommunityStore(s => s.setContacts);
  const setCommunityLibrary = useCommunityStore(s => s.setLibrary);
  const setReadAnnouncementIds = useCommunityStore(s => s.setReadAnnouncementIds);
  const setPrayerRequests = useUserActivityStore(s => s.setPrayerRequests);
  const setLeadershipMessages = useUserActivityStore(s => s.setLeadershipMessages);
  const setServiceRequests = useUserActivityStore(s => s.setServiceRequests);
  const setNotifications = useNotificationStore(s => s.setNotifications);
  const addNotification = useNotificationStore(s => s.addNotification);
  const setPermissionsGranted = useNotificationStore(s => s.setPermissionsGranted);
  const scheme = useColorScheme() ?? 'dark';
  const router = useRouter();

  useEffect(() => {
    // Cargar contenido JSON (sincrónico)
    setCourses(ContentService.getAllCourses());
    setLevels(ContentService.getLevels());
    setInitialized();
    setContentReady();

    // Cargar contenido de comunidad (sincrónico)
    setCommunityAnnouncements(CommunityService.getAnnouncements());
    setCommunitySchedules(CommunityService.getSchedules());
    setCommunityContacts(CommunityService.getContacts());
    setCommunityLibrary(CommunityService.getCommunityLibrary());

    // Cargar datos persistentes desde SQLite (asíncrono, en paralelo)
    const loadProgress = async () => {
      const progressRepo = new ProgressRepository(db);
      const favRepo = new FavoritesRepository(db);
      const notesRepo = new NotesRepository(db);
      const communityNotifRepo = new CommunityNotificationsRepository(db);
      const prayerRepo = new PrayerRequestsRepository(db);
      const leadershipRepo = new LeadershipMessagesRepository(db);
      const serviceRepo = new ServiceRequestsRepository(db);
      const notifRepo = new AppNotificationsRepository(db);
      const [progress, lastViewed, favorites, notes, readIds, prayers, messages, services, notifs] = await Promise.all([
        progressRepo.getAllProgress(),
        progressRepo.getLastViewed(),
        favRepo.getAllFavorites(),
        notesRepo.getAllNotes(),
        communityNotifRepo.getReadIds(),
        prayerRepo.getAll(),
        leadershipRepo.getAll(),
        serviceRepo.getAll(),
        notifRepo.getAll(),
      ]);
      setAllProgress(progress);
      if (lastViewed) setLastViewed(lastViewed);
      setFavorites(favorites);
      setAllNotes(notes);
      setReadAnnouncementIds(readIds);
      setPrayerRequests(prayers);
      setLeadershipMessages(messages);
      setServiceRequests(services);
      setNotifications(notifs);

      // Check notification permissions and sync new announcement notifications
      await NotificationService.initialize();
      const granted = await NotificationService.hasPermissions();
      setPermissionsGranted(granted);

      const announcements = CommunityService.getAnnouncements();
      const existingRefIds = await notifRepo.getExistingReferenceIds('anuncio');
      const newAnns = announcements.filter(
        a => a.estado !== 'expirado' && !existingRefIds.includes(a.id)
      );
      for (const ann of newAnns) {
        const created = await notifRepo.create({
          titulo: ann.titulo,
          cuerpo: ann.descripcion.slice(0, 120),
          tipo: 'anuncio',
          referencia_id: ann.id,
          ruta: '/announcements',
        });
        addNotification(created);
      }
      if (granted) {
        await NotificationService.setBadge(newAnns.length);
      }

      setDbReady();
    };

    loadProgress().catch((e) => {
      console.error('[AppBootstrap] DB load failed:', e);
      setDbReady();
    });
  }, []);

  if (!dbReady) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors[scheme].background, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={Colors.primary} size="large" />
      </View>
    );
  }

  return <>{children}</>;
}

function NotificationListeners() {
  const addNotification = useNotificationStore(s => s.addNotification);
  const router = useRouter();
  const db = useSQLiteContext();

  useEffect(() => {
    const receivedSub = NotificationService.onNotificationReceived(async (notification) => {
      const data = notification.request.content.data as Record<string, string> | undefined;
      const repo = new AppNotificationsRepository(db);
      const created = await repo.create({
        titulo: notification.request.content.title ?? 'Notificación',
        cuerpo: notification.request.content.body ?? '',
        tipo: (data?.tipo as any) ?? 'sistema',
        referencia_id: data?.referencia_id,
        ruta: data?.ruta,
      });
      addNotification(created);
    });

    const responseSub = NotificationService.onNotificationResponse((response) => {
      const data = response.notification.request.content.data as Record<string, string> | undefined;
      if (data?.ruta) router.push(data.ruta as never);
    });

    return () => {
      receivedSub.remove();
      responseSub.remove();
    };
  }, []);

  return null;
}

export default function RootLayout() {
  const scheme = useColorScheme() ?? 'dark';

  return (
    <SQLiteProvider databaseName="learnhub.db" onInit={migrateDatabase}>
      <AppBootstrap>
        <NotificationListeners />
        <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="course/[id]"
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="lesson/[id]"
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="quiz/[id]"
            options={{ animation: 'slide_from_bottom' }}
          />
          <Stack.Screen
            name="profile"
            options={{ animation: 'slide_from_bottom' }}
          />
          <Stack.Screen
            name="notes/[id]"
            options={{ animation: 'slide_from_bottom' }}
          />
          <Stack.Screen
            name="announcements"
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="schedules"
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="contacts"
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="community-library"
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="notifications"
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="prayer-requests"
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="contact-leadership"
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="service-request"
            options={{ animation: 'slide_from_right' }}
          />
        </Stack>
      </AppBootstrap>
    </SQLiteProvider>
  );
}
