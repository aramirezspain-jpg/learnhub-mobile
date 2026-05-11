import React from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Spacing, BorderRadius, Shadows, FontSizes } from '@/constants/theme';
import { Typography } from '@/components/ui/Typography';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Badge } from '@/components/ui/Badge';
import { useCourses } from '@/hooks/useCourses';
import { useProgressStore } from '@/store/progress.store';
import { ContentService } from '@/services/content.service';

function StatCard({ icon, value, label, color }: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  value: string | number;
  label: string;
  color: string;
}) {
  const scheme = useColorScheme() ?? 'dark';
  const theme = Colors[scheme];
  return (
    <View style={[styles.statCard, { backgroundColor: theme.card, flex: 1 }, Shadows.sm]}>
      <View style={[styles.statIcon, { backgroundColor: `${color}20` }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Typography variant="h2" color={color}>{value}</Typography>
      <Typography variant="caption" secondary>{label}</Typography>
    </View>
  );
}

function LevelCard({ level, courseCount, onPress }: {
  level: { id: string; nombre: string; descripcion: string; color: string; icono: string; orden: number };
  courseCount: number;
  onPress: () => void;
}) {
  const scheme = useColorScheme() ?? 'dark';
  const theme = Colors[scheme];
  return (
    <TouchableOpacity
      style={[styles.levelCard, { backgroundColor: theme.card }, Shadows.sm]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[styles.levelTop, { backgroundColor: level.color }]}>
        <Ionicons name={level.icono as React.ComponentProps<typeof Ionicons>['name']} size={28} color="#FFF" />
        <Badge label={`Nivel ${level.orden}`} color="#FFF" bg="rgba(255,255,255,0.25)" size="sm" />
      </View>
      <View style={styles.levelBottom}>
        <Typography variant="h4" style={{ color: theme.text }} numberOfLines={1}>{level.nombre}</Typography>
        <Typography variant="caption" secondary numberOfLines={2}>{level.descripcion}</Typography>
        <Typography variant="caption" color={level.color} style={{ marginTop: 4, fontWeight: '600' }}>
          {courseCount} {courseCount === 1 ? 'curso' : 'cursos'}
        </Typography>
      </View>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const scheme = useColorScheme() ?? 'dark';
  const theme = Colors[scheme];
  const { levels, courses, getAllCoursesWithProgress } = useCourses();
  const lastViewed = useProgressStore(s => s.lastViewed);
  const getCompletedCount = useProgressStore(s => s.getCompletedCountForCourse);

  const coursesWithProgress = getAllCoursesWithProgress();
  const totalCompleted = courses.reduce(
    (sum, c) => sum + getCompletedCount(c.id),
    0
  );
  const totalLessons = courses.reduce((sum, c) => sum + c.total_lecciones, 0);

  // Curso para "Continuar"
  let continueCourse = null;
  if (lastViewed) {
    const found = ContentService.getLessonById(lastViewed.lesson_id);
    if (found) {
      const progress = coursesWithProgress.find(cp => cp.course.id === found.course.id);
      continueCourse = { ...found, progress };
    }
  }
  if (!continueCourse && courses.length > 0) {
    const first = ContentService.getFirstLesson(courses[0].id);
    if (first) {
      const found = ContentService.getLessonById(first.lessonId);
      if (found) {
        const progress = coursesWithProgress.find(cp => cp.course.id === found.course.id);
        continueCourse = { ...found, progress };
      }
    }
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <View>
            <Typography variant="overline" secondary>Instituto Bíblico</Typography>
            <Typography variant="h1" style={{ color: theme.text }}>LearnHub</Typography>
          </View>
          <TouchableOpacity
            style={[styles.avatarWrap, { backgroundColor: `${Colors.primary}20` }]}
            onPress={() => Alert.alert('Perfil', 'La sección de perfil estará disponible en la siguiente versión.')}
            activeOpacity={0.7}
          >
            <Ionicons name="person-outline" size={22} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {/* ── Continuar aprendiendo ── */}
        {continueCourse && (
          <View style={styles.section}>
            <Typography variant="h3" style={{ color: theme.text, marginBottom: 12 }}>
              {lastViewed ? 'Continuar aprendiendo' : 'Comenzar'}
            </Typography>
            <TouchableOpacity
              style={[styles.continueCard, Shadows.primary]}
              onPress={() => router.push({ pathname: '/lesson/[id]', params: { id: continueCourse!.lesson.id } })}
              activeOpacity={0.85}
            >
              <View
                style={[styles.continueGradient, { backgroundColor: continueCourse.course.banner_color }]}
              >
                <View style={styles.continueMeta}>
                  <Badge
                    label={continueCourse.course.titulo}
                    color="#FFF"
                    bg="rgba(255,255,255,0.22)"
                    size="sm"
                  />
                  <Typography variant="h3" style={styles.continueTitle} numberOfLines={2}>
                    {continueCourse.lesson.titulo}
                  </Typography>
                  <Typography variant="caption" style={styles.continueModule}>
                    {continueCourse.module.titulo}
                  </Typography>
                </View>

                <View style={styles.continueBottom}>
                  <View style={styles.continueProg}>
                    <ProgressBar
                      progress={continueCourse.progress?.progress.progress_percent ?? 0}
                      color="rgba(255,255,255,0.9)"
                      trackColor="rgba(255,255,255,0.25)"
                      height={5}
                    />
                    <Typography variant="caption" style={{ color: 'rgba(255,255,255,0.8)', marginTop: 4 }}>
                      {continueCourse.progress?.progress.progress_percent ?? 0}% del curso completado
                    </Typography>
                  </View>
                  <View style={styles.continueBtn}>
                    <Ionicons name="play" size={18} color={continueCourse.course.banner_color} />
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Estadísticas ── */}
        <View style={styles.section}>
          <Typography variant="h3" style={{ color: theme.text, marginBottom: 12 }}>Tu progreso</Typography>
          <View style={styles.statsRow}>
            <StatCard
              icon="checkmark-circle"
              value={totalCompleted}
              label="Completadas"
              color={Colors.success}
            />
            <StatCard
              icon="book"
              value={totalLessons}
              label="Lecciones"
              color={Colors.primary}
            />
            <StatCard
              icon="school"
              value={courses.length}
              label="Cursos"
              color={Colors.accent}
            />
          </View>
        </View>

        {/* ── Niveles ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Typography variant="h3" style={{ color: theme.text }}>Niveles</Typography>
            <TouchableOpacity onPress={() => router.push('/courses' as never)}>
              <Typography variant="label" color={Colors.primary}>Ver todos</Typography>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.levelsScroll}
          >
            {levels.map(level => (
              <LevelCard
                key={level.id}
                level={level}
                courseCount={courses.filter(c => c.nivel_id === level.id).length}
                onPress={() => router.push('/courses' as never)}
              />
            ))}
          </ScrollView>
        </View>

        {/* ── Cursos disponibles ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Typography variant="h3" style={{ color: theme.text }}>Cursos disponibles</Typography>
            <TouchableOpacity onPress={() => router.push('/courses' as never)}>
              <Typography variant="label" color={Colors.primary}>Ver todos</Typography>
            </TouchableOpacity>
          </View>

          {coursesWithProgress.slice(0, 3).map(({ course, progress }) => (
            <TouchableOpacity
              key={course.id}
              style={[styles.courseRow, { backgroundColor: theme.card }, Shadows.sm]}
              onPress={() => router.push({ pathname: '/course/[id]', params: { id: course.id } })}
              activeOpacity={0.8}
            >
              <View style={[styles.courseRowAccent, { backgroundColor: course.banner_color }]}>
                <Ionicons name="book-outline" size={22} color="#FFF" />
              </View>
              <View style={styles.courseRowText}>
                <Typography variant="label" style={{ color: theme.text }} numberOfLines={1}>
                  {course.titulo}
                </Typography>
                <ProgressBar progress={progress.progress_percent} color={course.banner_color} height={3} />
                <Typography variant="caption" secondary>
                  {progress.completed_lessons}/{progress.total_lessons} lecciones
                </Typography>
              </View>
              <Ionicons name="chevron-forward" size={16} color={theme.textMuted} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingBottom: 32 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  avatarWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: { paddingHorizontal: Spacing.lg, marginBottom: Spacing.xl },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  continueCard: { borderRadius: BorderRadius.xl, overflow: 'hidden' },
  continueGradient: { padding: Spacing.lg, gap: 16 },
  continueMeta: { gap: 8 },
  continueTitle: { color: '#FFF', fontSize: FontSizes.xl },
  continueModule: { color: 'rgba(255,255,255,0.75)' },
  continueBottom: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  continueProg: { flex: 1 },
  continueBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsRow: { flexDirection: 'row', gap: Spacing.sm },
  statCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    gap: 4,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  levelsScroll: { gap: Spacing.sm, paddingRight: Spacing.lg },
  levelCard: { width: 180, borderRadius: BorderRadius.lg, overflow: 'hidden' },
  levelTop: { padding: Spacing.md, gap: 8 },
  levelBottom: { padding: Spacing.md, gap: 4 },
  courseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
    gap: 12,
  },
  courseRowAccent: { width: 56, height: 72, alignItems: 'center', justifyContent: 'center' },
  courseRowText: { flex: 1, gap: 6, paddingVertical: 12 },
});
