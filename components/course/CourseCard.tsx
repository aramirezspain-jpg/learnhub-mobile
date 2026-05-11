import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { Typography } from '@/components/ui/Typography';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { type Course } from '@/types';

interface CourseCardProps {
  course: Course;
  progressPercent?: number;
  completedLessons?: number;
  onPress?: () => void;
}

const DIFFICULTY_LABELS: Record<string, string> = {
  principiante: 'Principiante',
  intermedio: 'Intermedio',
  avanzado: 'Avanzado',
};

export function CourseCard({
  course,
  progressPercent = 0,
  completedLessons = 0,
  onPress,
}: CourseCardProps) {
  const scheme = useColorScheme() ?? 'dark';
  const theme = Colors[scheme];
  const started = completedLessons > 0;

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.card }, Shadows.md]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      {/* Color accent bar */}
      <View style={[styles.accent, { backgroundColor: course.banner_color }]}>
        <Ionicons name="book-outline" size={28} color="rgba(255,255,255,0.9)" />
      </View>

      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Badge
            label={DIFFICULTY_LABELS[course.nivel_dificultad] ?? 'Principiante'}
            color={course.banner_color}
            bg={`${course.banner_color}20`}
            size="sm"
          />
          {started && (
            <View style={[styles.progressPill, { backgroundColor: `${Colors.success}20` }]}>
              <Ionicons name="checkmark-circle" size={12} color={Colors.success} />
              <Typography variant="caption" color={Colors.success} style={styles.progressText}>
                {progressPercent}%
              </Typography>
            </View>
          )}
        </View>

        {/* Título */}
        <Typography variant="h4" style={[styles.title, { color: theme.text }]} numberOfLines={2}>
          {course.titulo}
        </Typography>

        <Typography variant="body" secondary numberOfLines={2} style={styles.desc}>
          {course.descripcion}
        </Typography>

        {/* Metadatos */}
        <View style={styles.meta}>
          <View style={styles.metaItem}>
            <Ionicons name="book-outline" size={13} color={theme.textSecondary} />
            <Typography variant="caption" secondary style={{ marginLeft: 4 }}>
              {course.total_lecciones} lecciones
            </Typography>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={13} color={theme.textSecondary} />
            <Typography variant="caption" secondary style={{ marginLeft: 4 }}>
              {course.duracion_estimada}
            </Typography>
          </View>
        </View>

        {/* Barra de progreso */}
        {started && (
          <View style={styles.progressSection}>
            <ProgressBar progress={progressPercent} color={course.banner_color} height={4} />
            <Typography variant="caption" secondary style={styles.progressLabel}>
              {completedLessons}/{course.total_lecciones} lecciones completadas
            </Typography>
          </View>
        )}
      </View>

      {/* Flecha */}
      <View style={styles.arrow}>
        <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  accent: {
    width: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    padding: Spacing.md,
    gap: 6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    gap: 3,
  },
  progressText: { fontWeight: '600' },
  title: { marginTop: 2 },
  desc: { lineHeight: 20 },
  meta: { flexDirection: 'row', gap: 16, marginTop: 4 },
  metaItem: { flexDirection: 'row', alignItems: 'center' },
  progressSection: { marginTop: 6, gap: 4 },
  progressLabel: { marginTop: 2 },
  arrow: { justifyContent: 'center', paddingRight: 12 },
});
