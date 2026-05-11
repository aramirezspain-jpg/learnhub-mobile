import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { Typography } from '@/components/ui/Typography';
import { type Lesson } from '@/types';

interface LessonItemProps {
  lesson: Lesson;
  courseId: string;
  isCompleted: boolean;
  isLocked?: boolean;
  onPress?: () => void;
}

const TYPE_ICON: Record<string, React.ComponentProps<typeof Ionicons>['name']> = {
  lectura: 'document-text-outline',
  video: 'play-circle-outline',
  audio: 'headset-outline',
  pdf: 'reader-outline',
  practica: 'pencil-outline',
};

export function LessonItem({
  lesson,
  isCompleted,
  isLocked = false,
  onPress,
}: LessonItemProps) {
  const scheme = useColorScheme() ?? 'dark';
  const theme = Colors[scheme];

  const iconName: React.ComponentProps<typeof Ionicons>['name'] = isCompleted
    ? 'checkmark-circle'
    : isLocked
    ? 'lock-closed-outline'
    : (TYPE_ICON[lesson.tipo] ?? 'document-text-outline');

  const iconColor = isCompleted
    ? Colors.success
    : isLocked
    ? theme.textMuted
    : Colors.primary;

  return (
    <TouchableOpacity
      style={[styles.item, { borderBottomColor: theme.border }]}
      onPress={onPress}
      disabled={isLocked}
      activeOpacity={0.7}
    >
      <View style={[styles.iconWrap, { backgroundColor: `${iconColor}15` }]}>
        <Ionicons name={iconName} size={18} color={iconColor} />
      </View>

      <View style={styles.text}>
        <Typography
          variant="label"
          color={isLocked ? theme.textMuted : theme.text}
          numberOfLines={1}
        >
          {lesson.titulo}
        </Typography>
        <View style={styles.meta}>
          <Ionicons name="time-outline" size={11} color={theme.textMuted} />
          <Typography variant="caption" muted style={{ marginLeft: 3 }}>
            {lesson.duracion_minutos} min
          </Typography>
          {lesson.quiz && (
            <>
              <Typography variant="caption" muted style={{ marginHorizontal: 4 }}>·</Typography>
              <Ionicons name="help-circle-outline" size={11} color={theme.textMuted} />
              <Typography variant="caption" muted style={{ marginLeft: 3 }}>
                {lesson.quiz.preguntas.length} preguntas
              </Typography>
            </>
          )}
        </View>
      </View>

      {!isLocked && (
        <Ionicons
          name="chevron-forward"
          size={16}
          color={theme.textMuted}
        />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { flex: 1, gap: 3 },
  meta: { flexDirection: 'row', alignItems: 'center' },
});
