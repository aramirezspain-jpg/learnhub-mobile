import React, { useMemo, useCallback } from 'react';
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
import { useFavorites } from '@/hooks/useFavorites';

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
  const lastViewed = useProgressStore(s => s.lastViewed);

  const { isFavorite, toggleFavorite } = useFavorites();

  const course = ContentService.getCourseById(id);
  const favorited = course ? isFavorite(course.id) : false;

  const handleToggleFavorite = useCallback(async () => {
    if (!course) return;
    await toggleFavorite(course.id, 'course', course.id);
  }, [course, toggleFavorite]);

  // Conjunto de lecciones completadas para este curso — antes del guard
  const completedIds = useMemo(() => {
    if (!course) return new Set<string>();
    const ids = new Set<string>();
    for (const [lessonId, prog] of Object.entries(lessonProgress)) {
      if (prog.course_id === id && prog.completed === 1) ids.add(lessonId);
    }
    return ids;
  }, [lessonProgress, id, course]);

  // Estado de desbloqueo por módulo — antes del guard
  const moduleUnlockStatus = useMemo((): boolean[] => {
    if (!course) return [];
    return course.modulos.map((mod, idx) => {
      if (idx === 0) return true;
      const prevMod = course.modulos[idx - 1];
      const prevCompleted = prevMod.lecciones.filter(l => completedIds.has(l.id)).length;
      return prevCompleted >= prevMod.lecciones.length;
    });
  }, [completedIds, course]);

  // Índice del módulo que debe estar abierto por defecto — antes del guard
  const defaultOpenIndex = useMemo((): number => {
    if (!course) return 0;
    for (let i = 0; i < course.modulos.length; i++) {
      if (!moduleUnlockStatus[i]) break;
      const mod = course.modulos[i];
      const hasIncomplete = mod.lecciones.some(l => !completedIds.has(l.id));
      if (hasIncomplete) return i;
    }
    return 0;
  }, [moduleUnlockStatus, completedIds, course]);

  // Última lección vista en este curso — antes del guard
  const lastActivityLesson = useMemo(() => {
    if (!lastViewed || lastViewed.course_id !== id) return null;
    return ContentService.getLessonById(lastViewed.lesson_id);
  }, [lastViewed, id]);

  // Guard: curso no encontrado
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
  const isComplete = progress.progress_percent === 100;

  // Primera lección sin completar
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

  // Continuar: prioriza última lección no completada, luego la siguiente
  async function handleContinue() {
    let target: { moduleId: string; lessonId: string } | undefined;

    if (lastViewed?.course_id === id && !completedIds.has(lastViewed.lesson_id)) {
      target = { moduleId: lastViewed.module_id, lessonId: lastViewed.lesson_id };
    }

    if (!target) target = nextLesson;
    if (!target) return;

    await recordLastViewed(id, target.moduleId, target.lessonId);
    router.push({ pathname: '/lesson/[id]', params: { id: target.lessonId } });
  }

  function handleLessonPress(lessonId: string) {
    const found = ContentService.getLessonById(lessonId);
    if (!found) return;
    const moduleIdx = course!.modulos.findIndex(m => m.id === found.module.id);
    if (moduleIdx > 0 && !moduleUnlockStatus[moduleIdx]) return;
    recordLastViewed(id, found.module.id, lessonId);
    router.push({ pathname: '/lesson/[id]', params: { id: lessonId } });
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top', 'bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ── Hero ── */}
        <View style={[styles.hero, { backgroundColor: course.banner_color }]}>
          <View style={styles.heroNav}>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={22} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.backBtn, { marginLeft: 'auto' }]}
              onPress={handleToggleFavorite}
            >
              <Ionicons
                name={favorited ? 'heart' : 'heart-outline'}
                size={22}
                color={favorited ? '#FF6B6B' : '#FFF'}
              />
            </TouchableOpacity>
          </View>

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

            {/* Última actividad en este curso */}
            {lastActivityLesson && !isComplete && (
              <View style={styles.lastActivity}>
                <Ionicons name="time-outline" size={13} color="rgba(255,255,255,0.75)" />
                <Typography variant="caption" style={{ color: 'rgba(255,255,255,0.85)' }} numberOfLines={1}>
                  Última vista: {lastActivityLesson.lesson.titulo}
                </Typography>
              </View>
            )}

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
              <Ionicons name="checkmark-circle" size={22} color={Colors.success} />
              <View>
                <Typography variant="label" color={Colors.success}>¡Curso completado!</Typography>
                <Typography variant="caption" secondary>Puedes repasar las lecciones cuando quieras</Typography>
              </View>
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
              defaultOpen={idx === defaultOpenIndex}
              isLocked={!moduleUnlockStatus[idx]}
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
  heroNav: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
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
  lastActivity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
  },
  heroStats: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 4 },
  heroStat: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  heroProgress: { marginTop: Spacing.lg, gap: 8 },
  heroProgRow: { flexDirection: 'row', justifyContent: 'space-between' },
  ctaRow: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.lg },
  completeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: BorderRadius.lg,
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
