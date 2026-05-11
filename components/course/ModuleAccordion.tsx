import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { Typography } from '@/components/ui/Typography';
import { LessonItem } from './LessonItem';
import { type Module } from '@/types';

interface ModuleAccordionProps {
  module: Module;
  courseId: string;
  defaultOpen?: boolean;
  completedLessonIds: Set<string>;
  onLessonPress: (lessonId: string) => void;
}

export function ModuleAccordion({
  module,
  courseId,
  defaultOpen = false,
  completedLessonIds,
  onLessonPress,
}: ModuleAccordionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const scheme = useColorScheme() ?? 'dark';
  const theme = Colors[scheme];

  const completed = module.lecciones.filter(l => completedLessonIds.has(l.id)).length;
  const total = module.lecciones.length;
  const allDone = completed === total && total > 0;

  return (
    <View style={[styles.container, { backgroundColor: theme.card }, Shadows.sm]}>
      {/* Header del módulo */}
      <TouchableOpacity
        style={styles.header}
        onPress={() => setOpen(o => !o)}
        activeOpacity={0.8}
      >
        <View style={[styles.moduleIcon, { backgroundColor: `${Colors.primary}20` }]}>
          <Ionicons
            name={allDone ? 'checkmark-circle' : (module.icono as React.ComponentProps<typeof Ionicons>['name']) || 'book-outline'}
            size={20}
            color={allDone ? Colors.success : Colors.primary}
          />
        </View>

        <View style={styles.headerText}>
          <Typography variant="h4" style={{ color: theme.text }} numberOfLines={1}>
            {module.titulo}
          </Typography>
          <Typography variant="caption" secondary>
            {completed}/{total} lecciones
          </Typography>
        </View>

        <Ionicons
          name={open ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={theme.textSecondary}
        />
      </TouchableOpacity>

      {/* Lista de lecciones */}
      {open && (
        <View style={[styles.lessons, { borderTopColor: theme.border }]}>
          {module.lecciones.map(lesson => (
            <LessonItem
              key={lesson.id}
              lesson={lesson}
              courseId={courseId}
              isCompleted={completedLessonIds.has(lesson.id)}
              onPress={() => onLessonPress(lesson.id)}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: 12,
  },
  moduleIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: { flex: 1 },
  lessons: { borderTopWidth: StyleSheet.hairlineWidth },
});
