import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Spacing, BorderRadius, Shadows, FontSizes } from '@/constants/theme';
import { Typography } from '@/components/ui/Typography';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { EmptyState } from '@/components/ui/EmptyState';
import { useFavoritesStore } from '@/store/favorites.store';
import { useNotesStore } from '@/store/notes.store';
import { useFavorites } from '@/hooks/useFavorites';
import { useCourses } from '@/hooks/useCourses';
import { useProgressStore } from '@/store/progress.store';
import { ContentService } from '@/services/content.service';
import { type Note, type Favorite } from '@/types';

type LibraryTab = 'favoritos' | 'notas' | 'completados';

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}

// ── Tab switcher ────────────────────────────────────────────────

function TabSwitcher({
  active,
  onChange,
  tabs,
}: {
  active: LibraryTab;
  onChange: (t: LibraryTab) => void;
  tabs: { key: LibraryTab; label: string; count: number }[];
}) {
  const scheme = useColorScheme() ?? 'dark';
  const theme = Colors[scheme];
  return (
    <View style={[tabStyles.container, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      {tabs.map(tab => {
        const isActive = active === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            style={[
              tabStyles.tab,
              isActive && { backgroundColor: Colors.primary },
            ]}
            onPress={() => onChange(tab.key)}
            activeOpacity={0.75}
          >
            <Typography
              variant="label"
              color={isActive ? '#FFF' : theme.textSecondary}
              style={{ fontSize: FontSizes.xs }}
            >
              {tab.label}
            </Typography>
            {tab.count > 0 && (
              <View
                style={[
                  tabStyles.badge,
                  { backgroundColor: isActive ? 'rgba(255,255,255,0.3)' : `${Colors.primary}20` },
                ]}
              >
                <Typography
                  variant="caption"
                  color={isActive ? '#FFF' : Colors.primary}
                  style={{ fontSize: 10, fontWeight: '700' }}
                >
                  {tab.count}
                </Typography>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const tabStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: 4,
    gap: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    gap: 5,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: BorderRadius.full,
  },
});

// ── Favoritos Tab ───────────────────────────────────────────────

function FavoritosTab() {
  const router = useRouter();
  const scheme = useColorScheme() ?? 'dark';
  const theme = Colors[scheme];
  const { toggleFavorite } = useFavorites();
  const allFavorites = useFavoritesStore(s => s.favorites);
  const courseFavs = allFavorites.filter((f: Favorite) => f.content_type === 'course');
  const { courses } = useCourses();
  const getCourseProgress = useProgressStore(s => s.getCourseProgress);
  const getCompletedCount = useProgressStore(s => s.getCompletedCountForCourse);

  if (courseFavs.length === 0) {
    return (
      <EmptyState
        icon="heart-outline"
        title="Sin favoritos"
        subtitle="Marca cursos como favoritos para encontrarlos aquí rápidamente."
        color={Colors.error}
      />
    );
  }

  return (
    <View style={listStyles.container}>
      {courseFavs.map((fav: Favorite) => {
        const course = courses.find(c => c.id === fav.content_id);
        if (!course) return null;
        const total = ContentService.getTotalLessons(course.id);
        const prog = getCourseProgress(course.id, total);
        const completed = getCompletedCount(course.id);
        return (
          <TouchableOpacity
            key={fav.id}
            style={[listStyles.card, { backgroundColor: theme.card }, Shadows.sm]}
            onPress={() => router.push({ pathname: '/course/[id]', params: { id: course.id } })}
            activeOpacity={0.85}
          >
            <View style={[listStyles.accent, { backgroundColor: course.banner_color }]}>
              <Ionicons name="book-outline" size={22} color="rgba(255,255,255,0.9)" />
            </View>
            <View style={listStyles.cardContent}>
              <Typography variant="label" style={{ color: theme.text }} numberOfLines={1}>
                {course.titulo}
              </Typography>
              <ProgressBar progress={prog.progress_percent} color={course.banner_color} height={3} />
              <Typography variant="caption" secondary>
                {completed}/{total} lecciones
              </Typography>
            </View>
            <TouchableOpacity
              style={listStyles.heartBtn}
              onPress={() => toggleFavorite(course.id, 'course', course.id)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="heart" size={18} color={Colors.error} />
            </TouchableOpacity>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ── Notas Tab ───────────────────────────────────────────────────

function NotasTab() {
  const router = useRouter();
  const scheme = useColorScheme() ?? 'dark';
  const theme = Colors[scheme];
  const notes = useNotesStore(s => s.notes);

  if (notes.length === 0) {
    return (
      <EmptyState
        icon="document-text-outline"
        title="Sin notas"
        subtitle="Crea notas en cualquier lección para tener tus apuntes organizados aquí."
        color={Colors.primary}
      />
    );
  }

  return (
    <View style={listStyles.container}>
      {notes.map((note: Note) => {
        const found = ContentService.getLessonById(note.lesson_id);
        return (
          <TouchableOpacity
            key={note.id}
            style={[listStyles.noteCard, { backgroundColor: theme.card }, Shadows.sm]}
            onPress={() =>
              router.push({ pathname: '/notes/[id]' as never, params: { id: note.lesson_id, courseId: note.course_id } })
            }
            activeOpacity={0.85}
          >
            <View style={[listStyles.noteAccent, { backgroundColor: Colors.primary }]} />
            <View style={listStyles.noteContent}>
              {found && (
                <Typography variant="overline" color={Colors.primary} numberOfLines={1}>
                  {found.lesson.titulo}
                </Typography>
              )}
              <Typography
                variant="body"
                style={{ color: theme.text, lineHeight: 20 }}
                numberOfLines={3}
              >
                {note.content}
              </Typography>
              <Typography variant="caption" secondary style={{ marginTop: 4 }}>
                {formatDate(note.updated_at)}
              </Typography>
            </View>
            <Ionicons name="chevron-forward" size={16} color={theme.textMuted} style={{ alignSelf: 'center', marginRight: 12 }} />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ── Completados Tab ─────────────────────────────────────────────

function CompletadosTab() {
  const router = useRouter();
  const scheme = useColorScheme() ?? 'dark';
  const theme = Colors[scheme];
  const { courses } = useCourses();
  const getCompletedCount = useProgressStore(s => s.getCompletedCountForCourse);
  const getCourseProgress = useProgressStore(s => s.getCourseProgress);

  const completedCourses = courses.filter(c => getCompletedCount(c.id) > 0);

  if (completedCourses.length === 0) {
    return (
      <EmptyState
        icon="checkmark-circle-outline"
        title="Aún sin avance"
        subtitle="Completa lecciones de cualquier curso para ver tu progreso aquí."
        color={Colors.success}
      />
    );
  }

  const totalLessons = courses.reduce((s, c) => s + c.total_lecciones, 0);
  const totalCompleted = courses.reduce((s, c) => s + getCompletedCount(c.id), 0);

  return (
    <View style={listStyles.container}>
      {/* Resumen global */}
      <View style={[listStyles.summaryCard, { backgroundColor: Colors.primary }, Shadows.primary]}>
        <View style={listStyles.summaryRow}>
          <View>
            <Typography variant="h2" style={{ color: '#FFF' }}>{totalCompleted}</Typography>
            <Typography variant="body" style={{ color: 'rgba(255,255,255,0.8)' }}>lecciones completadas</Typography>
          </View>
          <View style={listStyles.summaryIcon}>
            <Ionicons name="trophy" size={28} color="rgba(255,255,255,0.9)" />
          </View>
        </View>
        <ProgressBar
          progress={totalLessons > 0 ? Math.round((totalCompleted / totalLessons) * 100) : 0}
          color="rgba(255,255,255,0.95)"
          trackColor="rgba(255,255,255,0.25)"
          height={6}
        />
        <Typography variant="caption" style={{ color: 'rgba(255,255,255,0.75)', marginTop: 4 }}>
          {totalCompleted}/{totalLessons} del total disponible
        </Typography>
      </View>

      {/* Por curso */}
      {completedCourses.map(course => {
        const total = ContentService.getTotalLessons(course.id);
        const prog = getCourseProgress(course.id, total);
        const completed = getCompletedCount(course.id);
        return (
          <TouchableOpacity
            key={course.id}
            style={[listStyles.card, { backgroundColor: theme.card }, Shadows.sm]}
            onPress={() => router.push({ pathname: '/course/[id]', params: { id: course.id } })}
            activeOpacity={0.85}
          >
            <View style={[listStyles.accent, { backgroundColor: course.banner_color }]}>
              <Ionicons name="book-outline" size={22} color="rgba(255,255,255,0.9)" />
            </View>
            <View style={listStyles.cardContent}>
              <Typography variant="label" style={{ color: theme.text }} numberOfLines={1}>
                {course.titulo}
              </Typography>
              <ProgressBar progress={prog.progress_percent} color={course.banner_color} height={3} />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Typography variant="caption" secondary>
                  {completed}/{total} lecciones
                </Typography>
                <Typography variant="caption" color={course.banner_color} style={{ fontWeight: '700' }}>
                  {prog.progress_percent}%
                </Typography>
              </View>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const listStyles = StyleSheet.create({
  container: { paddingHorizontal: Spacing.lg, gap: 10 },
  card: {
    flexDirection: 'row',
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    alignItems: 'center',
  },
  accent: {
    width: 56,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
  },
  cardContent: { flex: 1, paddingVertical: 12, paddingHorizontal: 12, gap: 6 },
  heartBtn: { padding: 12 },
  noteCard: {
    flexDirection: 'row',
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  noteAccent: { width: 4 },
  noteContent: { flex: 1, padding: Spacing.md, gap: 4 },
  summaryCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    gap: 10,
    marginBottom: 4,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

// ── Pantalla principal ──────────────────────────────────────────

export default function LibraryScreen() {
  const scheme = useColorScheme() ?? 'dark';
  const theme = Colors[scheme];
  const [activeTab, setActiveTab] = useState<LibraryTab>('favoritos');

  const allFavs = useFavoritesStore(s => s.favorites);
  const favCount = allFavs.filter(f => f.content_type === 'course').length;
  const noteCount = useNotesStore(s => s.notes.length);
  const { courses } = useCourses();
  const getCompletedCount = useProgressStore(s => s.getCompletedCountForCourse);
  const completedCount = courses.filter(c => getCompletedCount(c.id) > 0).length;

  const tabs: { key: LibraryTab; label: string; count: number }[] = [
    { key: 'favoritos', label: 'Favoritos', count: favCount },
    { key: 'notas', label: 'Notas', count: noteCount },
    { key: 'completados', label: 'Completados', count: completedCount },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Typography variant="overline" secondary>Tu espacio</Typography>
          <Typography variant="h1" style={{ color: theme.text }}>Biblioteca</Typography>
        </View>
        <View style={[styles.headerIcon, { backgroundColor: `${Colors.primary}15` }]}>
          <Ionicons name="library-outline" size={22} color={Colors.primary} />
        </View>
      </View>

      {/* Tab switcher */}
      <TabSwitcher active={activeTab} onChange={setActiveTab} tabs={tabs} />

      {/* Contenido */}
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {activeTab === 'favoritos' && <FavoritosTab />}
        {activeTab === 'notas' && <NotasTab />}
        {activeTab === 'completados' && <CompletadosTab />}

        {/* Info almacenamiento */}
        <View style={[styles.storageInfo, { backgroundColor: theme.card }]}>
          <View style={styles.storageRow}>
            <Ionicons name="shield-checkmark-outline" size={16} color={theme.textMuted} />
            <Typography variant="caption" muted>
              Offline First · Datos en tu dispositivo · 100% privado
            </Typography>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingBottom: 40,
    gap: 0,
  },
  storageInfo: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.xl,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  storageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
