import React, { useState, useMemo } from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Spacing, BorderRadius, Shadows, FontSizes } from '@/constants/theme';
import { Typography } from '@/components/ui/Typography';
import { EmptyState } from '@/components/ui/EmptyState';
import { AnnouncementCard } from '@/components/community/AnnouncementCard';
import { useCommunityStore } from '@/store/community.store';
import { useCommunity } from '@/hooks/useCommunity';
import type { AnnouncementCategory } from '@/types/community';

type FilterKey = 'todos' | AnnouncementCategory;

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'todos', label: 'Todos' },
  { key: 'evento', label: 'Eventos' },
  { key: 'ayuno', label: 'Ayunos' },
  { key: 'campana', label: 'Campañas' },
  { key: 'actividad', label: 'Actividades' },
  { key: 'general', label: 'General' },
];

export default function AnnouncementsScreen() {
  const router = useRouter();
  const scheme = useColorScheme() ?? 'dark';
  const theme = Colors[scheme];
  const [filter, setFilter] = useState<FilterKey>('todos');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const announcements = useCommunityStore(s => s.announcements);
  const readIds = useCommunityStore(s => s.readAnnouncementIds);
  const { markAsRead } = useCommunity();

  const filtered = useMemo(() => {
    const active = announcements.filter(a => a.estado === 'activo');
    if (filter === 'todos') return active;
    return active.filter(a => a.categoria === filter);
  }, [announcements, filter]);

  const unreadCount = useMemo(
    () => announcements.filter(a => a.estado === 'activo' && !readIds.includes(a.id)).length,
    [announcements, readIds]
  );

  const handlePress = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
    if (!readIds.includes(id)) {
      markAsRead(id);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color={theme.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Typography variant="overline" secondary>Iglesia</Typography>
          <Typography variant="h2" style={{ color: theme.text }}>Cartelera</Typography>
        </View>
        {unreadCount > 0 && (
          <View style={[styles.unreadBadge, { backgroundColor: `${Colors.error}20` }]}>
            <Typography style={{ color: Colors.error, fontSize: 11, fontWeight: '700' }}>
              {unreadCount} sin leer
            </Typography>
          </View>
        )}
      </View>

      {/* Filtros */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersRow}
        style={styles.filtersScroll}
      >
        {FILTERS.map(f => {
          const isActive = filter === f.key;
          return (
            <TouchableOpacity
              key={f.key}
              style={[
                styles.filterChip,
                { backgroundColor: isActive ? Colors.error : theme.surface, borderColor: isActive ? Colors.error : theme.border },
              ]}
              onPress={() => setFilter(f.key)}
              activeOpacity={0.8}
            >
              <Typography
                variant="caption"
                style={{ color: isActive ? '#FFF' : theme.textSecondary, fontWeight: '600', fontSize: FontSizes.xs }}
              >
                {f.label}
              </Typography>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Contenido */}
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {filtered.length === 0 ? (
          <EmptyState
            icon="megaphone-outline"
            title="Sin anuncios"
            subtitle="No hay anuncios en esta categoría por ahora."
            color={Colors.error}
          />
        ) : (
          filtered.map(ann => (
            <AnnouncementCard
              key={ann.id}
              announcement={ann}
              onPress={() => handlePress(ann.id)}
              isRead={readIds.includes(ann.id)}
              expanded={expandedId === ann.id}
            />
          ))
        )}

        {/* Expirados */}
        {filter === 'todos' && announcements.some(a => a.estado === 'expirado') && (
          <View style={styles.expiredSection}>
            <View style={[styles.expiredDivider, { backgroundColor: theme.border }]} />
            <Typography variant="caption" muted style={{ textAlign: 'center', paddingVertical: 8 }}>
              Anuncios anteriores
            </Typography>
            <View style={[styles.expiredDivider, { backgroundColor: theme.border }]} />
            {announcements
              .filter(a => a.estado === 'expirado')
              .map(ann => (
                <AnnouncementCard
                  key={ann.id}
                  announcement={ann}
                  onPress={() => handlePress(ann.id)}
                  isRead
                  expanded={expandedId === ann.id}
                />
              ))}
          </View>
        )}

        <View style={[styles.footer, { backgroundColor: theme.card }]}>
          <Ionicons name="information-circle-outline" size={14} color={theme.textMuted} />
          <Typography variant="caption" muted>
            Los anuncios son gestionados por el equipo pastoral
          </Typography>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
  },
  filtersScroll: { flexGrow: 0 },
  filtersRow: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 40,
  },
  expiredSection: { marginTop: Spacing.md, gap: 0 },
  expiredDivider: { height: 1, borderRadius: 1 },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.lg,
  },
});
