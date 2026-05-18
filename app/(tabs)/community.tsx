import React, { useMemo } from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Spacing, BorderRadius, Shadows, FontSizes } from '@/constants/theme';
import { Typography } from '@/components/ui/Typography';
import { useCommunityStore } from '@/store/community.store';
import type { Announcement, Schedule, CommunityResource } from '@/types/community';

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}

const PRIORITY_COLOR: Record<Announcement['prioridad'], string> = {
  alta: Colors.error,
  media: Colors.warning,
  baja: Colors.success,
};

const DIAS_SHORT = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

const TIPO_LABEL_SHORT: Record<Schedule['tipo'], string> = {
  culto: 'Culto',
  discipulado: 'Discipulado',
  escuela_biblica: 'Esc. Bíblica',
  reunion: 'Reunión',
  actividad: 'Actividad',
};

const RESOURCE_ICON: Record<CommunityResource['tipo'], string> = {
  pdf: 'document-text-outline',
  sermon: 'mic-outline',
  enlace: 'link-outline',
  recurso: 'archive-outline',
};

// ── Encabezado de sección ────────────────────────────────────────────────────

function SectionHeader({
  title,
  icon,
  color,
  onPress,
}: {
  title: string;
  icon: string;
  color: string;
  onPress: () => void;
}) {
  const scheme = useColorScheme() ?? 'dark';
  const theme = Colors[scheme];
  return (
    <View style={sStyles.row}>
      <View style={[sStyles.iconBg, { backgroundColor: `${color}15` }]}>
        <Ionicons name={icon as any} size={15} color={color} />
      </View>
      <Typography variant="h3" style={{ color: theme.text, flex: 1 }}>
        {title}
      </Typography>
      <TouchableOpacity onPress={onPress} style={sStyles.verTodo} activeOpacity={0.7}>
        <Typography variant="caption" color={Colors.primary}>Ver todo</Typography>
        <Ionicons name="chevron-forward" size={12} color={Colors.primary} />
      </TouchableOpacity>
    </View>
  );
}

const sStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm, gap: 8 },
  iconBg: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  verTodo: { flexDirection: 'row', alignItems: 'center', gap: 2 },
});

// ── Pantalla principal ────────────────────────────────────────────────────────

