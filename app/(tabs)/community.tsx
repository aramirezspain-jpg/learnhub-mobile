import React, { useMemo } from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Spacing, BorderRadius, Shadows, FontSizes } from '@/constants/theme';
import { Typography } from '@/components/ui/Typography';
import { useCommunityStore } from '@/store/community.store';
import { useNotificationStore } from '@/store/notification.store';
import { useUserActivityStore } from '@/store/userActivity.store';
import type { Announcement, Schedule, CommunityResource } from '@/types/community';

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}

function daysUntil(dateStr: string): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
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

const COMMUNITY_SERVICES = [
  { route: '/prayer-requests' as const,   titulo: 'Peticiones de Oración', icon: 'hand-left-outline',           color: Colors.secondary },
  { route: '/contact-leadership' as const, titulo: 'Contactar Liderazgo',   icon: 'chatbubble-ellipses-outline', color: Colors.info },
  { route: '/service-request' as const,   titulo: 'Solicitudes',            icon: 'document-text-outline',       color: Colors.accent },
] as const;

// ── Encabezado de sección ────────────────────────────────────────────────────

function SectionHeader({
  title,
  icon,
  color,
  onPress,
  hideVerTodo,
}: {
  title: string;
  icon: string;
  color: string;
  onPress?: () => void;
  hideVerTodo?: boolean;
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
      {!hideVerTodo && onPress && (
        <TouchableOpacity onPress={onPress} style={sStyles.verTodo} activeOpacity={0.7}>
          <Typography variant="caption" color={Colors.primary}>Ver todo</Typography>
          <Ionicons name="chevron-forward" size={12} color={Colors.primary} />
        </TouchableOpacity>
      )}
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
  const notifUnreadCount = useNotificationStore(s => s.unreadCount);
  const prayerRequests = useUserActivityStore(s => s.prayerRequests);
  const leadershipMessages = useUserActivityStore(s => s.leadershipMessages);
  const serviceRequests = useUserActivityStore(s => s.serviceRequests);

  // ── Cómputos ────────────────────────────────────────────────────────────────

  // Anuncios activos + destacados, con destacados primero
  const featuredAnnouncements = useMemo(() => {
    const visible = announcements.filter(a => a.estado === 'activo' || a.estado === 'destacado');
    return [...visible]
      .sort((a, b) => {
        if (a.estado === 'destacado' && b.estado !== 'destacado') return -1;
        if (b.estado === 'destacado' && a.estado !== 'destacado') return 1;
        return 0;
      })
      .slice(0, 3);
  }, [announcements]);

  const unreadCount = useMemo(
    () => announcements.filter(a => a.estado !== 'expirado' && !readIds.includes(a.id)).length,
    [announcements, readIds]
  );

  // Próximos eventos (por fecha, más próximos primero)
  const proximosEventos = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return announcements
      .filter(a => {
        if (a.estado === 'expirado') return false;
        const d = new Date(a.fecha);
        d.setHours(0, 0, 0, 0);
        return d >= now && (a.categoria === 'evento' || a.categoria === 'ayuno');
      })
      .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
      .slice(0, 3);
  }, [announcements]);

  // Horarios de hoy
  const todaySchedules = useMemo(() => {
    const today = new Date().getDay();
    const todays = schedules.filter(s => s.activo && s.dia_semana === today);
    return todays.length > 0 ? todays.slice(0, 3) : schedules.filter(s => s.activo).slice(0, 3);
  }, [schedules]);

  // Contactos destacados
  const featuredContacts = useMemo(() => contacts.slice(0, 4), [contacts]);

  // Biblioteca: destacados primero
  const featuredLibrary = useMemo(() => {
    const sorted = [...library].sort((a, b) => {
      if (a.destacado && !b.destacado) return -1;
      if (b.destacado && !a.destacado) return 1;
      return 0;
    });
    return sorted.slice(0, 3);
  }, [library]);

  // Resúmenes servicios comunidad
  const prayerSummary = useMemo(() => {
    const total = prayerRequests.length;
    if (total === 0) return 'Sin peticiones enviadas';
    const pending = prayerRequests.filter(p => p.estado === 'pendiente').length;
    const answered = prayerRequests.filter(p => p.estado === 'respondida').length;
    if (answered > 0) return `${total} enviada${total !== 1 ? 's' : ''} · ${answered} respondida${answered !== 1 ? 's' : ''}`;
    return `${total} enviada${total !== 1 ? 's' : ''} · ${pending} pendiente${pending !== 1 ? 's' : ''}`;
  }, [prayerRequests]);

  const leadershipSummary = useMemo(() => {
    const total = leadershipMessages.length;
    if (total === 0) return 'Envía un mensaje al equipo pastoral';
    const last = leadershipMessages[0];
    return `${total} mensaje${total !== 1 ? 's' : ''} · ${last.ministerio.split(' ').slice(0, 3).join(' ')}`;
  }, [leadershipMessages]);

  const serviceSummary = useMemo(() => {
    const total = serviceRequests.length;
    if (total === 0) return 'Solicita un servicio pastoral';
    const active = serviceRequests.filter(s => s.estado !== 'completada').length;
    return `${total} solicitud${total !== 1 ? 'es' : ''} · ${active} activa${active !== 1 ? 's' : ''}`;
  }, [serviceRequests]);

  const serviceSummaries: Record<typeof COMMUNITY_SERVICES[number]['route'], string> = {
    '/prayer-requests': prayerSummary,
    '/contact-leadership': leadershipSummary,
    '/service-request': serviceSummary,
  };

  // Resumen semanal
  const resumen = useMemo(() => ({
    servicios: schedules.filter(s => s.activo).length,
    anuncios: announcements.filter(a => a.estado !== 'expirado').length,
    proximoEvento: proximosEventos[0] ?? null,
  }), [schedules, announcements, proximosEventos]);

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
          onPress={() => router.push('/notifications' as never)}
          activeOpacity={0.8}
        >
          <Ionicons name="notifications-outline" size={22} color={Colors.primary} />
          {notifUnreadCount > 0 && (
            <View style={styles.notifBadge}>
              <Typography style={{ color: '#FFF', fontSize: 9, fontWeight: '700', lineHeight: 14 }}>
                {notifUnreadCount > 9 ? '9+' : String(notifUnreadCount)}
              </Typography>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* ── RESUMEN SEMANAL ── */}
        <View style={styles.summarySection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.summaryRow}>
            <View style={[styles.statChip, { backgroundColor: `${Colors.success}12` }]}>
              <Ionicons name="calendar-outline" size={14} color={Colors.success} />
              <Typography style={{ color: Colors.success, fontSize: 13, fontWeight: '800' }}>
                {resumen.servicios}
              </Typography>
              <Typography variant="caption" muted style={{ fontSize: 10 }}>servicios</Typography>
            </View>
            <View style={[styles.statChip, { backgroundColor: `${Colors.error}12` }]}>
              <Ionicons name="megaphone-outline" size={14} color={Colors.error} />
              <Typography style={{ color: Colors.error, fontSize: 13, fontWeight: '800' }}>
                {resumen.anuncios}
              </Typography>
              <Typography variant="caption" muted style={{ fontSize: 10 }}>anuncios</Typography>
            </View>
            {resumen.proximoEvento && (
              <TouchableOpacity
                style={[styles.statChip, { backgroundColor: `${Colors.accent}12` }]}
                onPress={() => router.push('/announcements' as never)}
                activeOpacity={0.85}
              >
                <Ionicons name="time-outline" size={14} color={Colors.accent} />
                <Typography style={{ color: Colors.accent, fontSize: 13, fontWeight: '800' }}>
                  {formatDate(resumen.proximoEvento.fecha)}
                </Typography>
                <Typography variant="caption" muted style={{ fontSize: 10 }}>próx. evento</Typography>
              </TouchableOpacity>
            )}
            {notifUnreadCount > 0 && (
              <TouchableOpacity
                style={[styles.statChip, { backgroundColor: `${Colors.primary}12` }]}
                onPress={() => router.push('/notifications' as never)}
                activeOpacity={0.85}
              >
                <Ionicons name="notifications-outline" size={14} color={Colors.primary} />
                <Typography style={{ color: Colors.primary, fontSize: 13, fontWeight: '800' }}>
                  {notifUnreadCount}
                </Typography>
                <Typography variant="caption" muted style={{ fontSize: 10 }}>sin leer</Typography>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>

        {/* ── PRÓXIMOS EVENTOS ── */}
        {proximosEventos.length > 0 && (
          <View style={styles.section}>
            <SectionHeader
              title="Próximos Eventos"
              icon="time-outline"
              color={Colors.accent}
              onPress={() => router.push('/announcements' as never)}
            />
            {proximosEventos.map(ann => {
              const days = daysUntil(ann.fecha);
              const daysLabel = days === 0 ? 'Hoy' : days === 1 ? 'Mañana' : `En ${days} días`;
              const isDestacado = ann.estado === 'destacado';
              return (
                <TouchableOpacity
                  key={ann.id}
                  style={[
                    styles.eventCard,
                    { backgroundColor: theme.card },
                    Shadows.sm,
                    isDestacado && { borderColor: `${Colors.accent}35`, borderWidth: 1.5 },
                  ]}
                  onPress={() => router.push('/announcements' as never)}
                  activeOpacity={0.85}
                >
                  <View style={[styles.eventDateBlock, { backgroundColor: `${Colors.accent}12` }]}>
                    <Typography style={{ color: Colors.accent, fontSize: 17, fontWeight: '800', lineHeight: 20 }}>
                      {new Date(ann.fecha).getDate()}
                    </Typography>
                    <Typography style={{ color: Colors.accent, fontSize: 9, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      {new Date(ann.fecha).toLocaleDateString('es-ES', { month: 'short' })}
                    </Typography>
                  </View>
                  <View style={styles.eventInfo}>
                    <View style={styles.eventHeader}>
                      {isDestacado && (
                        <Ionicons name="star" size={10} color={Colors.accent} style={{ marginRight: 3 }} />
                      )}
                      <Typography variant="label" style={{ color: theme.text, flex: 1 }} numberOfLines={1}>
                        {ann.titulo}
                      </Typography>
                    </View>
                    <Typography variant="caption" secondary numberOfLines={1}>
                      {ann.descripcion}
                    </Typography>
                  </View>
                  <View style={[styles.daysChip, { backgroundColor: days <= 3 ? `${Colors.error}12` : `${Colors.success}12` }]}>
                    <Typography style={{ color: days <= 3 ? Colors.error : Colors.success, fontSize: 9, fontWeight: '700' }}>
                      {daysLabel}
                    </Typography>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* ── CARTELERA ── */}
        <View style={styles.section}>
          <SectionHeader
            title="Cartelera"
            icon="megaphone-outline"
            color={Colors.error}
            onPress={() => router.push('/announcements' as never)}
          />
          {featuredAnnouncements.length === 0 ? (
            <Typography variant="caption" secondary style={styles.emptyText}>
              No hay anuncios activos
            </Typography>
          ) : (
            featuredAnnouncements.map(ann => {
              const isDestacado = ann.estado === 'destacado';
              return (
                <TouchableOpacity
                  key={ann.id}
                  style={[
                    styles.annCard,
                    { backgroundColor: theme.card },
                    Shadows.sm,
                    isDestacado && { borderColor: `${Colors.accent}35`, borderWidth: 1.5 },
                  ]}
                  onPress={() => router.push('/announcements' as never)}
                  activeOpacity={0.85}
                >
                  <View style={[styles.annAccent, {
                    backgroundColor: isDestacado ? Colors.accent : PRIORITY_COLOR[ann.prioridad]
                  }]} />
                  <View style={styles.annBody}>
                    <View style={styles.annHeader}>
                      {isDestacado && (
                        <Ionicons name="star" size={10} color={Colors.accent} />
                      )}
                      <Typography variant="label" style={{ color: isDestacado ? Colors.accent : theme.text, flex: 1 }} numberOfLines={1}>
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
                      <View style={[styles.chip, {
                        backgroundColor: `${isDestacado ? Colors.accent : PRIORITY_COLOR[ann.prioridad]}12`
                      }]}>
                        <Typography style={{
                          color: isDestacado ? Colors.accent : PRIORITY_COLOR[ann.prioridad],
                          fontSize: 9, fontWeight: '700', textTransform: 'uppercase'
                        }}>
                          {isDestacado ? 'Destacado' : `${ann.categoria} · ${ann.prioridad}`}
                        </Typography>
                      </View>
                      {!readIds.includes(ann.id) && <View style={styles.unreadDot} />}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
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
                  <View style={styles.schedMeta}>
                    <Typography variant="caption" secondary numberOfLines={1} style={{ flex: 1 }}>
                      {sch.ubicacion}
                    </Typography>
                    {sch.categoria && (
                      <View style={[styles.chip, { backgroundColor: `${Colors.success}10` }]}>
                        <Typography style={{ color: Colors.success, fontSize: 9, fontWeight: '600' }}>
                          {sch.categoria}
                        </Typography>
                      </View>
                    )}
                  </View>
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

        {/* ── BIBLIOTECA (DESTACADOS) ── */}
        <View style={styles.section}>
          <SectionHeader
            title="Recursos Destacados"
            icon="star-outline"
            color={Colors.secondary}
            onPress={() => router.push('/community-library' as never)}
          />
          {featuredLibrary.map(res => (
            <TouchableOpacity
              key={res.id}
              style={[
                styles.libCard,
                { backgroundColor: theme.card },
                Shadows.sm,
                res.destacado && { borderColor: `${Colors.secondary}30`, borderWidth: 1 },
              ]}
              onPress={() => router.push('/community-library' as never)}
              activeOpacity={0.85}
            >
              <View style={[styles.libIcon, { backgroundColor: `${Colors.secondary}15` }]}>
                <Ionicons name={RESOURCE_ICON[res.tipo] as any} size={18} color={Colors.secondary} />
              </View>
              <View style={styles.libContent}>
                <View style={styles.libTitleRow}>
                  {res.destacado && (
                    <Ionicons name="star" size={10} color={Colors.accent} style={{ marginRight: 4 }} />
                  )}
                  <Typography variant="label" style={{ color: theme.text, flex: 1 }} numberOfLines={1}>
                    {res.titulo}
                  </Typography>
                </View>
                <Typography variant="caption" secondary numberOfLines={1}>
                  {res.categoria}{res.autor ? ` · ${res.autor}` : ''}
                </Typography>
              </View>
              <Ionicons name="chevron-forward" size={14} color={theme.textMuted} style={{ alignSelf: 'center', marginRight: 12 }} />
            </TouchableOpacity>
          ))}
        </View>

        {/* ── SERVICIOS COMUNIDAD ── */}
        <View style={styles.section}>
          <SectionHeader
            title="Servicios Comunidad"
            icon="apps-outline"
            color={Colors.primary}
            hideVerTodo
          />
          {COMMUNITY_SERVICES.map(item => {
            const summary = serviceSummaries[item.route];
            const hasActivity = summary !== 'Sin peticiones enviadas' &&
              summary !== 'Envía un mensaje al equipo pastoral' &&
              summary !== 'Solicita un servicio pastoral';
            return (
              <TouchableOpacity
                key={item.route}
                style={[styles.phCard, { backgroundColor: theme.card }, Shadows.sm]}
                onPress={() => router.push(item.route as never)}
                activeOpacity={0.85}
              >
                <View style={[styles.phIcon, { backgroundColor: `${item.color}15` }]}>
                  <Ionicons name={item.icon as any} size={20} color={item.color} />
                </View>
                <View style={styles.phInfo}>
                  <Typography variant="label" style={{ color: theme.text }}>{item.titulo}</Typography>
                  <Typography
                    variant="caption"
                    style={{ color: hasActivity ? item.color : theme.textMuted, fontWeight: hasActivity ? '600' : '400' }}
                    numberOfLines={1}
                  >
                    {summary}
                  </Typography>
                </View>
                <Ionicons name="chevron-forward" size={16} color={theme.textMuted} />
              </TouchableOpacity>
            );
          })}
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
    paddingBottom: Spacing.md,
  },
  notifBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifBadge: {
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
  section: { paddingHorizontal: Spacing.lg, marginBottom: Spacing.xl },

  // Resumen semanal
  summarySection: { marginBottom: Spacing.xl },
  summaryRow: { paddingHorizontal: Spacing.lg, gap: 10 },
  statChip: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: BorderRadius.xl,
    gap: 3,
    minWidth: 80,
  },

  // Próximos eventos
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginBottom: 8,
    gap: 0,
  },
  eventDateBlock: {
    width: 60,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  eventInfo: { flex: 1, paddingHorizontal: 12, paddingVertical: 10, gap: 3 },
  eventHeader: { flexDirection: 'row', alignItems: 'center' },
  daysChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    marginRight: 12,
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
  annHeader: { flexDirection: 'row', alignItems: 'center', gap: 4 },
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
  schedMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },

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
  libTitleRow: { flexDirection: 'row', alignItems: 'center' },

  emptyText: { textAlign: 'center', paddingVertical: 16 },

  // Próximamente
  phCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    padding: 14,
    marginBottom: 8,
    gap: 14,
  },
  phIcon: {
    width: 42,
    height: 42,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  phInfo: { flex: 1, gap: 2 },
  prox: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },

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
