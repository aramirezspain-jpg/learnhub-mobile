import React, { useState, useMemo } from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Spacing, BorderRadius, Shadows, FontSizes } from '@/constants/theme';
import { Typography } from '@/components/ui/Typography';
import { EmptyState } from '@/components/ui/EmptyState';
import { useNotifications } from '@/hooks/useNotifications';
import type { NotificationType } from '@/types/notifications';

type FilterKey = 'todos' | NotificationType;

const TYPE_CONFIG: Record<NotificationType, { label: string; icon: string; color: string }> = {
  anuncio:  { label: 'Anuncio',   icon: 'megaphone',        color: Colors.primary },
  horario:  { label: 'Horario',   icon: 'calendar',         color: Colors.success },
  evento:   { label: 'Evento',    icon: 'star',             color: Colors.accent },
  curso:    { label: 'Curso',     icon: 'book',             color: Colors.secondary },
  sistema:  { label: 'Sistema',   icon: 'information-circle', color: Colors.info },
};

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'todos',    label: 'Todos' },
  { key: 'anuncio',  label: 'Anuncios' },
  { key: 'horario',  label: 'Horarios' },
  { key: 'curso',    label: 'Cursos' },
  { key: 'sistema',  label: 'Sistema' },
];

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return 'Ahora';
  if (mins < 60) return `Hace ${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `Hace ${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7)  return `Hace ${days}d`;
  return new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}

