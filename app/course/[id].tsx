import React, { useMemo } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Spacing, BorderRadius, Shadows, FontSizes } from '@/constants/theme';
import { Typography } from '@/components/ui/Typography';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ModuleAccordion } from '@/components/course/ModuleAccordion';
import { ContentService } from '@/services/content.service';
import { useProgressStore } from '@/store/progress.store';
import { useProgress } from '@/hooks/useProgress';

const DIFFICULTY_LABEL: Record<string, string> = {
  principiante: 'Principiante',
  intermedio: 'Intermedio',
  avanzado: 'Avanzado',
};

export default function CourseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const scheme = useColorScheme() ?? 'dark';
  const theme = Colors[scheme];
  const { recordLastViewed } = useProgress();
  const lessonProgress = useProgressStore(s => s.lessonProgress);
  const getCourseProgress = useProgressStore(s => s.getCourseProgress);

  const course = ContentService.getCourseById(id);

  const completedIds = useMemo(() => {
    if (!course) return new Set<string>();
    const ids = new Set<string>();
    for (const [lessonId, prog] of Object.entries(lessonProgress)) {
      if (prog.course_id === id && prog.completed === 1) ids.add(lessonId);
    }
    return ids;
  }, [lessonProgress, id, course]);

  if (!course) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, alignItems: 'center', justifyContent: 'center' }]}>
        <Typography variant="h3" muted>Curso no encontrado</Typography>
      </View>
    );
  }

  const total = ContentService.getTotalLessons(id);
  const progress = getCourseProgress(id, total);
  const started = progress.completed_lessons > 0;

  // Encontrar la siguiente lección sin completar
  function getNextLesson(): { moduleId: string; lessonId: string } | undefined {
    for (const mod of course!.modulos) {
      for (const lesson of mod.lecciones) {
        if (!completedIds.has(lesson.id)) {
          return { moduleId: mod.id, lessonId: lesson.id };
        }
      }
    }
    return undefined;
  }

  const nextLesson = getNextLesson();
  const isComplete = progress.progress_percent === 100;

  async function handleContinue() {
    if (!nextLesson) return;
    await recordLastViewed(id, nextLesson.moduleId, nextLesson.lessonId);
    router.push({ pathname: '/lesson/[id]', params: { id: nextLesson.lessonId } });
  }

  function handleLessonPress(lessonId: string) {
    const found = ContentService.getLessonById(lessonId);
    if (!found) return;
    recordLastViewed(id, found.module.id, lessonId);
    router.push({ pathname: '/lesson/[id]', params: { id: lessonId } });
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top', 'bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ── Hero ── */}
        <View style={[styles.hero, { backgroundColor: course.banner_color }]}>
          {/* Back button */}
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={22} color="#FFF" />
          </TouchableOpacity>

          {/* Course info */}
          <View style={styles.heroContent}>
            <Badge
              label={DIFFICULTY_LABEL[course.nivel_dificultad]}
              color="#FFF"
              bg="rgba(255,255,255,0.25)"
            />
            <Typography variant="h1" style={styles.heroTitle} numberOfLines={3}>
              {course.titulo}
            </Typography>
            <Typography variant="body" style={styles.heroSubtitle} numberOfLines={2}>
              {course.descripcion}
            </Typography>

            {/* Stats */}
            <View style={styles.heroStats}>
              {[
                { icon: 'book-outline' as const, value: `${total} lecciones` },
                { icon: 'time-outline' as const, value: course.duracion_estimada },
                { icon: 'people-outline' as const, value: course.instructor.split(' ').slice(0, 2).join(' ') },
              ].map(({ icon, value }) => (
                <View key={value} style={styles.heroStat}>
                  <Ionicons name={icon} size={13} color="rgba(255,255,255,0.8)" />
                  <Typography variant="caption" style={{ color: 'rgba(255,255,255,0.9)' }}>
                    {value}
                  </Typography>
                </View>
              ))}
            </View>
          </View>

          {/* Progress */}
          {started && (
            <View style={styles.heroProgress}>
              <View style={styles.heroProgRow}>
                <Typography variant="caption" style={{ color: 'rgba(255,255,255,0.8)' }}>
                  {progress.completed_lessons}/{total} completadas
                </Typography>
                <Typography variant="label" style={{ color: '#FFF', fontWeight: '700' }}>
                  {progress.progress_percent}%
                </Typography>
              </View>
              <ProgressBar
                progress={progress.progress_percent}
                color="rgba(255,255,255,0.95)"
                trackColor="rgba(255,255,255,0.25)"
                height={6}
              />
            </View>
          )}
        </View>

        {/* ── CTA ── */}
        <View style={styles.ctaRow}>
          {isComplete ? (
            <View style={[styles.completeBadge, { backgroundColor: `${Colors.success}20` }]}>
              <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
              <Typography variant="label" color={Colors.success}>¡Curso completado!</Typography>
            </View>
          ) : (
            <Button
              label={started ? 'Continuar curso' : 'Comenzar curso'}
              onPress={handleContinue}
              fullWidth
              size="lg"
              iconLeft={<Ionicons name={started ? 'play' : 'rocket-outline'} size={18} color="#FFF" />}
            />
          )}
        </View>

        {/* ── Tags ── */}
        <View style={styles.tags}>
          {course.tags.map(tag => (
            <Badge
              key={tag}
              label={tag}
              color={course.banner_color}
              bg={`${course.banner_color}18`}
              size="sm"
            />
          ))}
        </View>

        {/* ── Módulos ── */}
        <View style={styles.modules}>
          <Typography variant="h3" style={{ color: theme.text, marginBottom: 14 }}>
            Contenido del curso
          </Typography>

          {course.modulos.map((module, idx) => (
            <ModuleAccordion
              key={module.id}
              module={module}
              courseId={id}
              defaultOpen={idx === 0}
              completedLessonIds={completedIds}
              onLessonPress={handleLessonPress}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  hero: {
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  heroContent: { gap: 10 },
  heroTitle: {
    color: '#FFF',
    fontSize: FontSizes['3xl'],
    lineHeight: 36,
    fontWeight: '800',
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.82)',
    lineHeight: 22,
  },
  heroStats: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 4 },
  heroStat: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  heroProgress: { marginTop: Spacing.lg, gap: 8 },
  heroProgRow: { flexDirection: 'row', justifyContent: 'space-between' },
  ctaRow: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.lg },
  completeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 14,
    borderRadius: BorderRadius.md,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  modules: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 40,
  },
});