export default function CommunityScreen() {
  const router = useRouter();
  const scheme = useColorScheme() ?? 'dark';
  const theme = Colors[scheme];

  const announcements = useCommunityStore(s => s.announcements);
  const schedules = useCommunityStore(s => s.schedules);
  const contacts = useCommunityStore(s => s.contacts);
  const library = useCommunityStore(s => s.library);
  const readIds = useCommunityStore(s => s.readAnnouncementIds);

  const activeAnnouncements = useMemo(
    () => announcements.filter(a => a.estado === 'activo').slice(0, 3),
    [announcements]
  );

  const unreadCount = useMemo(
    () => announcements.filter(a => a.estado === 'activo' && !readIds.includes(a.id)).length,
    [announcements, readIds]
  );

  const todaySchedules = useMemo(() => {
    const today = new Date().getDay();
    const todays = schedules.filter(s => s.activo && s.dia_semana === today);
    return todays.length > 0 ? todays.slice(0, 3) : schedules.filter(s => s.activo).slice(0, 3);
  }, [schedules]);

  const featuredContacts = useMemo(() => contacts.slice(0, 4), [contacts]);
  const featuredLibrary = useMemo(() => library.slice(0, 3), [library]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Typography variant="overline" secondary>Tu iglesia</Typography>
          <Typography variant="h1" style={{ color: theme.text }}>Comunidad</Typography>
        </View>
        <TouchableOpacity
          style={[styles.notifBtn, { backgroundColor: theme.card }]}
          onPress={() => router.push('/announcements' as never)}
          activeOpacity={0.8}
        >
          <Ionicons name="notifications-outline" size={22} color={Colors.primary} />
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Typography style={{ color: '#FFF', fontSize: 9, fontWeight: '700', lineHeight: 14 }}>
                {unreadCount > 9 ? '9+' : String(unreadCount)}
              </Typography>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* ── CARTELERA ── */}
        <View style={styles.section}>
          <SectionHeader
            title="Cartelera"
            icon="megaphone-outline"
            color={Colors.error}
            onPress={() => router.push('/announcements' as never)}
          />
          {activeAnnouncements.length === 0 ? (
            <Typography variant="caption" secondary style={styles.emptyText}>
              No hay anuncios activos
            </Typography>
          ) : (
            activeAnnouncements.map(ann => (
              <TouchableOpacity
                key={ann.id}
                style={[styles.annCard, { backgroundColor: theme.card }, Shadows.sm]}
                onPress={() => router.push('/announcements' as never)}
                activeOpacity={0.85}
              >
                <View style={[styles.annAccent, { backgroundColor: PRIORITY_COLOR[ann.prioridad] }]} />
                <View style={styles.annBody}>
                  <View style={styles.annHeader}>
                    <Typography variant="label" style={{ color: theme.text, flex: 1 }} numberOfLines={1}>
                      {ann.titulo}
                    </Typography>
                    <Typography variant="caption" color={Colors.primary} style={{ fontSize: 10 }}>
                      {formatDate(ann.fecha)}
                    </Typography>
                  </View>
                  <Typography variant="caption" secondary numberOfLines={2} style={{ lineHeight: 16 }}>
                    {ann.descripcion}
                  </Typography>
                  <View style={styles.annFooter}>
                    <View style={[styles.chip, { backgroundColor: `${PRIORITY_COLOR[ann.prioridad]}12` }]}>
                      <Typography style={{ color: PRIORITY_COLOR[ann.prioridad], fontSize: 9, fontWeight: '700', textTransform: 'uppercase' }}>
                        {ann.categoria} · {ann.prioridad}
                      </Typography>
                    </View>
                    {!readIds.includes(ann.id) && <View style={styles.unreadDot} />}
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* ── HORARIOS ── */}
        <View style={styles.section}>
          <SectionHeader
            title="Horarios"
            icon="calendar-outline"
            color={Colors.success}
            onPress={() => router.push('/schedules' as never)}
          />
          {todaySchedules.length === 0 ? (
            <TouchableOpacity
              style={[styles.emptyCard, { backgroundColor: theme.card }, Shadows.sm]}
              onPress={() => router.push('/schedules' as never)}
              activeOpacity={0.85}
            >
              <Ionicons name="calendar-outline" size={20} color={theme.textMuted} />
              <Typography variant="caption" secondary style={{ flex: 1 }}>
                Ver horario completo de la semana
              </Typography>
              <Ionicons name="chevron-forward" size={14} color={theme.textMuted} />
            </TouchableOpacity>
          ) : (
            todaySchedules.map(sch => (
              <TouchableOpacity
                key={sch.id}
                style={[styles.schedCard, { backgroundColor: theme.card }, Shadows.sm]}
                onPress={() => router.push('/schedules' as never)}
                activeOpacity={0.85}
              >
                <View style={[styles.schedTime, { backgroundColor: `${Colors.success}12` }]}>
                  <Typography style={{ color: Colors.success, fontSize: 14, fontWeight: '700' }}>
                    {sch.hora}
                  </Typography>
                  <Typography style={{ color: Colors.success, fontSize: 9, opacity: 0.8 }}>
                    {sch.dia_semana !== undefined ? DIAS_SHORT[sch.dia_semana] : ''}
                  </Typography>
                </View>
                <View style={styles.schedInfo}>
                  <Typography variant="label" style={{ color: theme.text }} numberOfLines={1}>
                    {sch.titulo}
                  </Typography>
                  <Typography variant="caption" secondary numberOfLines={1}>
                    {sch.ubicacion}
                  </Typography>
                </View>
                <View style={[styles.chip, { backgroundColor: `${Colors.success}12`, marginRight: 12 }]}>
                  <Typography style={{ color: Colors.success, fontSize: 9, fontWeight: '700' }}>
                    {TIPO_LABEL_SHORT[sch.tipo]}
                  </Typography>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* ── GRUPOS Y MINISTERIOS ── */}
        <View style={styles.section}>
          <SectionHeader
            title="Grupos y Ministerios"
            icon="people-outline"
            color={Colors.info}
            onPress={() => router.push('/contacts' as never)}
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.contactsRow}
          >
            {featuredContacts.map(contact => (
              <TouchableOpacity
                key={contact.id}
                style={[styles.contactChip, { backgroundColor: theme.card }]}
                onPress={() => router.push('/contacts' as never)}
                activeOpacity={0.85}
              >
                <View style={[styles.contactAvatar, { backgroundColor: contact.color }]}>
                  <Typography style={{ color: '#FFF', fontSize: 15, fontWeight: '700' }}>
                    {contact.nombre.split(' ').slice(0, 2).map((w: string) => w[0] ?? '').join('')}
                  </Typography>
                </View>
                <Typography
                  variant="caption"
                  style={{ color: theme.text, fontWeight: '600', textAlign: 'center' }}
                  numberOfLines={2}
                >
                  {contact.nombre.split(' ').slice(0, 2).join(' ')}
                </Typography>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.contactChip, { backgroundColor: `${Colors.info}12` }]}
              onPress={() => router.push('/contacts' as never)}
              activeOpacity={0.85}
            >
              <Ionicons name="add-circle-outline" size={28} color={Colors.info} />
              <Typography variant="caption" color={Colors.info} style={{ textAlign: 'center' }}>
                Ver todos
              </Typography>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* ── BIBLIOTECA ── */}
        <View style={styles.section}>
          <SectionHeader
            title="Biblioteca"
            icon="folder-open-outline"
            color={Colors.secondary}
            onPress={() => router.push('/community-library' as never)}
          />
          {featuredLibrary.map(res => (
            <TouchableOpacity
              key={res.id}
              style={[styles.libCard, { backgroundColor: theme.card }, Shadows.sm]}
              onPress={() => router.push('/community-library' as never)}
              activeOpacity={0.85}
            >
              <View style={[styles.libIcon, { backgroundColor: `${Colors.secondary}15` }]}>
                <Ionicons name={RESOURCE_ICON[res.tipo] as any} size={18} color={Colors.secondary} />
              </View>
              <View style={styles.libContent}>
                <Typography variant="label" style={{ color: theme.text }} numberOfLines={1}>
                  {res.titulo}
                </Typography>
                <Typography variant="caption" secondary numberOfLines={1}>
                  {res.categoria}{res.autor ? ` · ${res.autor}` : ''}
                </Typography>
              </View>
              <Ionicons name="chevron-forward" size={14} color={theme.textMuted} style={{ alignSelf: 'center', marginRight: 12 }} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Footer */}
        <View style={[styles.footer, { backgroundColor: theme.card }]}>
          <Ionicons name="shield-checkmark-outline" size={14} color={theme.textMuted} />
          <Typography variant="caption" muted>
            Datos locales · Offline First · 100% privado
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  notifBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { paddingBottom: 40 },
  section: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },

  // Announcements
  annCard: {
    flexDirection: 'row',
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginBottom: 8,
  },
  annAccent: { width: 4 },
  annBody: { flex: 1, padding: 12, gap: 6 },
  annHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  annFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  chip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  unreadDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },

  // Schedules
  emptyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: BorderRadius.lg,
    gap: 10,
  },
  schedCard: {
    flexDirection: 'row',
    alignItems: 'stretch',
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginBottom: 8,
  },
  schedTime: {
    width: 64,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  schedInfo: { flex: 1, paddingHorizontal: 12, paddingVertical: 10, gap: 3 },

  // Contacts
  contactsRow: { gap: 10, paddingRight: 4 },
  contactChip: {
    alignItems: 'center',
    padding: 12,
    borderRadius: BorderRadius.xl,
    gap: 6,
    width: 90,
    justifyContent: 'center',
  },
  contactAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Library
  libCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    padding: 12,
    marginBottom: 8,
    gap: 12,
  },
  libIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  libContent: { flex: 1, gap: 3 },

  emptyText: { textAlign: 'center', paddingVertical: 16 },

  // Footer
  footer: {
    marginHorizontal: Spacing.lg,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
