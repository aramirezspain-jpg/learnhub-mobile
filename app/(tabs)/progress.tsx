import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { Typography } from '@/components/ui/Typography';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useCourses } from '@/hooks/useCourses';
import { useProgressStore } from '@/store/progress.store';
import { ContentService } from '@/services/content.service';

function AchievementCard({
  icon,
  title,
  desc,
  unlocked,
  color,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
  desc: string;
  unlocked: boolean;
  color: string;
}) {
  const scheme = useColorScheme() ?? 'dark';
  const theme = Colors[scheme];
  return (
    <View
      style={[
        styles.achievement,
        { backgroundColor: theme.card, opacity: unlocked ? 1 : 0.5 },
        Shadows.sm,
      ]}
    >
      <View style={[styles.achieveIcon, { backgroundColor: unlocked ? `${color}20` : theme.border }]}>
        <Ionicons name={icon} size={24} color={unlocked ? color : theme.textMuted} />
      </View>
      <Typography variant="label" style={{ color: theme.text }} numberOfLines={1}>{title}</Typography>
      <Typography variant="caption" secondary numberOfLines={2}>{desc}</Typography>
      {unlocked && (
        <View style={[styles.achieveBadge, { backgroundColor: `${Colors.success}20` }]}>
          <Typography variant="caption" color={Colors.success} style={{ fontWeight: '700' }}>
            ✓ Desbloqueado
          </Typography>
        </View>
      )}
    </View>
  );
}

export default function ProgressScreen() {
  const scheme = useColorScheme() ?? 'dark';
  const theme = Colors[scheme];
  const { courses } = useCourses();
  const getCourseProgress = useProgressStore(s => s.getCourseProgress);
  const getCompletedCount = useProgressStore(s => s.getCompletedCountForCourse);

  const totalCompleted = courses.reduce((s, c) => s + getCompletedCount(c.id), 0);
  const totalLessons = courses.reduce((s, c) => s + c.total_lecciones, 0);
  const globalPercent = totalLessons > 0 ? Math.round((totalCompleted / totalLessons) * 100) : 0;

  const achievements = [
    {
      icon: 'rocket-outline' as const,
      title: 'Primera Lección',
      desc: 'Completa tu primera lección',
      unlocked: totalCompleted >= 1,
      color: Colors.primary,
    },
    {
      icon: 'flame-outline' as const,
      title: 'Estudiante Dedicado',
      desc: 'Completa 5 lecciones',
      unlocked: totalCompleted >= 5,
      color: Colors.accent,
    },
    {
      icon: 'trophy-outline' as const,
      title: 'Primer Módulo',
      desc: 'Completa todas las lecciones de un módulo',
      unlocked: totalCompleted >= 3,
      color: Colors.nivel2,
    },
    {
      icon: 'star-outline' as const,
      title: 'Primer Curso',
      desc: 'Completa tu primer curso completo',
      unlocked: courses.some(c => {
        const total = ContentService.getTotalLessons(c.id);
        return getCourseProgress(c.id, total).progress_percent === 100;
      }),
      color: Colors.accent,
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <Typography variant="overline" secondary>Tu aprendizaje</Typography>
          <Typography variant="h1" style={{ color: theme.text }}>Progreso</Typography>
        </View>

        {/* Progreso global */}
        <View style={[styles.globalCard, Shadows.md]}>
          <View style={styles.globalHeader}>
            <View>
              <Typography variant="h2" color={Colors.primary}>
                {globalPercent}%
              </Typography>
              <Typography variant="body" secondary>progreso total</Typography>
            </View>
            <View style={[styles.globalIcon, { backgroundColor: `${Colors.primary}20` }]}>
              <Ionicons name="bar-chart" size={32} color={Colors.primary} />
            </View>
          </View>
          <ProgressBar progress={globalPercent} height={10} />
          <Typography variant="caption" secondary style={{ marginTop: 8 }}>
            {totalCompleted} de {totalLessons} lecciones completadas
          </Typography>
        </View>

        {/* Progreso por curso */}
        <View style={styles.section}>
          <Typography variant="h3" style={{ color: theme.text, marginBottom: 12 }}>
            Por curso
          </Typography>

          {courses.map(course => {
            const total = ContentService.getTotalLessons(course.id);
            const prog = getCourseProgress(course.id, total);
            const completed = getCompletedCount(course.id);
            const done = prog.progress_percent === 100;

            return (
              <View
                key={course.id}
                style={[styles.courseProgress, { backgroundColor: theme.card }, Shadows.sm]}
              >
                <View style={[styles.courseAccent, { backgroundColor: done ? Colors.success : course.banner_color }]} />
                <View style={styles.courseInfo}>
                  <View style={styles.courseTitleRow}>
                    <Typography variant="label" style={{ color: theme.text, flex: 1 }} numberOfLines={1}>
                      {course.titulo}
                    </Typography>
                    {done && (
                      <View style={[styles.doneBadge, { backgroundColor: `${Colors.success}18` }]}>
                        <Ionicons name="checkmark-circle" size={12} color={Colors.success} />
                        <Typography variant="caption" color={Colors.success} style={{ fontWeight: '700' }}>
                          Completado
                        </Typography>
                      </View>
                    )}
                  </View>
                  <ProgressBar
                    progress={prog.progress_percent}
                    color={done ? Colors.success : course.banner_color}
                    height={5}
                  />
                  <View style={styles.courseStats}>
                    <Typography variant="caption" secondary>
                      {completed}/{total} lecciones
                    </Typography>
                    <Typography variant="caption" color={done ? Colors.success : course.banner_color} style={{ fontWeight: '700' }}>
                      {prog.progress_percent}%
                    </Typography>
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        {/* Logros */}
        <View style={styles.section}>
          <Typography variant="h3" style={{ color: theme.text, marginBottom: 12 }}>
            Logros
          </Typography>
          <View style={styles.achievements}>
            {achievements.map(a => (
              <AchievementCard key={a.title} {...a} />
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingBottom: 40 },
  header: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: Spacing.lg },
  globalCard: {
    marginHorizontal: Spacing.lg,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  globalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  globalIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  section: { paddingHorizontal: Spacing.lg, marginBottom: Spacing.xl },
  courseProgress: {
    flexDirection: 'row',
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  courseAccent: { width: 6 },
  courseInfo: { flex: 1, padding: Spacing.md, gap: 8 },
  courseTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  doneBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  courseStats: { flexDirection: 'row', justifyContent: 'space-between' },
  achievements: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  achievement: {
    width: '47%',
    padding: 14,
    borderRadius: BorderRadius.lg,
    gap: 6,
  },
  achieveIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  achieveBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
});
