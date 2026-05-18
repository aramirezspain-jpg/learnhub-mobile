import React, { useState, useMemo } from 'react';
import { View, ScrollView, TouchableOpacity, Linking, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Spacing, BorderRadius, Shadows, FontSizes } from '@/constants/theme';
import { Typography } from '@/components/ui/Typography';
import { EmptyState } from '@/components/ui/EmptyState';
import { useCommunityStore } from '@/store/community.store';
import type { CommunityResourceType } from '@/types/community';

type FilterKey = 'todos' | CommunityResourceType;

const FILTERS: { key: FilterKey; label: string; icon: string; color: string }[] = [
  { key: 'todos', label: 'Todos', icon: 'grid-outline', color: Colors.primary },
  { key: 'sermon', label: 'Sermones', icon: 'mic-outline', color: Colors.error },
  { key: 'pdf', label: 'PDFs', icon: 'document-text-outline', color: Colors.accent },
  { key: 'recurso', label: 'Recursos', icon: 'archive-outline', color: Colors.secondary },
  { key: 'enlace', label: 'Enlaces', icon: 'link-outline', color: Colors.info },
];

const RESOURCE_COLOR: Record<CommunityResourceType, string> = {
  sermon: Colors.error,
  pdf: Colors.accent,
  recurso: Colors.secondary,
  enlace: Colors.info,
};

const RESOURCE_ICON: Record<CommunityResourceType, string> = {
  sermon: 'mic-outline',
  pdf: 'document-text-outline',
  recurso: 'archive-outline',
  enlace: 'link-outline',
};

const RESOURCE_LABEL: Record<CommunityResourceType, string> = {
  sermon: 'Sermón',
  pdf: 'PDF',
  recurso: 'Recurso',
  enlace: 'Enlace',
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' });
}

export default function CommunityLibraryScreen() {
  const router = useRouter();
  const scheme = useColorScheme() ?? 'dark';
  const theme = Colors[scheme];
  const [filter, setFilter] = useState<FilterKey>('todos');

  const library = useCommunityStore(s => s.library);

  const filtered = useMemo(() => {
    if (filter === 'todos') return library;
    return library.filter(r => r.tipo === filter);
  }, [library, filter]);

  const categories = useMemo(() => {
    const cats = new Set(library.map(r => r.categoria));
    return Array.from(cats);
  }, [library]);

  const openLink = (url?: string) => {
    if (!url) return;
    Linking.openURL(url).catch(() => {});
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
          <Typography variant="h2" style={{ color: theme.text }}>Biblioteca</Typography>
        </View>
        <View style={[styles.countBadge, { backgroundColor: `${Colors.secondary}15` }]}>
          <Typography style={{ color: Colors.secondary, fontSize: 11, fontWeight: '700' }}>
            {library.length} recursos
          </Typography>
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

      {/* Lista */}
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {filtered.length === 0 ? (
          <EmptyState
            icon="folder-open-outline"
            title="Sin recursos"
            subtitle="No hay recursos en esta categoría por ahora."
            color={Colors.secondary}
          />
        ) : (
          filtered.map(res => {
            const color = RESOURCE_COLOR[res.tipo];
            const isLink = res.tipo === 'enlace';
            return (
              <TouchableOpacity
                key={res.id}
                style={[styles.card, { backgroundColor: theme.card }, Shadows.sm]}
                onPress={() => isLink ? openLink(res.url) : undefined}
                activeOpacity={isLink ? 0.85 : 1}
              >
                {/* Icono */}
                <View style={[styles.iconBox, { backgroundColor: `${color}15` }]}>
                  <Ionicons name={RESOURCE_ICON[res.tipo] as any} size={22} color={color} />
                </View>

                {/* Contenido */}
                <View style={styles.cardContent}>
                  <View style={styles.cardHeader}>
                    <View style={[styles.typeBadge, { backgroundColor: `${color}12` }]}>
                      <Typography style={{ color, fontSize: 9, fontWeight: '700', textTransform: 'uppercase' }}>
                        {RESOURCE_LABEL[res.tipo]}
                      </Typography>
                    </View>
                    <Typography variant="caption" muted style={{ fontSize: 10 }}>
                      {formatDate(res.fecha)}
                    </Typography>
                  </View>

                  <Typography variant="label" style={{ color: theme.text }} numberOfLines={2}>
                    {res.titulo}
                  </Typography>

                  {res.descripcion ? (
                    <Typography variant="caption" secondary numberOfLines={2} style={{ lineHeight: 17 }}>
                      {res.descripcion}
                    </Typography>
                  ) : null}

                  <View style={styles.cardMeta}>
                    <View style={[styles.catBadge, { backgroundColor: theme.surface }]}>
                      <Typography variant="caption" muted style={{ fontSize: 10 }}>
                        {res.categoria}
                      </Typography>
                    </View>
                    {res.autor ? (
                      <Typography variant="caption" muted style={{ fontSize: 10 }} numberOfLines={1}>
                        {res.autor}
                      </Typography>
                    ) : null}
                  </View>
                </View>

                {/* Action indicator */}
                <View style={styles.cardAction}>
                  {isLink ? (
                    <View style={[styles.actionBtn, { backgroundColor: `${Colors.info}15` }]}>
                      <Ionicons name="open-outline" size={14} color={Colors.info} />
                    </View>
                  ) : (
                    <Ionicons name="chevron-forward" size={16} color={theme.textMuted} />
                  )}
                </View>
              </TouchableOpacity>
            );
          })
        )}

        {/* Categorías */}
        {categories.length > 0 && (
          <View style={[styles.categoriesCard, { backgroundColor: theme.card }]}>
            <Typography variant="label" style={{ color: theme.text, marginBottom: 8 }}>
              Categorías disponibles
            </Typography>
            <View style={styles.categoriesRow}>
              {categories.map(cat => (
                <View key={cat} style={[styles.catTag, { backgroundColor: `${Colors.secondary}12` }]}>
                  <Typography style={{ color: Colors.secondary, fontSize: 11, fontWeight: '600' }}>
                    {cat}
                  </Typography>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={[styles.infoCard, { backgroundColor: theme.card }]}>
          <Ionicons name="information-circle-outline" size={14} color={theme.textMuted} />
          <Typography variant="caption" muted style={{ flex: 1, lineHeight: 17 }}>
            Los recursos PDFs y sermones son añadidos por el equipo pastoral. Los enlaces se abren en el navegador.
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
  countBadge: {
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 40,
    gap: 0,
  },
  card: {
    flexDirection: 'row',
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    marginBottom: 12,
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  cardContent: { flex: 1, gap: 6 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  typeBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  catBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  cardAction: {
    alignSelf: 'center',
    flexShrink: 0,
  },
  actionBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoriesCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginTop: Spacing.md,
    marginBottom: 12,
  },
  categoriesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catTag: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginTop: 4,
  },
});
