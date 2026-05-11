import React, { useEffect, useState } from 'react';
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
import { Button } from '@/components/ui/Button';
import { ContentService } from '@/services/content.service';
import { useProgress } from '@/hooks/useProgress';

export default function LessonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const scheme = useColorScheme() ?? 'dark';
  const theme = Colors[scheme];
  const { isLessonComplete, markLessonComplete, recordLastViewed } = useProgress();
  const [completing, setCompleting] = useState(false);

  const found = ContentService.getLessonById(id);
  const adjacent = ContentService.getAdjacentLessons(id);

  useEffect(() => {
    if (found) {
      recordLastViewed(found.course.id, found.module.id, id);
    }
  }, [id]);

  if (!found) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, alignItems: 'center', justifyContent: 'center' }]}>
        <Typography variant="h3" muted>Lección no encontrada</Typography>
      </View>
    );
  }

  const { course, module, lesson } = found;
  const completed = isLessonComplete(id);

  // Calcular el número de lección dentro del curso
  const allLessons: string[] = [];
  for (const m of course.modulos) {
    for (const l of m.lecciones) allLessons.push(l.id);
  }
  const lessonIndex = allLessons.indexOf(id) + 1;
  const totalLessons = allLessons.length;

  async function handleComplete() {
    if (completing || completed) return;
    setCompleting(true);
    await markLessonComplete(course.id, module.id, id);
    setCompleting(false);
  }

  function handleQuiz() {
    if (!lesson.quiz) return;
    router.push({ pathname: '/quiz/[id]', params: { id: lesson.id } });
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top', 'bottom']}>
      {/* ── Barra superior ── */}
      <View style={[styles.topBar, { borderBottomColor: theme.border }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={theme.text} />
        </TouchableOpacity>
        <View style={styles.topCenter}>
          <Typography variant="caption" secondary numberOfLines={1} style={{ maxWidth: 200 }}>
            {module.titulo}
          </Typography>
          <ProgressBar
            progress={(lessonIndex / totalLessons) * 100}
            height={3}
            color={course.banner_color}
          />
        </View>
        <Typography variant="caption" secondary>
          {lessonIndex}/{totalLessons}
        </Typography>
      </View>

      {/* ── Contenido ── */}
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* Cabecera de lección */}
        <View style={styles.lessonHeader}>
          <View style={styles.typeRow}>
            <Ionicons
              name="document-text-outline"
              size={14}
              color={course.banner_color}
            />
            <Typography variant="overline" color={course.banner_color}>
              {lesson.tipo} · {lesson.duracion_minutos} min
            </Typography>
          </View>
          <Typography variant="h2" style={{ color: theme.text }}>
            {lesson.titulo}
          </Typography>
          {completed && (
            <View style={[styles.completedBadge, { backgroundColor: `${Colors.success}15` }]}>
              <Ionicons name="checkmark-circle" size={15} color={Colors.success} />
              <Typography variant="caption" color={Colors.success} style={{ fontWeight: '700' }}>
                Lección completada
              </Typography>
            </View>
          )}
        </View>

        {/* Introducción */}
        <View style={[styles.card, { backgroundColor: theme.card }]}>
          <Typography variant="bodyLarge" style={{ color: theme.text, lineHeight: 28 }}>
            {lesson.contenido.introduccion}
          </Typography>
        </View>

        {/* Secciones de contenido */}
        {lesson.contenido.secciones.map((sec, idx) => (
          <View key={idx} style={styles.sectionBlock}>
            <View style={[styles.sectionTitleRow, { borderLeftColor: course.banner_color }]}>
              <Typography variant="h3" style={{ color: theme.text }}>
                {sec.subtitulo}
              </Typography>
            </View>
            <Typography variant="body" style={{ color: theme.text, lineHeight: 26 }}>
              {sec.texto}
            </Typography>
          </View>
        ))}

        {/* Puntos clave */}
        <View style={[styles.keyPoints, { backgroundColor: `${Colors.primary}10`, borderColor: `${Colors.primary}25` }]}>
          <View style={styles.keyHeader}>
            <Ionicons name="bulb-outline" size={18} color={Colors.primary} />
            <Typography variant="h4" color={Colors.primary}>Puntos clave</Typography>
          </View>
          {lesson.contenido.puntos_clave.map((punto, idx) => (
            <View key={idx} style={styles.keyItem}>
              <View style={[styles.keyDot, { backgroundColor: Colors.primary }]} />
              <Typography variant="body" style={{ color: theme.text, flex: 1, lineHeight: 22 }}>
                {punto}
              </Typography>
            </View>
          ))}
        </View>

        {/* Citas bíblicas */}
        {lesson.contenido.citas_biblicas.map((cita, idx) => (
          <View key={idx} style={[styles.verse, { backgroundColor: theme.card, borderLeftColor: course.banner_color }]}>
            <Ionicons name="bookmark" size={14} color={course.banner_color} style={{ marginBottom: 6 }} />
            <Typography
              variant="bodyLarge"
              style={{ color: theme.text, fontStyle: 'italic', lineHeight: 26 }}
            >
              "{cita.texto}"
            </Typography>
            <Typography
              variant="label"
              color={course.banner_color}
              style={{ marginTop: 8, fontWeight: '700' }}
            >
              {cita.referencia}
            </Typography>
          </View>
        ))}

        {/* Reflexión */}
        {lesson.contenido.reflexion && (
          <View style={[styles.reflection, { backgroundColor: `${Colors.accent}12`, borderColor: `${Colors.accent}30` }]}>
            <View style={styles.reflectionHeader}>
              <Ionicons name="chatbubble-ellipses-outline" size={18} color={Colors.accent} />
              <Typography variant="h4" color={Colors.accent}>Reflexión</Typography>
            </View>
            <Typography variant="bodyLarge" style={{ color: theme.text, fontStyle: 'italic', lineHeight: 26 }}>
              {lesson.contenido.reflexion}
            </Typography>
          </View>
        )}

        {/* Navegación entre lecciones */}
        <View style={styles.navRow}>
          {adjacent.prev ? (
            <TouchableOpacity
              style={[styles.navBtn, { backgroundColor: theme.card }]}
              onPress={() => router.replace({ pathname: '/lesson/[id]', params: { id: adjacent.prev! } })}
            >
              <Ionicons name="arrow-back" size={18} color={theme.text} />
              <Typography variant="label" secondary>Anterior</Typography>
            </TouchableOpacity>
          ) : (
            <View />
          )}
          {adjacent.next && (
            <TouchableOpacity
              style={[styles.navBtn, styles.navBtnNext, { backgroundColor: `${Colors.primary}15` }]}
              onPress={() => router.replace({ pathname: '/lesson/[id]', params: { id: adjacent.next! } })}
            >
              <Typography variant="label" color={Colors.primary}>Siguiente</Typography>
              <Ionicons name="arrow-forward" size={18} color={Colors.primary} />
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* ── Barra inferior ── */}
      <View style={[styles.bottomBar, { backgroundColor: theme.surface, borderTopColor: theme.border }]}>
        {lesson.quiz && (
          <TouchableOpacity
            style={[styles.quizBtn, { backgroundColor: `${Colors.accent}18`, borderColor: `${Colors.accent}40` }]}
            onPress={handleQuiz}
          >
            <Ionicons name="help-circle-outline" size={20} color={Colors.accent} />
            <Typography variant="label" color={Colors.accent}>Quiz</Typography>
          </TouchableOpacity>
        )}
        <Button
          label={completed ? '✓ Completada' : 'Marcar completada'}
          onPress={handleComplete}
          loading={completing}
          variant={completed ? 'secondary' : 'primary'}
          style={{ flex: 1 }}
          disabled={completed}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  backBtn: { padding: 4 },
  topCenter: { flex: 1, gap: 6 },
  scroll: { paddingBottom: 16 },
  lessonHeader: { padding: Spacing.lg, gap: 10 },
  typeRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
  },
  card: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  sectionBlock: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    gap: 10,
  },
  sectionTitleRow: {
    borderLeftWidth: 3,
    paddingLeft: 12,
  },
  keyPoints: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    gap: 10,
  },
  keyHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  keyItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  keyDot: { width: 7, height: 7, borderRadius: 4, marginTop: 7 },
  verse: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderLeftWidth: 4,
  },
  reflection: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    gap: 10,
  },
  reflectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    marginBottom: 16,
  },
  navBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
  },
  navBtnNext: {},
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  quizBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
});
