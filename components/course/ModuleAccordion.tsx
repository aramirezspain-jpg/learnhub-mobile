import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { Typography } from '@/components/ui/Typography';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { LessonItem } from './LessonItem';
import { type Module } from '@/types';

interface ModuleAccordionProps {
  module: Module;
  courseId: string;
  accentColor?: string;
  defaultOpen?: boolean;
  completedLessonIds: Set<string>;
  isLocked?: boolean;
  onLessonPress: (lessonId: string) => void;
}

export function ModuleAccordion({
  module,
  courseId,
  accentColor,
  defaultOpen = false,
  completedLessonIds,
  isLocked = false,
  onLessonPress,
}: ModuleAccordionProps) {
  const [open, setOpen] = useState(defaultOpen && !isLocked);
  const scheme = useColorScheme() ?? 'dark';
  const theme = Colors[scheme];

  const color = accentColor ?? Colors.primary;
  const completed = module.lecciones.filter(l => completedLessonIds.has(l.id)).length;
  const total = module.lecciones.length;
  const allDone = completed === total && total > 0;
  const progressPct = total > 0 ? (completed / total) * 100 : 0;

  if (isLocked) {
    return (
      <View
        style={[
          styles.container,
          styles.lockedContainer,
          { backgroundColor: theme.card, borderColor: theme.border },
        ]}
      >
        <View style={styles.header}>
          <View style={[styles.moduleIcon, { backgroundColor: theme.border }]}>
            <Ionicons name="lock-closed-outline" size={18} color={theme.textMuted} />
          </View>
          <View style={styles.headerText}>
            <Typography variant="label" style={{ color: theme.textMuted }} numberOfLines={1}>
              {module.titulo}
            </Typography>
            <Typography variant="caption" muted>
              Completa el módulo anterior para desbloquear
            </Typography>
          </View>
          <Ionicons name="lock-closed" size={14} color={theme.textMuted} />
        </View>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.card,
          borderColor: open ? `${color}30` : theme.border,
          borderWidth: open ? 1.5 : StyleSheet.hairlineWidth,
        },
      ]}
    >
      {/* Header */}
      <TouchableOpacity
        style={styles.header}
        onPress={() => setOpen(o => !o)}
        activeOpacity={0.75}
      >
        <View
          style={[
            styles.moduleIcon,
            {
              backgroundColor: allDone
                ? `${Colors.success}18`
                : open
                ? `${color}18`
                : `${color}10`,
            },
          ]}
        >
          <Ionicons
            name={
              allDone
                ? 'checkmark-circle'
                : (module.icono as React.ComponentProps<typeof Ionicons>['name']) || 'book-outline'
            }
            size={20}
            color={allDone ? Colors.success : color}
          />
        </View>

        <View style={styles.headerText}>
          <Typography variant="h4" style={{ color: theme.text }} numberOfLines={1}>
            {module.titulo}
          </Typography>
          <View style={styles.headerMeta}>
            {allDone ? (
              <View style={[styles.donePill, { backgroundColor: `${Colors.success}18` }]}>
                <Ionicons name="checkmark-circle" size={11} color={Colors.success} />
                <Typography variant="caption" color={Colors.success} style={styles.donePillText}>
                  Completado
                </Typography>
              </View>
            ) : (
              <Typography variant="caption" secondary>
                {completed}/{total} lecciones
              </Typography>
            )}
          </View>
          {!allDone && progressPct > 0 && (
            <View style={styles.moduleProgress}>
              <ProgressBar
                progress={progressPct}
                color={color}
                trackColor={`${color}18`}
                height={3}
              />
            </View>
          )}
        </View>

        <Ionicons
          name={open ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={open ? color : theme.textSecondary}
        />
      </TouchableOpacity>

      {/* Lessons */}
      {open && (
        <View style={[styles.lessons, { borderTopColor: theme.border }]}>
          {module.lecciones.map(lesson => (
            <LessonItem
              key={lesson.id}
              lesson={lesson}
              courseId={courseId}
              accentColor={color}
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
  lockedContainer: { opacity: 0.5 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: 12,
  },
  moduleIcon: {
    width: 42,
    height: 42,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  headerText: { flex: 1, gap: 4 },
  headerMeta: { flexDirection: 'row', alignItems: 'center' },
  moduleProgress: { marginTop: 4 },
  donePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  donePillText: { fontSize: 10, fontWeight: '600' },
  lessons: { borderTopWidth: StyleSheet.hairlineWidth },
});
