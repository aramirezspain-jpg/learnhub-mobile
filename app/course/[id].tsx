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
import { Colors, Spacing, BorderRadius, Shadows, FontSizes, FontWeights } from '@/constants/theme';
import { Typography } from '@/components/ui/Typography';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { CircularProgress } from '@/components/ui/CircularProgress';
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

const DIFFICULTY_ICON: Record<string, React.ComponentProps<typeof Ionicons>['name']> = {
  principiante: 'leaf-outline',
  intermedio: 'flame-outline',
  avanzado: 'rocket-outline',
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

  const completedIds = useMemo(() => {
    if (!course) return new Set<string>();
    const ids = new Set<string>();
    for (const [lessonId, prog] of Object.entries(lessonProgress)) {
      if (prog.course_id === id && prog.completed === 1) ids.add(lessonId);
    }
    return ids;
  }, [lessonProgress, id, course]);

  const moduleUnlockStatus = useMemo((): boolean[] => {
    if (!course) return [];
    return course.modulos.map((mod, idx) => {
      if (idx === 0) return true;
      const prevMod = course.modulos[idx - 1];
      return prevMod.lecciones.filter(l => completedIds.has(l.id)).length >= prevMod.lecciones.length;
    });
  }, [completedIds, course]);

  const defaultOpenIndex = useMemo((): number => {
    if (!course) return 0;
    for (let i = 0; i < course.modulos.length; i++) {
      if (!moduleUnlockStatus[i]) break;
      if (course.modulos[i].lecciones.some(l => !completedIds.has(l.id))) return i;
    }
    return 0;
  }, [moduleUnlockStatus, completedIds, course]);

  const lastActivityLesson = useMemo(() => {
    if (!lastViewed || lastViewed.course_id !== id) return null;
    return ContentService.getLessonById(lastViewed.lesson_id);
  }, [lastViewed, id]);

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

  function getNextLesson(): { moduleId: string; lessonId: string } | undefined {
    for (const mod of course!.modulos) {
      for (const lesson of mod.lecciones) {
        if (!completedIds.has(lesson.id)) return { moduleId: mod.id, lessonId: lesson.id };
      }
    }
    return undefined;
  }

  const nextLesson = getNextLesson();

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
          {/* Decorative blobs */}
          <View style={styles.heroBlob1} />
          <View style={styles.heroBlob2} />
          <View style={styles.heroBlob3} />

          {/* Nav */}
          <View style={styles.heroNav}>
            <TouchableOpacity style={styles.navBtn} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={20} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.navBtn} onPress={handleToggleFavorite}>
              <Ionicons
                name={favorited ? 'heart' : 'heart-outline'}
                size={20}
                color={favorited ? '#FF8FA3' : '#FFF'}
              />
            </TouchableOpacity>
          </View>

          {/* Content + progress */}
          <View style={styles.heroBody}>
            <View style={styles.heroLeft}>
              {/* Difficulty */}
              <View style={styles.diffRow}>
                <Ionicons
                  name={DIFFICULTY_ICON[course.nivel_dificultad] ?? 'leaf-outline'}
                  size={12}
                  color="rgba(255,255,255,0.85)"
                />
                <Typography variant="overline" style={styles.heroOverline}>
                  {DIFFICULTY_LABEL[course.nivel_dificultad]}
                </Typography>
              </View>

              <Typography variant="h1" style={styles.heroTitle} numberOfLines={3}>
                {course.titulo}
              </Typography>
              <Typography variant="body" style={styles.heroSubtitle} numberOfLines={2}>
                {course.subtitulo}
              </Typography>

              {/* Stats pills */}
              <View style={styles.heroPills}>
                <View style={styles.heroPill}>
                  <Ionicons name="layers-outline" size={12} color="rgba(255,255,255,0.8)" />
                  <Typography variant="caption" style={styles.heroPillText}>
                    {total} lecciones
                  </Typography>
                </View>
                <View style={styles.heroPill}>
                  <Ionicons name="time-outline" size={12} color="rgba(255,255,255,0.8)" />
                  <Typography variant="caption" style={styles.heroPillText}>
                    {course.duracion_estimada}
                  </Typography>
                </View>
              </View>
            </View>

            {/* Circular progress */}
            {started && (
              <CircularProgress
                progress={progress.progress_percent}
                color="rgba(255,255,255,0.95)"
                size={88}
                strokeWidth={7}
              />
            )}
          </View>

          {/* Progress bar (always shown if started) */}
          {started && (
            <View style={styles.heroProgressBar}>
              <View style={styles.heroProgressTop}>
                <Typography variant="caption" style={styles.heroProgressLabel}>
                  {progress.completed_lessons} de {total} lecciones completadas
                </Typography>
                {isComplete && (
                  <View style={styles.completedPill}>
                    <Ionicons name="checkmark-circle" size={12} color="#FFF" />
                    <Typography variant="caption" style={{ color: '#FFF', fontWeight: '700', fontSize: 10 }}>
                      ¡Completado!
                    </Typography>
                  </View>
                )}
              </View>
              <ProgressBar
                progress={progress.progress_percent}
                color="rgba(255,255,255,0.95)"
                trackColor="rgba(255,255,255,0.2)"
                height={5}
              />
            </View>
          )}
        </View>

        {/* ── CTA ── */}
        <View style={[styles.ctaSection, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
          {isComplete ? (
            <View style={[styles.completeBanner, { backgroundColor: `${Colors.success}15`, borderColor: `${Colors.success}30` }]}>
              <Ionicons name="checkmark-circle" size={24} color={Colors.success} />
              <View>
                <Typography variant="h4" color={Colors.success}>¡Curso completado!</Typography>
                <Typography variant="caption" secondary>Puedes repasar las lecciones cuando quieras</Typography>
              </View>
            </View>
          ) : (
            <Button
              label={started ? 'Continuar curso' : 'Comenzar curso'}
              onPress={handleContinue}
              fullWidth
              size="lg"
              iconLeft={
                <Ionicons
                  name={started ? 'play-circle' : 'rocket-outline'}
                  size={20}
                  color="#FFF"
                />
              }
            />
          )}
        </View>

        {/* ── Last activity ── */}
        {lastActivityLesson && !isComplete && (
          <View style={[styles.lastActivity, { backgroundColor: theme.card, borderColor: `${course.banner_color}25` }]}>
            <View style={[styles.lastActivityIcon, { backgroundColor: `${course.banner_color}18` }]}>
              <Ionicons name="time-outline" size={16} color={course.banner_color} />
            </View>
            <View style={styles.lastActivityText}>
              <Typography variant="caption" secondary>
                Última lección vista
              </Typography>
              <Typography variant="label" style={{ color: theme.text }} numberOfLines={1}>
                {lastActivityLesson.lesson.titulo}
              </Typography>
            </View>
            <TouchableOpacity
              style={[styles.resumeBtn, { backgroundColor: `${course.banner_color}18`, borderColor: `${course.banner_color}30` }]}
              onPress={handleContinue}
              activeOpacity={0.7}
            >
              <Ionicons name="play" size={14} color={course.banner_color} />
            </TouchableOpacity>
          </View>
        )}

        {/* ── Description ── */}
        <View style={styles.descSection}>
          <Typography variant="body" style={{ color: theme.text, lineHeight: 26 }}>
            {course.descripcion}
          </Typography>
        </View>

        {/* ── Tags ── */}
        <View style={styles.tagsRow}>
          {course.tags.map(tag => (
            <Badge
              key={tag}
              label={tag}
              color={course.banner_color}
              bg={`${course.banner_color}15`}
              size="sm"
            />
          ))}
        </View>

        {/* ── Modules ── */}
        <View style={styles.modulesSection}>
          <View style={styles.modulesSectionHeader}>
            <View style={[styles.modulesDot, { backgroundColor: course.banner_color }]} />
            <Typography variant="h3" style={{ color: theme.text }}>
              Contenido del curso
            </Typography>
            <View style={[styles.modulesCountBadge, { backgroundColor: `${course.banner_color}15` }]}>
              <Typography variant="caption" color={course.banner_color} style={{ fontWeight: FontWeights.bold }}>
                {course.modulos.length} módulos
              </Typography>
            </View>
          </View>

          {course.modulos.map((module, idx) => (
            <ModuleAccordion
              key={module.id}
              module={module}
              courseId={id}
              accentColor={course.banner_color}
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

  // Hero
  hero: {
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    overflow: 'hidden',
  },
  heroBlob1: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(255,255,255,0.07)',
    right: -80,
    top: -80,
  },
  heroBlob2: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.05)',
    left: -50,
    bottom: -50,
  },
  heroBlob3: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(0,0,0,0.1)',
    right: 30,
    bottom: 20,
  },
  heroNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  navBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBody: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  heroLeft: { flex: 1, gap: 8 },
  diffRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  heroOverline: {
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: 1.2,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: FontSizes['3xl'],
    fontWeight: FontWeights.extrabold,
    lineHeight: 36,
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.78)',
    lineHeight: 22,
  },
  heroPills: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginTop: 2 },
  heroPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  heroPillText: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: FontSizes.xs,
  },
  heroProgressBar: { marginTop: Spacing.lg, gap: 7 },
  heroProgressTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  heroProgressLabel: { color: 'rgba(255,255,255,0.75)' },
  completedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: `${Colors.success}CC`,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },

  // CTA
  ctaSection: {
    padding: Spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  completeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },

  // Last activity
  lastActivity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  lastActivityIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lastActivityText: { flex: 1, gap: 2 },
  resumeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },

  // Description
  descSection: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },

  // Tags
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },

  // Modules
  modulesSection: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: 40,
  },
  modulesSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  modulesDot: { width: 4, height: 20, borderRadius: 2 },
  modulesCountBadge: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
});