export default function NotificationsScreen() {
  const router = useRouter();
  const scheme = useColorScheme() ?? 'dark';
  const theme = Colors[scheme];
  const { notifications, unreadCount, permissionsGranted, requestPermissions, markRead, markAllRead, remove } = useNotifications();

  const [filter, setFilter] = useState<FilterKey>('todos');

  const filtered = useMemo(() => {
    if (filter === 'todos') return notifications;
    return notifications.filter(n => n.tipo === filter);
  }, [notifications, filter]);

  const handlePress = async (id: string, ruta?: string) => {
    await markRead(id);
    if (ruta) router.push(ruta as never);
  };

  const handleDelete = (id: string) => {
    Alert.alert('Eliminar', '¿Eliminar esta notificación?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => remove(id) },
    ]);
  };

  const handleMarkAll = () => {
    if (unreadCount === 0) return;
    markAllRead();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color={theme.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Typography variant="overline" secondary>Centro</Typography>
          <Typography variant="h2" style={{ color: theme.text }}>Notificaciones</Typography>
        </View>
        <View style={styles.headerRight}>
          {unreadCount > 0 && (
            <View style={[styles.unreadBadge, { backgroundColor: `${Colors.error}18` }]}>
              <Typography style={{ color: Colors.error, fontSize: 11, fontWeight: '700' }}>
                {unreadCount} nuevas
              </Typography>
            </View>
          )}
          {unreadCount > 0 && (
            <TouchableOpacity
              style={[styles.markAllBtn, { backgroundColor: `${Colors.primary}15` }]}
              onPress={handleMarkAll}
              activeOpacity={0.8}
            >
              <Ionicons name="checkmark-done" size={16} color={Colors.primary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Permisos banner */}
      {!permissionsGranted && (
        <TouchableOpacity
          style={[styles.permBanner, { backgroundColor: `${Colors.warning}15`, borderColor: `${Colors.warning}30` }]}
          onPress={requestPermissions}
          activeOpacity={0.85}
        >
          <Ionicons name="notifications-off-outline" size={16} color={Colors.warning} />
          <Typography style={{ color: Colors.warning, fontSize: FontSizes.sm, fontWeight: '600', flex: 1 }}>
            Activa las notificaciones para recibir alertas
          </Typography>
          <Ionicons name="chevron-forward" size={14} color={Colors.warning} />
        </TouchableOpacity>
      )}

      {/* Filtros */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersRow}
        style={styles.filtersScroll}
      >
        {FILTERS.map(f => {
          const active = filter === f.key;
          const color = f.key === 'todos' ? Colors.primary : TYPE_CONFIG[f.key as NotificationType]?.color ?? Colors.primary;
          const count = f.key === 'todos'
            ? notifications.filter(n => !n.leida).length
            : notifications.filter(n => n.tipo === f.key && !n.leida).length;
          return (
            <TouchableOpacity
              key={f.key}
              style={[styles.filterChip, { backgroundColor: active ? color : `${color}12`, borderColor: active ? color : 'transparent' }]}
              onPress={() => setFilter(f.key)}
              activeOpacity={0.8}
            >
              <Typography style={{ color: active ? '#FFF' : color, fontSize: FontSizes.xs, fontWeight: '600' }}>
                {f.label}
              </Typography>
              {count > 0 && (
                <View style={[styles.chipBadge, { backgroundColor: active ? 'rgba(255,255,255,0.3)' : `${color}25` }]}>
                  <Typography style={{ color: active ? '#FFF' : color, fontSize: 9, fontWeight: '800' }}>{count}</Typography>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Lista */}
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {filtered.length === 0 ? (
          <EmptyState
            icon="notifications-outline"
            title="Sin notificaciones"
            subtitle={filter === 'todos' ? 'Las notificaciones aparecerán aquí.' : `No hay notificaciones de tipo "${FILTERS.find(f => f.key === filter)?.label}".`}
            color={Colors.primary}
          />
        ) : (
          filtered.map(notif => {
            const cfg = TYPE_CONFIG[notif.tipo];
            return (
              <TouchableOpacity
                key={notif.id}
                style={[
                  styles.notifCard,
                  { backgroundColor: notif.leida ? theme.card : `${cfg.color}0D` },
                  !notif.leida && { borderColor: `${cfg.color}25`, borderWidth: 1 },
                  Shadows.sm,
                ]}
                onPress={() => handlePress(notif.id, notif.ruta)}
                activeOpacity={0.85}
              >
                {/* Accent lateral */}
                <View style={[styles.accent, { backgroundColor: notif.leida ? theme.border : cfg.color }]} />

                <View style={styles.iconCol}>
                  <View style={[styles.iconCircle, { backgroundColor: `${cfg.color}${notif.leida ? '12' : '20'}` }]}>
                    <Ionicons
                      name={`${cfg.icon}${notif.leida ? '-outline' : ''}` as any}
                      size={18}
                      color={notif.leida ? theme.textMuted : cfg.color}
                    />
                  </View>
                </View>

                <View style={styles.body}>
                  <View style={styles.bodyHeader}>
                    <View style={[styles.typeBadge, { backgroundColor: `${cfg.color}15` }]}>
                      <Typography style={{ color: cfg.color, fontSize: 9, fontWeight: '700', textTransform: 'uppercase' }}>
                        {cfg.label}
                      </Typography>
                    </View>
                    <Typography variant="caption" muted style={{ fontSize: 10 }}>
                      {timeAgo(notif.created_at)}
                    </Typography>
                  </View>
                  <Typography
                    variant="label"
                    style={{ color: notif.leida ? theme.textSecondary : theme.text }}
                    numberOfLines={1}
                  >
                    {notif.titulo}
                  </Typography>
                  <Typography
                    variant="caption"
                    secondary
                    numberOfLines={2}
                    style={{ lineHeight: 17, opacity: notif.leida ? 0.6 : 1 }}
                  >
                    {notif.cuerpo}
                  </Typography>
                </View>

                {/* Acciones */}
                <View style={styles.actions}>
                  {!notif.leida && <View style={[styles.unreadDot, { backgroundColor: cfg.color }]} />}
                  {notif.ruta && (
                    <Ionicons name="chevron-forward" size={14} color={theme.textMuted} />
                  )}
                  <TouchableOpacity
                    onPress={() => handleDelete(notif.id)}
                    style={styles.deleteBtn}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name="trash-outline" size={13} color={theme.textMuted} />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })
        )}

        {notifications.length > 0 && (
          <View style={[styles.footer, { backgroundColor: theme.card }]}>
            <Ionicons name="information-circle-outline" size={14} color={theme.textMuted} />
            <Typography variant="caption" muted style={{ flex: 1 }}>
              Las notificaciones se guardan localmente en tu dispositivo.
            </Typography>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: Spacing.md, gap: Spacing.sm,
  },
  backBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  unreadBadge: {
    paddingHorizontal: 9, paddingVertical: 4, borderRadius: BorderRadius.full,
  },
  markAllBtn: {
    width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center',
  },
  permBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginHorizontal: Spacing.lg, marginBottom: Spacing.sm,
    padding: Spacing.md, borderRadius: BorderRadius.lg, borderWidth: 1,
  },
  filtersScroll: { flexGrow: 0 },
  filtersRow: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.md, gap: 8 },
  filterChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: BorderRadius.full, borderWidth: 1,
  },
  chipBadge: {
    minWidth: 16, height: 16, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3,
  },
  content: { paddingHorizontal: Spacing.lg, paddingBottom: 40, gap: 8 },
  notifCard: {
    flexDirection: 'row', borderRadius: BorderRadius.lg,
    overflow: 'hidden', alignItems: 'stretch',
  },
  accent: { width: 3 },
  iconCol: {
    paddingVertical: 14, paddingLeft: 12, paddingRight: 4,
    alignItems: 'center', justifyContent: 'flex-start', paddingTop: 16,
  },
  iconCircle: {
    width: 38, height: 38, borderRadius: 19,
    alignItems: 'center', justifyContent: 'center',
  },
  body: { flex: 1, paddingVertical: 12, paddingLeft: 8, paddingRight: 4, gap: 4 },
  bodyHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  typeBadge: {
    paddingHorizontal: 7, paddingVertical: 2, borderRadius: BorderRadius.full,
  },
  actions: {
    paddingVertical: 12, paddingRight: 10, paddingLeft: 4,
    alignItems: 'center', justifyContent: 'space-between',
    gap: 8,
  },
  unreadDot: { width: 7, height: 7, borderRadius: 4 },
  deleteBtn: { padding: 2 },
  footer: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    padding: Spacing.md, borderRadius: BorderRadius.lg, marginTop: 8,
  },
});
