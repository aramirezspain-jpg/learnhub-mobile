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

type FilterKey = 'todos' | 'destacados' | 'expirados' | AnnouncementCategory;

const FILTERS: { key: FilterKey; label: string; icon: string; color: string }[] = [
  { key: 'todos',      label: 'Todos',      icon: 'grid-outline',     color: Colors.primary },
  { key: 'destacados', label: 'Destacados', icon: 'star-outline',     color: Colors.accent },
  { key: 'evento',     label: 'Eventos',    icon: 'calendar-outline', color: Colors.info },
  { key: 'ayuno',      label: 'Ayunos',     icon: 'flame-outline',    color: Colors.error },
  { key: 'campana',    label: 'Campañas',   icon: 'heart-outline',    color: Colors.secondary },
  { key: 'actividad',  label: 'Actividades',icon: 'people-outline',   color: Colors.success },
  { key: 'expirados',  label: 'Anteriores', icon: 'archive-outline',  color: Colors.primary },
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
    if (filter === 'expirados') {
      return announcements.filter(a => a.estado === 'expirado');
    }
    if (filter === 'destacados') {
      return announcements.filter(a => a.estado === 'destacado');
    }
    // Base: activo + destacado
    const base = announcements.filter(a => a.estado === 'activo' || a.estado === 'destacado');
    if (filter === 'todos') {
      return [...base].sort((a, b) => {
        if (a.estado === 'destacado' && b.estado !== 'destacado') return -1;
        if (b.estado === 'destacado' && a.estado !== 'destacado') return 1;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
    }
    return base.filter(a => a.categoria === (filter as AnnouncementCategory));
  }, [announcements, filter]);

  const counts = useMemo(() => ({
    destacados: announcements.filter(a => a.estado === 'destacado').length,
    unread: announcements.filter(a => a.estado !== 'expirado' && !readIds.includes(a.id)).length,
    expirados: announcements.filter(a => a.estado === 'expirado').length,
  }), [announcements, readIds]);

  const showExpiredSection = filter === 'todos' && counts.expirados > 0;

  const handlePress = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
    if (!readIds.includes(id)) markAsRead(id);
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
        <View style={styles.headerBadges}>
          {counts.destacados > 0 && (
            <View style={[styles.badge, { backgroundColor: `${Colors.accent}18` }]}>
              <Ionicons name="star" size={10} color={Colors.accent} />
              <Typography style={{ color: Colors.accent, fontSize: 10, fontWeight: '700' }}>
                {counts.destacados}
              </Typography>
            </View>
          )}
          {counts.unread > 0 && (
            <View style={[styles.badge, { backgroundColor: `${Colors.error}18` }]}>
              <Typography style={{ color: Colors.error, fontSize: 10, fontWeight: '700' }}>
                {counts.unread} sin leer
              </Typography>
            </View>
          )}
        </View>
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
                { backgroundColor: isActive ? f.color : `${f.color}10`, borderColor: isActive ? f.color : 'transparent' },
              ]}
              onPress={() => setFilter(f.key)}
              activeOpacity={0.8}
            >
              <Ionicons name={f.icon as any} size={12} color={isActive ? '#FFF' : f.color} />
              <Typography style={{ color: isActive ? '#FFF' : f.color, fontSize: FontSizes.xs, fontWeight: '600' }}>
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

        {/* Sección de anuncios expirados (solo en "Todos") */}
        {showExpiredSection && (
          <View style={styles.expiredSection}>
            <View style={styles.dividerRow}>
              <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
              <Typography variant="caption" muted style={{ paddingHorizontal: 10 }}>
                Anuncios anteriores · {counts.expirados}
              </Typography>
              <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
            </View>
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
          <Typography variant="caption" muted style={{ flex: 1 }}>
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
  headerBadges: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 40,
  },
  expiredSection: { marginTop: Spacing.md },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: Spacing.md },
  dividerLine: { flex: 1, height: 1, borderRadius: 1 },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.lg,
  },
});
