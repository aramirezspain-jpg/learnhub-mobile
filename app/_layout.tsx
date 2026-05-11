import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SQLiteProvider } from 'expo-sqlite';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { migrateDatabase } from '@/database';
import { ContentService } from '@/services/content.service';
import { useCoursesStore } from '@/store/courses.store';
import { useProgressStore } from '@/store/progress.store';
import { useUIStore } from '@/store/ui.store';
import { ProgressRepository } from '@/database/repositories/progress';
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
  const scheme = useColorScheme() ?? 'dark';

  useEffect(() => {
    // Cargar contenido JSON (sincrónico)
    setCourses(ContentService.getAllCourses());
    setLevels(ContentService.getLevels());
    setInitialized();
    setContentReady();

    // Cargar progreso desde SQLite (asíncrono)
    const loadProgress = async () => {
      const repo = new ProgressRepository(db);
      const [progress, lastViewed] = await Promise.all([
        repo.getAllProgress(),
        repo.getLastViewed(),
      ]);
      setAllProgress(progress);
      if (lastViewed) setLastViewed(lastViewed);
      setDbReady();
    };

    loadProgress().catch(console.error);
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

export default function RootLayout() {
  const scheme = useColorScheme() ?? 'dark';

  return (
    <SQLiteProvider databaseName="learnhub.db" onInit={migrateDatabase}>
      <AppBootstrap>
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
        </Stack>
      </AppBootstrap>
    </SQLiteProvider>
  );
}
