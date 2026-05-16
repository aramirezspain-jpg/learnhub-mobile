import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Spacing, BorderRadius, FontSizes, FontWeights } from '@/constants/theme';
import { Typography } from '@/components/ui/Typography';
import { CourseCard } from '@/components/course/CourseCard';
import { useCourses } from '@/hooks/useCourses';
import { useProgressStore } from '@/store/progress.store';
import { ContentService } from '@/services/content.service';

const FILTER_ALL = 'all';

export default function CoursesScreen() {
  const router = useRouter();
  const scheme = useColorScheme() ?? 'dark';
  const theme = Colors[scheme];
  const { courses, levels } = useCourses();
  const getCourseProgress = useProgressStore(s => s.getCourseProgress);
  const getCompletedCount = useProgressStore(s => s.getCompletedCountForCourse);
  const [activeFilter, setActiveFilter] = useState(FILTER_ALL);

  const filters = [{ id: FILTER_ALL, nombre: 'Todos', color: Colors.primary }, ...levels];

  const filteredCourses = activeFilter === FILTER_ALL
    ? courses
    : courses.filter(c => c.nivel_id === activeFilter);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Typography variant="overline" secondary>Instituto LearnHub</Typography>
          <Typography variant="h1" style={{ color: theme.text }}>Cursos</Typography>
        </View>
        <TouchableOpacity
          style={[styles.headerIcon, { backgroundColor: `${Colors.primary}15` }]}
          activeOpacity={0.7}
          onPress={() => Alert.alert('Búsqueda', 'La búsqueda de cursos estará disponible pronto.')}
        >
          <Ionicons name="search-outline" size={22} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Filtros */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filters}
      >
        {filters.map(f => {
          const active = activeFilter === f.id;
          return (
            <TouchableOpacity
              key={f.id}
              style={[
                styles.filterChip,
                { borderColor: f.color },
                active && { backgroundColor: f.color },
              ]}
              onPress={() => setActiveFilter(f.id)}
              activeOpacity={0.7}
            >
              <Typography
                variant="label"
                color={active ? '#FFF' : f.color}
                style={{ fontSize: 13, lineHeight: 17, fontWeight: FontWeights.semibold, letterSpacing: 0.2 }}
              >
                {f.nombre}
              </Typography>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Lista de cursos */}
      <ScrollView
        style={styles.list}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      >
        {filteredCourses.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="book-outline" size={48} color={theme.textMuted} />
            <Typography variant="h3" muted center style={{ marginTop: 12 }}>
              No hay cursos en este nivel aún
            </Typography>
            <Typography variant="body" muted center style={{ marginTop: 6 }}>
              Estamos preparando más contenido. ¡Vuelve pronto!
            </Typography>
          </View>
        ) : (
          filteredCourses.map(course => {
            const total = ContentService.getTotalLessons(course.id);
            const prog = getCourseProgress(course.id, total);
            const completed = getCompletedCount(course.id);
            return (
              <CourseCard
                key={course.id}
                course={course}
                progressPercent={prog.progress_percent}
                completedLessons={completed}
                onPress={() => router.push({ pathname: '/course/[id]', params: { id: course.id } })}
              />
            );
          })
        )}

        {/* Próximamente */}
        <View style={[styles.comingSoon, { backgroundColor: theme.card }]}>
          <Ionicons name="time-outline" size={24} color={theme.textMuted} />
          <View style={{ flex: 1 }}>
            <Typography variant="label" secondary>Próximamente</Typography>
            <Typography variant="caption" muted>
              Más cursos de Formación Teológica y Apologética estarán disponibles en la siguiente fase.
            </Typography>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filters: {
    paddingHorizontal: Spacing.lg,
    paddingTop: 4,
    paddingBottom: Spacing.sm,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: { flex: 1 },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 32,
  },
  empty: { alignItems: 'center', paddingVertical: 60 },
  comingSoon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginTop: 8,
  },
});
