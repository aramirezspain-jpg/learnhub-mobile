import React, { useState, useMemo, useRef } from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet, TextInput, LayoutAnimation, Platform, UIManager } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Spacing, BorderRadius, FontSizes, FontWeights } from '@/constants/theme';
import { Typography } from '@/components/ui/Typography';
import { CourseCard } from '@/components/course/CourseCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { useCourses } from '@/hooks/useCourses';
import { useProgressStore } from '@/store/progress.store';
import { ContentService } from '@/services/content.service';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const FILTER_ALL = 'all';

export default function CoursesScreen() {
  const router = useRouter();
  const scheme = useColorScheme() ?? 'dark';
  const theme = Colors[scheme];
  const { courses, levels } = useCourses();
  const getCourseProgress = useProgressStore(s => s.getCourseProgress);
  const getCompletedCount = useProgressStore(s => s.getCompletedCountForCourse);
  const [activeFilter, setActiveFilter] = useState(FILTER_ALL);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef<TextInput>(null);

  const filters = [{ id: FILTER_ALL, nombre: 'Todos', color: Colors.primary }, ...levels];

  const filteredCourses = useMemo(() => {
    let list = activeFilter === FILTER_ALL
      ? courses
      : courses.filter(c => c.nivel_id === activeFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(c =>
        c.titulo.toLowerCase().includes(q) ||
        c.subtitulo.toLowerCase().includes(q) ||
        c.descripcion.toLowerCase().includes(q)
      );
    }
    return list;
  }, [courses, activeFilter, searchQuery]);

  const toggleSearch = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (showSearch) {
      setSearchQuery('');
      setShowSearch(false);
    } else {
      setShowSearch(true);
      setTimeout(() => searchRef.current?.focus(), 120);
    }
  };

  const emptyTitle = searchQuery.trim()
    ? 'Sin resultados'
    : 'Sin cursos en este nivel';
  const emptySubtitle = searchQuery.trim()
    ? `No encontramos cursos que coincidan con "${searchQuery.trim()}".`
    : 'Prueba otro filtro o explora todos los cursos disponibles.';
  const emptyIcon = searchQuery.trim() ? 'search-outline' : 'book-outline';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Typography variant="overline" secondary>Instituto LearnHub</Typography>
          <Typography variant="h1" style={{ color: theme.text }}>Cursos</Typography>
        </View>
        <TouchableOpacity
          style={[styles.headerIcon, { backgroundColor: showSearch ? `${Colors.primary}22` : `${Colors.primary}12` }]}
          activeOpacity={0.7}
          onPress={toggleSearch}
        >
          <Ionicons name={showSearch ? 'close' : 'search-outline'} size={22} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Barra de búsqueda */}
      {showSearch && (
        <View style={[styles.searchRow, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
          <Ionicons name="search-outline" size={18} color={theme.textMuted} />
          <TextInput
            ref={searchRef}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Buscar cursos..."
            placeholderTextColor={theme.textMuted}
            style={[styles.searchInput, { color: theme.text }]}
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={theme.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Filtros */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersScroll}
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
        keyboardShouldPersistTaps="handled"
      >
        {filteredCourses.length === 0 ? (
          <EmptyState
            icon={emptyIcon}
            title={emptyTitle}
            subtitle={emptySubtitle}
            action={searchQuery.trim() ? 'Limpiar búsqueda' : undefined}
            onAction={searchQuery.trim() ? () => setSearchQuery('') : undefined}
          />
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
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: FontSizes.md,
    paddingVertical: 0,
  },
  filtersScroll: {
    flexGrow: 0,
    flexShrink: 0,
  },
  filters: {
    paddingHorizontal: Spacing.lg,
    paddingTop: 4,
    paddingBottom: Spacing.sm,
    gap: 8,
    alignItems: 'center',
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
});
