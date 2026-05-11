import React, { useMemo } from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Spacing, BorderRadius, Shadows, FontSizes } from '@/constants/theme';
import { Typography } from '@/components/ui/Typography';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useProgressStore } from '@/store/progress.store';
import { useFavoritesStore } from '@/store/favorites.store';
import { useNotesStore } from '@/store/notes.store';
import { useCourses } from '@/hooks/useCourses';
import { ContentService } from '@/services/content.service';
import { type LessonProgress } from '@/types';

function computeStreak(lessonProgress: Record<string, LessonProgress>): number {
  const entries = Object.values(lessonProgress).filter(
    p => p.completed === 1 && p.completed_at
  );
  if (entries.length === 0) return 0;

  const toDay = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const uniqueDays = [...new Set(entries.map(p => toDay(p.completed_at!)))].sort(
    (a, b) => b.localeCompare(a)
  );

  const today = toDay(new Date().toISOString());
  const yesterday = toDay(new Date(Date.now() - 86400000).toISOString());

  if (uniqueDays[0] !== today && uniqueDays[0] !== yesterday) return 0;

  let streak = 0;
  const cursor = new Date();
  for (const day of uniqueDays) {
    const expected = toDay(cursor.toISOString());
    if (day === expected) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

function StatCard({
  icon,
  value,
  label,
  color,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  value: string | number;
  label: string;
  color: string;
}) {
  const scheme = useColorScheme() ?? 'dark';
  const theme = Colors[scheme];
  return (
    <View style={[styles.statCard, { backgroundColor: theme.card }, Shadows.sm]}>
      <View style={[styles.statIcon, { backgroundColor: `${color}18` }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <Typography variant="h2" color={color} style={{ marginTop: 4 }}>
        {value}
      </Typography>
      <Typography variant="caption" secondary style={{ textAlign: 'center' }}>
        {label}
      </Typography>
    </View>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const scheme = useColorScheme() ?? 'dark';
  const theme = Colors[scheme];
  const { courses } = useCourses();
  const lessonProgress = useProgressStore(s => s.lessonProgress);
  const getCompletedCount = useProgressStore(s => s.getCompletedCountForCourse);
  const getCourseProgress = useProgressStore(s => s.getCourseProgress);
  const favCount = useFavoritesStore(s => s.favorites.length);
  const noteCount = useNotesStore(s => s.notes.length);

  const totalLessons = courses.reduce((sum, c) => sum + c.total_lecciones, 0);
  const totalCompleted = courses.reduce((sum, c) => sum + getCompletedCount(c.id), 0);
  const globalPercent = totalLessons > 0 ? Math.round((totalCompleted / totalLessons) * 100) : 0;
  const streak = useMemo(() => computeStreak(lessonProgress), [lessonProgress]);
  const coursesStarted = courses.filter(c => getCompletedCount(c.id) > 0).length;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
          <Ionicons name="close" size={22} color={theme.text} />
        </TouchableOpacity>
        <Typography variant="h4" style={{ color: theme.text }}>Perfil</Typography>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Avatar + nombre */}
        <View style={styles.avatarSection}>
          <View style={[styles.avatar, { backgroundColor: `${Colors.primary}22` }]}>
            <Ionicons name="person" size={40} color={Colors.primary} />
          </View>
          <Typography variant="h2" style={{ color: theme.text, marginTop: 12 }}>
            Estudiante
          </Typography>
          <Typography variant="body" secondary>LearnHub · Instituto Bíblico</Typography>

          {/* Insignia de progreso */}
          <View style={[styles.progressBadge, { backgroundColor: `${Colors.primary}15` }]}>
            <Ionicons name="school-outline" size={14} color={Colors.primary} />
            <Typography variant="label" color={Colors.primary}>
              {globalPercent < 25
                ? 'Principiante'
                : globalPercent < 60
                ? 'Estudiante'
                : globalPercent < 90
                ? 'Avanzado'
                : 'Maestro'}
            </Typography>
          </View>
        </View>

        {/* Estadísticas */}
        <View style={styles.section}>
          <Typography variant="h3" style={[styles.sectionTitle, { color: theme.text }]}>
            Mis estadísticas
          </Typography>
          <View style={styles.statsGrid}>
            <StatCard
              icon="checkmark-circle"
              value={totalCompleted}
              label="Completadas"
              color={Colors.success}
            />
            <StatCard
              icon="flame"
              value={streak}
              label="Días seguidos"
              color={Colors.accent}
            />
            <StatCard
              icon="school"
              value={coursesStarted}
              label="En progreso"
              color={Colors.primary}
            />
            <StatCard
              icon="heart"
              value={favCount}
              label="Favoritos"
              color={Colors.error}
            />
          </View>
          <View style={styles.statsFull}>
            <StatCard
              icon="document-text"
              value={noteCount}
              label="Notas creadas"
              color={Colors.secondary}
            />
          </View>
        </View>

        {/* Progreso global */}
        <View style={styles.section}>
          <Typography variant="h3" style={[styles.sectionTitle, { color: theme.text }]}>
            Progreso general
          </Typography>
          <View style={[styles.globalCard, { backgroundColor: theme.card }, Shadows.sm]}>
            <View style={styles.globalRow}>
              <Typography variant="h2" color={Colors.primary}>{globalPercent}%</Typography>
              <Typography variant="body" secondary>
                {totalCompleted}/{totalLessons} lecciones
              </Typography>
            </View>
            <ProgressBar progress={globalPercent} height={10} />
          </View>
        </View>

        {/* Progreso por curso */}
        <View style={styles.section}>
          <Typography variant="h3" style={[styles.sectionTitle, { color: theme.text }]}>
            Por curso
          </Typography>
          {courses.map(course => {
            const total = ContentService.getTotalLessons(course.id);
            const prog = getCourseProgress(course.id, total);
            const completed = getCompletedCount(course.id);
            return (
              <View
                key={course.id}
                style={[styles.courseRow, { backgroundColor: theme.card }, Shadows.sm]}
              >
                <View style={[styles.courseAccent, { backgroundColor: course.banner_color }]} />
                <View style={styles.courseInfo}>
                  <Typography variant="label" style={{ color: theme.text }} numberOfLines={1}>
                    {course.titulo}
                  </Typography>
                  <ProgressBar progress={prog.progress_percent} color={course.banner_color} height={5} />
                  <View style={styles.courseStats}>
                    <Typography variant="caption" secondary>
                      {completed}/{total} lecciones
                    </Typography>
                    <Typography variant="label" color={course.banner_color}>
                      {prog.progress_percent}%
                    </Typography>
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        {/* Info de app */}
        <View style={[styles.appInfo, { backgroundColor: theme.card }]}>
          <View style={styles.appInfoRow}>
            <Ionicons name="information-circle-outline" size={18} color={theme.textMuted} />
            <Typography variant="caption" muted>LearnHub v1.0 · Fase 2</Typography>
          </View>
          <View style={styles.appInfoRow}>
            <Ionicons name="shield-checkmark-outline" size={18} color={theme.textMuted} />
            <Typography variant="caption" muted>Datos almacenados localmente · 100% privado</Typography>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: { paddingBottom: 40 },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    gap: 6,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    marginTop: 6,
  },
  section: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  sectionTitle: { marginBottom: 12 },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statsFull: {
    marginTop: 10,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    gap: 4,
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  globalCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    gap: 12,
  },
  globalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  courseRow: {
    flexDirection: 'row',
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  courseAccent: { width: 6 },
  courseInfo: { flex: 1, padding: Spacing.md, gap: 8 },
  courseStats: { flexDirection: 'row', justifyContent: 'space-between' },
  appInfo: {
    marginHorizontal: Spacing.lg,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: 10,
  },
  appInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
