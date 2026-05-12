import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Spacing, BorderRadius, FontSizes, FontWeights } from '@/constants/theme';
import { Typography } from '@/components/ui/Typography';
import { useNotesStore } from '@/store/notes.store';
import { type Lesson } from '@/types';

interface LessonItemProps {
  lesson: Lesson;
  courseId: string;
  isCompleted: boolean;
  isLocked?: boolean;
  accentColor?: string;
  onPress?: () => void;
}

const TYPE_ICON: Record<string, React.ComponentProps<typeof Ionicons>['name']> = {
  lectura: 'document-text-outline',
  video: 'play-circle-outline',
  audio: 'headset-outline',
  pdf: 'reader-outline',
  practica: 'pencil-outline',
};

const TYPE_LABEL: Record<string, string> = {
  lectura: 'Lectura',
  video: 'Video',
  audio: 'Audio',
  pdf: 'PDF',
  practica: 'Práctica',
};

export function LessonItem({
  lesson,
  isCompleted,
  isLocked = false,
  accentColor,
  onPress,
}: LessonItemProps) {
  const scheme = useColorScheme() ?? 'dark';
  const theme = Colors[scheme];
  const hasNote = useNotesStore(s => s.hasNoteForLesson(lesson.id));

  const color = accentColor ?? Colors.primary;

  const iconName: React.ComponentProps<typeof Ionicons>['name'] = isCompleted
    ? 'checkmark-circle'
    : isLocked
    ? 'lock-closed'
    : (TYPE_ICON[lesson.tipo] ?? 'document-text-outline');

  const iconColor = isCompleted ? Colors.success : isLocked ? theme.textMuted : color;

  const bgColor = isCompleted
    ? `${Colors.success}14`
    : isLocked
    ? `${theme.border}50`
    : `${color}12`;

  return (
    <TouchableOpacity
      style={[
        styles.item,
        {
          backgroundColor: isCompleted ? `${Colors.success}08` : 'transparent',
          borderBottomColor: theme.border,
        },
      ]}
      onPress={onPress}
      disabled={isLocked}
      activeOpacity={0.65}
    >
      {/* Icon */}
      <View style={[styles.iconWrap, { backgroundColor: bgColor }]}>
        <Ionicons name={iconName} size={18} color={iconColor} />
      </View>

      {/* Text */}
      <View style={styles.text}>
        <Typography
          variant="label"
          color={isLocked ? theme.textMuted : isCompleted ? theme.textSecondary : theme.text}
          numberOfLines={2}
          style={isCompleted ? styles.completedTitle : undefined}
        >
          {lesson.titulo}
        </Typography>
        <View style={styles.meta}>
          {/* Type chip */}
          <View style={[styles.typeChip, { backgroundColor: isCompleted ? `${Colors.success}12` : `${color}12` }]}>
            <Typography
              variant="caption"
              color={isCompleted ? Colors.success : color}
              style={styles.typeLabel}
            >
              {TYPE_LABEL[lesson.tipo] ?? lesson.tipo}
            </Typography>
          </View>
          <View style={styles.metaDivider} />
          <Ionicons name="time-outline" size={11} color={theme.textMuted} />
          <Typography variant="caption" muted style={styles.metaText}>
            {lesson.duracion_minutos} min
          </Typography>
          {lesson.quiz && (
            <>
              <View style={styles.metaDivider} />
              <Ionicons name="help-circle-outline" size={11} color={theme.textMuted} />
              <Typography variant="caption" muted style={styles.metaText}>
                {lesson.quiz.preguntas.length} preg.
              </Typography>
            </>
          )}
          {hasNote && (
            <>
              <View style={styles.metaDivider} />
              <Ionicons name="document-text" size={11} color={color} />
            </>
          )}
        </View>
      </View>

      {/* Right indicator */}
      {isCompleted ? (
        <View style={[styles.completedDot, { backgroundColor: `${Colors.success}22` }]}>
          <Ionicons name="checkmark" size={14} color={Colors.success} />
        </View>
      ) : isLocked ? (
        <Ionicons name="lock-closed" size={14} color={theme.textMuted} style={{ marginRight: 4 }} />
      ) : (
        <Ionicons name="chevron-forward" size={16} color={theme.textMuted} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  text: { flex: 1, gap: 5 },
  completedTitle: { opacity: 0.7 },
  meta: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 4 },
  typeChip: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
  },
  typeLabel: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.semibold,
    letterSpacing: 0.2,
  },
  metaDivider: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#4A4A6A',
  },
  metaText: { marginLeft: 1 },
  completedDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
