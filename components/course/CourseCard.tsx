import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Spacing, BorderRadius, Shadows, FontSizes, FontWeights } from '@/constants/theme';
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

const DIFFICULTY_ICON: Record<string, React.ComponentProps<typeof Ionicons>['name']> = {
  principiante: 'leaf-outline',
  intermedio: 'flame-outline',
  avanzado: 'rocket-outline',
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
  const isComplete = progressPercent >= 100;

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.card }, Shadows.md]}
      onPress={onPress}
      activeOpacity={0.82}
    >
      {/* Banner area */}
      <View style={[styles.banner, { backgroundColor: course.banner_color }]}>
        {/* Decorative circles */}
        <View
          style={[
            styles.deco1,
            { backgroundColor: 'rgba(255,255,255,0.08)' },
          ]}
        />
        <View
          style={[
            styles.deco2,
            { backgroundColor: 'rgba(255,255,255,0.06)' },
          ]}
        />
        <Ionicons name="book-outline" size={32} color="rgba(255,255,255,0.85)" />

        {/* Difficulty badge */}
        <View style={styles.difficultyBadge}>
          <Ionicons
            name={DIFFICULTY_ICON[course.nivel_dificultad] ?? 'leaf-outline'}
            size={11}
            color="rgba(255,255,255,0.9)"
          />
          <Typography
            variant="caption"
            style={styles.difficultyText}
          >
            {DIFFICULTY_LABELS[course.nivel_dificultad] ?? 'Principiante'}
          </Typography>
        </View>

        {/* Complete overlay */}
        {isComplete && (
          <View style={styles.completeBadge}>
            <Ionicons name="checkmark-circle" size={14} color="#FFF" />
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Typography variant="h4" style={{ color: theme.text }} numberOfLines={2}>
          {course.titulo}
        </Typography>
        <Typography variant="caption" secondary numberOfLines={2} style={styles.subtitle}>
          {course.subtitulo}
        </Typography>

        {/* Meta row */}
        <View style={styles.meta}>
          <View style={styles.metaItem}>
            <Ionicons name="layers-outline" size={12} color={theme.textMuted} />
            <Typography variant="caption" muted style={{ marginLeft: 4 }}>
              {course.total_lecciones} lecciones
            </Typography>
          </View>
          <View style={[styles.metaDot, { backgroundColor: theme.border }]} />
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={12} color={theme.textMuted} />
            <Typography variant="caption" muted style={{ marginLeft: 4 }}>
              {course.duracion_estimada}
            </Typography>
          </View>
        </View>

        {/* Progress */}
        {started && (
          <View style={styles.progressBlock}>
            <View style={styles.progressHeader}>
              <Typography variant="caption" secondary>
                {completedLessons}/{course.total_lecciones} completadas
              </Typography>
              <Typography
                variant="caption"
                color={isComplete ? Colors.success : course.banner_color}
                style={{ fontWeight: FontWeights.bold }}
              >
                {progressPercent}%
              </Typography>
            </View>
            <ProgressBar
              progress={progressPercent}
              color={isComplete ? Colors.success : course.banner_color}
              trackColor={`${course.banner_color}18`}
              height={5}
            />
          </View>
        )}

        {/* Tags */}
        <View style={styles.tags}>
          {course.tags.slice(0, 2).map(tag => (
            <Badge
              key={tag}
              label={tag}
              color={course.banner_color}
              bg={`${course.banner_color}14`}
              size="sm"
            />
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  banner: {
    height: 110,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  deco1: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    right: -40,
    top: -40,
  },
  deco2: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    left: -20,
    bottom: -25,
  },
  difficultyBadge: {
    position: 'absolute',
    top: 10,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.28)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  difficultyText: {
    color: 'rgba(255,255,255,0.92)',
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.semibold,
  },
  completeBadge: {
    position: 'absolute',
    top: 10,
    right: 12,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: `${Colors.success}CC`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: Spacing.md,
    gap: 7,
  },
  subtitle: { lineHeight: 18 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  metaItem: { flexDirection: 'row', alignItems: 'center' },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
  },
  progressBlock: { gap: 5, marginTop: 2 },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tags: { flexDirection: 'row', gap: 6, marginTop: 2, flexWrap: 'wrap' },
});
