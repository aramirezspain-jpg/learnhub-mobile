import React, { useMemo, useEffect, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Spacing, BorderRadius, Shadows, FontSizes, FontWeights } from '@/constants/theme';
import { Typography } from '@/components/ui/Typography';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { CourseCard } from '@/components/course/CourseCard';
import { useCourses } from '@/hooks/useCourses';
import { useProgressStore } from '@/store/progress.store';
import { ContentService } from '@/services/content.service';

// ─── Stat card ────────────────────────────────────────────────────────────────
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
    <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: `${color}20` }]}>
      <View style={[styles.statIconWrap, { backgroundColor: `${color}18` }]}>
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <Typography variant="h2" color={color} style={styles.statValue}>
        {value}
      </Typography>
      <Typography variant="caption" secondary style={styles.statLabel}>
        {label}
      </Typography>
    </View>
  );
}

// ─── Section header ───────────────────────────────────────────────────────────
function SectionHeader({
  title,
  action,
  onAction,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  const scheme = useColorScheme() ?? 'dark';
  const theme = Colors[scheme];
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionTitleRow}>
        <View style={[styles.sectionDot, { backgroundColor: Colors.primary }]} />
        <Typography variant="h3" style={{ color: theme.text }}>
          {title}
        </Typography>
      </View>
      {action && onAction && (
        <TouchableOpacity onPress={onAction} style={styles.sectionAction} activeOpacity={0.7}>
          <Typography variant="label" color={Colors.primary}>
            {action}
          </Typography>
          <Ionicons name="chevron-forward" size={14} color={Colors.primary} />
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const router = useRouter();
  const scheme = useColorScheme() ?? 'dark';
  const theme = Colors[scheme];
  const { courses, getAllCoursesWithProgress } = useCourses();
  const lastViewed = useProgressStore(s => s.lastViewed);
  const getCompletedCount = useProgressStore(s => s.getCompletedCountForCourse);
  const lessonProgress = useProgressStore(s => s.lessonProgress);

  const coursesWithProgress = useMemo(
    () => getAllCoursesWithProgress(),
    [courses, lessonProgress] // getAllCoursesWithProgress reads lessonProgress internally
  );

  const totalCompleted = useMemo(
    () => courses.reduce((sum, c) => sum + getCompletedCount(c.id), 0),
    [courses, lessonProgress]
  );
  const totalLessons = useMemo(
    () => courses.reduce((sum, c) => sum + c.total_lecciones, 0),
    [courses]
  );
  const inProgressCount = useMemo(
    () => courses.filter(c => {
      const n = getCompletedCount(c.id);
      return n > 0 && n < c.total_lecciones;
    }).length,
    [courses, lessonProgress]
  );

  const continueCourse = useMemo(() => {
    if (lastViewed) {
      const found = ContentService.getLessonById(lastViewed.lesson_id);
      if (found) {
        const prog = coursesWithProgress.find(cp => cp.course.id === found.course.id);
        return { ...found, progress: prog };
      }
    }
    if (courses.length > 0) {
      const first = ContentService.getFirstLesson(courses[0].id);
      if (first) {
        const found = ContentService.getLessonById(first.lessonId);
        if (found) {
          const prog = coursesWithProgress.find(cp => cp.course.id === found.course.id);
          return { ...found, progress: prog };
        }
      }
    }
    return null;
  }, [lastViewed, courses, coursesWithProgress]);

  const progressPct = continueCourse?.progress?.progress.progress_percent ?? 0;
  const isNew = progressPct === 0;

  const fadeIn = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fadeIn, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <Animated.ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll} style={{ opacity: fadeIn }}>

        {/* ── Header ── */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Typography variant="overline" secondary>
              Instituto Bíblico
            </Typography>
            <Typography variant="h1" style={{ color: theme.text }}>
              LearnHub
            </Typography>
          </View>
          <TouchableOpacity
            style={[styles.avatarBtn, { backgroundColor: `${Colors.primary}18`, borderColor: `${Colors.primary}30` }]}
            onPress={() => router.push('/profile' as never)}
            activeOpacity={0.7}
          >
            <Ionicons name="person-outline" size={20} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {/* ── Continue Learning ── */}
        {continueCourse && (
          <View style={[styles.section]}>
            <SectionHeader
              title={lastViewed ? 'Continuar aprendiendo' : 'Comenzar'}
            />
            <TouchableOpacity
              style={[styles.continueCard, Shadows.primary]}
              onPress={() =>
                router.push({
                  pathname: '/lesson/[id]',
                  params: { id: continueCourse!.lesson.id },
                })
              }
              activeOpacity={0.88}
            >
              {/* Colored background */}
              <View
                style={[
                  styles.continueInner,
                  { backgroundColor: continueCourse.course?.banner_color ?? Colors.primary },
                ]}
              >
                {/* Decorative blobs */}
                <View style={styles.blob1} />
                <View style={styles.blob2} />

                <View style={styles.continueTop}>
                  <View style={styles.courseChip}>
                    <Ionicons name="book-outline" size={12} color="rgba(255,255,255,0.85)" />
                    <Typography variant="caption" style={styles.courseChipText} numberOfLines={1}>
                      {continueCourse.course?.titulo}
                    </Typography>
                  </View>
                  {!isNew && (
                    <View style={styles.pctBadge}>
                      <Typography variant="caption" style={styles.pctText}>
                        {progressPct}%
                      </Typography>
                    </View>
                  )}
                </View>

                <Typography
                  variant="h2"
                  style={styles.continueTitle}
                  numberOfLines={2}
                >
                  {continueCourse.lesson.titulo}
                </Typography>
                <Typography variant="caption" style={styles.continueModule}>
                  {continueCourse.module.titulo}
                </Typography>

                {/* Progress row */}
                <View style={styles.continueBottom}>
                  <View style={styles.continueProg}>
                    <ProgressBar
                      progress={progressPct}
                      color="rgba(255,255,255,0.95)"
                      trackColor="rgba(255,255,255,0.2)"
                      height={4}
                    />
                    <Typography variant="caption" style={styles.continueProgLabel}>
                      {isNew
                        ? 'Empieza tu primera lección'
                        : `${progressPct}% del curso completado`}
                    </Typography>
                  </View>
                  <View style={[styles.playBtn, { backgroundColor: 'rgba(255,255,255,0.95)' }]}>
                    <Ionicons
                      name="play"
                      size={18}
                      color={continueCourse.course?.banner_color ?? Colors.primary}
                    />
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Stats ── */}
        <View style={styles.section}>
          <SectionHeader title="Tu progreso" />
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
              icon="stats-chart"
              value={inProgressCount > 0 ? inProgressCount : courses.length}
              label={inProgressCount > 0 ? 'En curso' : 'Cursos'}
              color={Colors.accent}
            />
          </View>
        </View>

        {/* ── Courses ── */}
        <View style={styles.section}>
          <SectionHeader
            title="Cursos disponibles"
            action="Ver todos"
            onAction={() => router.push('/courses' as never)}
          />
          {coursesWithProgress.slice(0, 3).map(({ course, progress }) => (
            <CourseCard
              key={course.id}
              course={course}
              progressPercent={progress.progress_percent}
              completedLessons={progress.completed_lessons}
              onPress={() =>
                router.push({ pathname: '/course/[id]', params: { id: course.id } })
              }
            />
          ))}
        </View>

      </Animated.ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingBottom: 40 },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  headerLeft: { gap: 2 },
  avatarBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  section: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionDot: { width: 4, height: 16, borderRadius: 2 },
  sectionAction: { flexDirection: 'row', alignItems: 'center', gap: 2 },

  // Continue card
  continueCard: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
  },
  continueInner: {
    padding: Spacing.lg,
    gap: 10,
    overflow: 'hidden',
  },
  blob1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.07)',
    right: -60,
    top: -60,
  },
  blob2: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.05)',
    left: -30,
    bottom: -40,
  },
  continueTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  courseChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(0,0,0,0.22)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    maxWidth: '75%',
  },
  courseChipText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.semibold,
  },
  pctBadge: {
    backgroundColor: 'rgba(255,255,255,0.22)',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  pctText: {
    color: '#FFF',
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.bold,
  },
  continueTitle: {
    color: '#FFFFFF',
    fontSize: FontSizes['2xl'],
    fontWeight: FontWeights.extrabold,
    lineHeight: 32,
  },
  continueModule: {
    color: 'rgba(255,255,255,0.7)',
  },
  continueBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
  },
  continueProg: { flex: 1, gap: 5 },
  continueProgLabel: {
    color: 'rgba(255,255,255,0.75)',
  },
  playBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  // Stats
  statsRow: { flexDirection: 'row', gap: Spacing.sm },
  statCard: {
    flex: 1,
    padding: 14,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
  },
  statIconWrap: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  statValue: { lineHeight: 28 },
  statLabel: { textAlign: 'center' },
});
