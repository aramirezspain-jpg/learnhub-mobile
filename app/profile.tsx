import React, { useMemo, useState } from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet, TextInput, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Spacing, BorderRadius, Shadows, FontSizes, FontWeights } from '@/constants/theme';
import { Typography } from '@/components/ui/Typography';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useProgressStore } from '@/store/progress.store';
import { useFavoritesStore } from '@/store/favorites.store';
import { useNotesStore } from '@/store/notes.store';
import { useUserActivityStore } from '@/store/userActivity.store';
import { useNotificationStore } from '@/store/notification.store';
import { useCourses } from '@/hooks/useCourses';
import { ContentService } from '@/services/content.service';
import { type LessonProgress } from '@/types';
import * as Haptics from 'expo-haptics';
import { useLocalProfile } from '@/hooks/auth/useLocalProfile';
import { ROLE_META } from '@/types/user';

function SpiritualItem({
  icon,
  value,
  label,
  color,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  value: number;
  label: string;
  color: string;
}) {
  const scheme = useColorScheme() ?? 'dark';
  const theme = Colors[scheme];
  return (
    <View style={sp.item}>
      <View style={[sp.itemIcon, { backgroundColor: `${color}15` }]}>
        <Ionicons name={icon} size={17} color={color} />
      </View>
      <Typography style={{ color, fontSize: 22, fontWeight: FontWeights.extrabold, lineHeight: 28 }}>
        {value}
      </Typography>
      <Typography style={{ color: theme.textMuted, fontSize: 10, fontWeight: FontWeights.semibold, textAlign: 'center' }}>
        {label}
      </Typography>
    </View>
  );
}

const sp = StyleSheet.create({
  item: { flex: 1, alignItems: 'center', gap: 4 },
  itemIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
});

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('');
}

function EditField({
  icon,
  placeholder,
  value,
  onChangeText,
  theme,
  keyboardType = 'default',
  autoCapitalize = 'words',
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  placeholder: string;
  value: string;
  onChangeText: (t: string) => void;
  theme: (typeof Colors)['dark'];
  keyboardType?: 'default' | 'email-address';
  autoCapitalize?: 'none' | 'words' | 'sentences';
}) {
  return (
    <View style={[editStyles.field, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <Ionicons name={icon} size={16} color={theme.textMuted} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.textMuted}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        style={[editStyles.input, { color: theme.text }]}
      />
    </View>
  );
}

const editStyles = StyleSheet.create({
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.md,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
    paddingVertical: 11,
    gap: 10,
    marginBottom: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: FontWeights.regular,
  },
});

function computeStreak(lessonProgress: Record<string, LessonProgress>): number {
  const entries = Object.values(lessonProgress).filter(
    p => p.completed === 1 && p.completed_at
  );
  if (entries.length === 0) return 0;

  const toDay = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const uniqueDays = [...new Set(entries.map(p => toDay(p.completed_at!)))].sort(
    (a, b) => b.localeCompare(a)
  );

  const today = toDay(new Date().toISOString());
  const yesterday = toDay(new Date(Date.now() - 86400000).toISOString());

  if (uniqueDays[0] !== today && uniqueDays[0] !== yesterday) return 0;

  let streak = 0;
  const cursor = new Date();
  for (const day of uniqueDays) {
    const expected = toDay(cursor.toISOString());
    if (day === expected) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

function StatCard({
  icon,
  value,
  label,
  color,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  value: string | number;
  label: string;
  color: string;
}) {
  const scheme = useColorScheme() ?? 'dark';
  const theme = Colors[scheme];
  return (
    <View style={[styles.statCard, { backgroundColor: theme.card }, Shadows.sm]}>
      <View style={[styles.statIcon, { backgroundColor: `${color}18` }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <Typography variant="h2" color={color} style={{ marginTop: 4 }}>
        {value}
      </Typography>
      <Typography variant="caption" secondary style={{ textAlign: 'center' }}>
        {label}
      </Typography>
    </View>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const scheme = useColorScheme() ?? 'dark';
  const theme = Colors[scheme];

  const { profile, save } = useLocalProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [draftEmail, setDraftEmail] = useState('');
  const [draftIglesia, setDraftIglesia] = useState('');
  const [draftMinisterio, setDraftMinisterio] = useState('');

  const displayName = profile?.display_name || 'Estudiante';
  const initials = getInitials(displayName);
  const roleMeta = ROLE_META[profile?.rol ?? 'member'];

  function handleEditStart() {
    setDraftName(profile?.display_name ?? 'Estudiante');
    setDraftEmail(profile?.email ?? '');
    setDraftIglesia(profile?.iglesia ?? '');
    setDraftMinisterio(profile?.ministerio ?? '');
    setIsEditing(true);
  }

  async function handleSave() {
    if (!draftName.trim()) return;
    await save({
      display_name: draftName.trim(),
      email: draftEmail.trim() || undefined,
      iglesia: draftIglesia.trim() || undefined,
      ministerio: draftMinisterio.trim() || undefined,
    });
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    setIsEditing(false);
  }

  const { courses } = useCourses();
  const lessonProgress = useProgressStore(s => s.lessonProgress);
  const getCompletedCount = useProgressStore(s => s.getCompletedCountForCourse);
  const getCourseProgress = useProgressStore(s => s.getCourseProgress);
  const lastViewed = useProgressStore(s => s.lastViewed);
  const favCount = useFavoritesStore(s => s.favorites.length);
  const noteCount = useNotesStore(s => s.notes.length);
  const prayerRequests = useUserActivityStore(s => s.prayerRequests);
  const leadershipMessages = useUserActivityStore(s => s.leadershipMessages);
  const serviceRequests = useUserActivityStore(s => s.serviceRequests);
  const notifUnread = useNotificationStore(s => s.unreadCount);
  const notifTotal = useNotificationStore(s => s.notifications.length);

  const prayerPending  = useMemo(() => prayerRequests.filter(p => p.estado === 'pendiente').length,   [prayerRequests]);
  const prayerAnswered = useMemo(() => prayerRequests.filter(p => p.estado === 'respondida').length,  [prayerRequests]);
  const svcActive      = useMemo(() => serviceRequests.filter(s => s.estado !== 'completada').length, [serviceRequests]);
  const msgUrgent      = useMemo(() => leadershipMessages.filter(m => m.prioridad === 'urgente').length, [leadershipMessages]);

  const lastActivityDate = useMemo(() => {
    const dates: string[] = [];
    if (lastViewed?.updated_at) dates.push(lastViewed.updated_at);
    for (const p of prayerRequests) dates.push(p.created_at);
    for (const m of leadershipMessages) dates.push(m.created_at);
    for (const sv of serviceRequests) dates.push(sv.created_at);
    if (!dates.length) return null;
    const latest = [...dates].sort((a, b) => b.localeCompare(a))[0];
    const d = new Date(latest);
    const now = new Date();
    const diff = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'Hoy';
    if (diff === 1) return 'Ayer';
    if (diff < 7) return `Hace ${diff} días`;
    return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' });
  }, [lastViewed, prayerRequests, leadershipMessages, serviceRequests]);

  const totalLessons = courses.reduce((sum, c) => sum + c.total_lecciones, 0);
  const totalCompleted = courses.reduce((sum, c) => sum + getCompletedCount(c.id), 0);
  const globalPercent = totalLessons > 0 ? Math.round((totalCompleted / totalLessons) * 100) : 0;
  const streak = useMemo(() => computeStreak(lessonProgress), [lessonProgress]);
  const coursesCompleted = courses.filter(c => {
    const total = ContentService.getTotalLessons(c.id);
    return total > 0 && getCompletedCount(c.id) >= total;
  }).length;
  const coursesInProgress = courses.filter(c => {
    const cnt = getCompletedCount(c.id);
    const total = ContentService.getTotalLessons(c.id);
    return cnt > 0 && cnt < total;
  }).length;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
          <Ionicons name="close" size={22} color={theme.text} />
        </TouchableOpacity>
        <Typography variant="h4" style={{ color: theme.text }}>Perfil</Typography>
        <TouchableOpacity
          style={styles.closeBtn}
          onPress={isEditing ? () => setIsEditing(false) : handleEditStart}
        >
          <Ionicons
            name={isEditing ? 'close-outline' : 'create-outline'}
            size={20}
            color={isEditing ? Colors.error : theme.text}
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Avatar + nombre */}
        <View style={styles.avatarSection}>
          {/* Avatar with camera overlay */}
          <View>
            <View style={[styles.avatar, { backgroundColor: `${Colors.primary}22` }]}>
              <Typography style={{ fontSize: 34, fontWeight: FontWeights.extrabold, color: Colors.primary, lineHeight: 40 }}>
                {initials}
              </Typography>
            </View>
            <View style={[styles.avatarCamera, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Ionicons name="camera-outline" size={12} color={theme.textMuted} />
            </View>
          </View>

          {!isEditing ? (
            <>
              <Typography variant="h2" style={{ color: theme.text, marginTop: 12 }}>
                {displayName}
              </Typography>

              {/* Info pills */}
              {(profile?.email || profile?.iglesia || profile?.ministerio) && (
                <View style={styles.infoPills}>
                  {profile?.email ? (
                    <View style={[styles.infoPill, { backgroundColor: theme.card }]}>
                      <Ionicons name="mail-outline" size={11} color={theme.textMuted} />
                      <Typography variant="caption" muted numberOfLines={1}>{profile.email}</Typography>
                    </View>
                  ) : null}
                  {profile?.iglesia ? (
                    <View style={[styles.infoPill, { backgroundColor: theme.card }]}>
                      <Ionicons name="home-outline" size={11} color={theme.textMuted} />
                      <Typography variant="caption" muted numberOfLines={1}>{profile.iglesia}</Typography>
                    </View>
                  ) : null}
                  {profile?.ministerio ? (
                    <View style={[styles.infoPill, { backgroundColor: theme.card }]}>
                      <Ionicons name="people-outline" size={11} color={theme.textMuted} />
                      <Typography variant="caption" muted numberOfLines={1}>{profile.ministerio}</Typography>
                    </View>
                  ) : null}
                </View>
              )}

              {/* Role badge */}
              <View style={[styles.progressBadge, { backgroundColor: `${roleMeta.color}15` }]}>
                <Ionicons name={roleMeta.icon as React.ComponentProps<typeof Ionicons>['name']} size={14} color={roleMeta.color} />
                <Typography variant="label" color={roleMeta.color}>
                  {roleMeta.label}
                </Typography>
              </View>
            </>
          ) : (
            /* Edit form */
            <View style={styles.editForm}>
              <EditField
                icon="person-outline"
                placeholder="Tu nombre"
                value={draftName}
                onChangeText={setDraftName}
                theme={theme}
              />
              <EditField
                icon="mail-outline"
                placeholder="Email (opcional)"
                value={draftEmail}
                onChangeText={setDraftEmail}
                theme={theme}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <EditField
                icon="home-outline"
                placeholder="Iglesia (opcional)"
                value={draftIglesia}
                onChangeText={setDraftIglesia}
                theme={theme}
              />
              <EditField
                icon="people-outline"
                placeholder="Ministerio (opcional)"
                value={draftMinisterio}
                onChangeText={setDraftMinisterio}
                theme={theme}
              />
              <TouchableOpacity
                style={[styles.saveBtn, { backgroundColor: Colors.primary }]}
                onPress={handleSave}
                activeOpacity={0.85}
              >
                <Ionicons name="checkmark" size={16} color="#fff" />
                <Typography style={{ color: '#fff', fontWeight: FontWeights.semibold, fontSize: FontSizes.sm }}>
                  Guardar cambios
                </Typography>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Resumen espiritual */}
        <View style={styles.section}>
          <Typography variant="h3" style={[styles.sectionTitle, { color: theme.text }]}>
            Resumen espiritual
          </Typography>
          <View style={[styles.spiritualCard, { backgroundColor: theme.card, borderColor: `${Colors.primary}18` }]}>
            {/* Actividad comunitaria */}
            <View style={styles.spiritualRow}>
              <SpiritualItem icon="hand-left" value={prayerRequests.length} label="Peticiones" color={Colors.secondary} />
              <View style={[styles.spiritualDivider, { backgroundColor: theme.border }]} />
              <SpiritualItem icon="chatbubble-ellipses" value={leadershipMessages.length} label="Contactos" color={Colors.info} />
              <View style={[styles.spiritualDivider, { backgroundColor: theme.border }]} />
              <SpiritualItem icon="construct" value={serviceRequests.length} label="Solicitudes" color={Colors.accent} />
            </View>
            <View style={[styles.spiritualSep, { backgroundColor: theme.border }]} />
            {/* Formación y recursos */}
            <View style={styles.spiritualRow}>
              <SpiritualItem icon="play-circle" value={coursesInProgress} label="Iniciados" color={Colors.primary} />
              <View style={[styles.spiritualDivider, { backgroundColor: theme.border }]} />
              <SpiritualItem icon="trophy" value={coursesCompleted} label="Completados" color={Colors.success} />
              <View style={[styles.spiritualDivider, { backgroundColor: theme.border }]} />
              <SpiritualItem icon="bookmark" value={favCount + noteCount} label="Guardados" color={Colors.error} />
            </View>
            {lastActivityDate && (
              <>
                <View style={[styles.spiritualSep, { backgroundColor: theme.border }]} />
                <View style={styles.spiritualFooter}>
                  <Ionicons name="time-outline" size={13} color={theme.textMuted} />
                  <Typography variant="caption" muted>
                    Última actividad:{'  '}
                  </Typography>
                  <Typography variant="caption" color={Colors.primary} style={{ fontWeight: FontWeights.semibold }}>
                    {lastActivityDate}
                  </Typography>
                </View>
              </>
            )}
          </View>
        </View>

        {/* Estadísticas */}
        <View style={styles.section}>
          <Typography variant="h3" style={[styles.sectionTitle, { color: theme.text }]}>
            Mis estadísticas
          </Typography>
          <View style={styles.statsGrid}>
            <StatCard
              icon="checkmark-circle"
              value={totalCompleted}
              label="Lecciones ✓"
              color={Colors.success}
            />
            <StatCard
              icon="flame"
              value={streak}
              label="Días seguidos"
              color={Colors.accent}
            />
            <StatCard
              icon="school"
              value={coursesInProgress}
              label="En progreso"
              color={Colors.primary}
            />
            <StatCard
              icon="heart"
              value={favCount}
              label="Favoritos"
              color={Colors.error}
            />
          </View>
          <View style={styles.statsFull}>
            <StatCard
              icon="trophy"
              value={coursesCompleted}
              label="Cursos completados"
              color={Colors.accent}
            />
          </View>
          <View style={[styles.statsFull, { marginTop: 10 }]}>
            <StatCard
              icon="document-text"
              value={noteCount}
              label="Notas creadas"
              color={Colors.secondary}
            />
          </View>
        </View>

        {/* Mi actividad */}
        <View style={styles.section}>
          <Typography variant="h3" style={[styles.sectionTitle, { color: theme.text }]}>
            Mi actividad
          </Typography>

          {/* Resumen numérico */}
          <View style={[styles.activityBanner, { backgroundColor: theme.card }, Shadows.sm]}>
            {[
              { label: 'Peticiones', value: prayerRequests.length, color: Colors.secondary },
              { label: 'Mensajes',   value: leadershipMessages.length, color: Colors.info },
              { label: 'Solicitudes',value: serviceRequests.length, color: Colors.accent },
              { label: 'Notif.',     value: notifTotal, color: Colors.primary },
            ].map(({ label, value, color }) => (
              <View key={label} style={styles.activitySummaryItem}>
                <Typography style={{ color, fontSize: 22, fontWeight: '800', lineHeight: 26 }}>{value}</Typography>
                <Typography style={{ color: theme.textMuted, fontSize: 9, fontWeight: '600', textAlign: 'center' }}>{label}</Typography>
              </View>
            ))}
          </View>

          {/* Peticiones de Oración */}
          <TouchableOpacity
            style={[styles.activityRow, { backgroundColor: theme.card }, Shadows.sm]}
            onPress={() => router.push('/prayer-requests' as never)}
            activeOpacity={0.85}
          >
            <View style={[styles.activityIcon, { backgroundColor: `${Colors.secondary}15` }]}>
              <Ionicons name="hand-left-outline" size={18} color={Colors.secondary} />
            </View>
            <View style={styles.activityContent}>
              <Typography variant="label" style={{ color: theme.text }}>Peticiones de Oración</Typography>
              <Typography variant="caption" style={{ color: prayerRequests.length > 0 ? Colors.secondary : theme.textMuted, fontWeight: prayerRequests.length > 0 ? '600' : '400' }}>
                {prayerRequests.length === 0
                  ? 'Sin peticiones enviadas'
                  : `${prayerRequests.length} enviada${prayerRequests.length !== 1 ? 's' : ''} · ${prayerPending} pendiente${prayerPending !== 1 ? 's' : ''} · ${prayerAnswered} respondida${prayerAnswered !== 1 ? 's' : ''}`}
              </Typography>
            </View>
            {prayerRequests.length > 0 && (
              <View style={[styles.activityCount, { backgroundColor: `${Colors.secondary}15` }]}>
                <Typography style={{ color: Colors.secondary, fontSize: FontSizes.sm, fontWeight: '800' }}>{prayerRequests.length}</Typography>
              </View>
            )}
            <Ionicons name="chevron-forward" size={14} color={theme.textMuted} />
          </TouchableOpacity>

          {/* Contactar Liderazgo */}
          <TouchableOpacity
            style={[styles.activityRow, { backgroundColor: theme.card }, Shadows.sm]}
            onPress={() => router.push('/contact-leadership' as never)}
            activeOpacity={0.85}
          >
            <View style={[styles.activityIcon, { backgroundColor: `${Colors.info}15` }]}>
              <Ionicons name="chatbubble-ellipses-outline" size={18} color={Colors.info} />
            </View>
            <View style={styles.activityContent}>
              <Typography variant="label" style={{ color: theme.text }}>Contactar Liderazgo</Typography>
              <Typography variant="caption" style={{ color: leadershipMessages.length > 0 ? Colors.info : theme.textMuted, fontWeight: leadershipMessages.length > 0 ? '600' : '400' }}>
                {leadershipMessages.length === 0
                  ? 'Sin mensajes enviados'
                  : `${leadershipMessages.length} mensaje${leadershipMessages.length !== 1 ? 's' : ''} enviado${leadershipMessages.length !== 1 ? 's' : ''}${msgUrgent > 0 ? ` · ${msgUrgent} urgente${msgUrgent !== 1 ? 's' : ''}` : ''}`}
              </Typography>
            </View>
            {leadershipMessages.length > 0 && (
              <View style={[styles.activityCount, { backgroundColor: `${Colors.info}15` }]}>
                <Typography style={{ color: Colors.info, fontSize: FontSizes.sm, fontWeight: '800' }}>{leadershipMessages.length}</Typography>
              </View>
            )}
            <Ionicons name="chevron-forward" size={14} color={theme.textMuted} />
          </TouchableOpacity>

          {/* Solicitudes */}
          <TouchableOpacity
            style={[styles.activityRow, { backgroundColor: theme.card }, Shadows.sm]}
            onPress={() => router.push('/service-request' as never)}
            activeOpacity={0.85}
          >
            <View style={[styles.activityIcon, { backgroundColor: `${Colors.accent}15` }]}>
              <Ionicons name="document-text-outline" size={18} color={Colors.accent} />
            </View>
            <View style={styles.activityContent}>
              <Typography variant="label" style={{ color: theme.text }}>Solicitudes</Typography>
              <Typography variant="caption" style={{ color: serviceRequests.length > 0 ? Colors.accent : theme.textMuted, fontWeight: serviceRequests.length > 0 ? '600' : '400' }}>
                {serviceRequests.length === 0
                  ? 'Sin solicitudes enviadas'
                  : `${serviceRequests.length} enviada${serviceRequests.length !== 1 ? 's' : ''} · ${svcActive} activa${svcActive !== 1 ? 's' : ''}`}
              </Typography>
            </View>
            {serviceRequests.length > 0 && (
              <View style={[styles.activityCount, { backgroundColor: `${Colors.accent}15` }]}>
                <Typography style={{ color: Colors.accent, fontSize: FontSizes.sm, fontWeight: '800' }}>{serviceRequests.length}</Typography>
              </View>
            )}
            <Ionicons name="chevron-forward" size={14} color={theme.textMuted} />
          </TouchableOpacity>

          {/* Notificaciones */}
          <TouchableOpacity
            style={[styles.activityRow, { backgroundColor: theme.card }, Shadows.sm]}
            onPress={() => router.push('/notifications' as never)}
            activeOpacity={0.85}
          >
            <View style={[styles.activityIcon, { backgroundColor: `${Colors.primary}15` }]}>
              <Ionicons name="notifications-outline" size={18} color={Colors.primary} />
            </View>
            <View style={styles.activityContent}>
              <Typography variant="label" style={{ color: theme.text }}>Notificaciones</Typography>
              <Typography variant="caption" style={{ color: notifUnread > 0 ? Colors.error : theme.textMuted, fontWeight: notifUnread > 0 ? '600' : '400' }}>
                {notifTotal === 0
                  ? 'Sin notificaciones'
                  : `${notifTotal} recibida${notifTotal !== 1 ? 's' : ''} · ${notifUnread} sin leer`}
              </Typography>
            </View>
            {notifUnread > 0 && (
              <View style={[styles.activityCount, { backgroundColor: `${Colors.error}15` }]}>
                <Typography style={{ color: Colors.error, fontSize: FontSizes.sm, fontWeight: '800' }}>{notifUnread}</Typography>
              </View>
            )}
            <Ionicons name="chevron-forward" size={14} color={theme.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Progreso global */}
        <View style={styles.section}>
          <Typography variant="h3" style={[styles.sectionTitle, { color: theme.text }]}>
            Progreso general
          </Typography>
          <View style={[styles.globalCard, { backgroundColor: theme.card }, Shadows.sm]}>
            <View style={styles.globalRow}>
              <Typography variant="h2" color={Colors.primary}>{globalPercent}%</Typography>
              <Typography variant="body" secondary>
                {totalCompleted}/{totalLessons} lecciones
              </Typography>
            </View>
            <ProgressBar progress={globalPercent} height={10} />
          </View>
        </View>

        {/* Progreso por curso */}
        <View style={styles.section}>
          <Typography variant="h3" style={[styles.sectionTitle, { color: theme.text }]}>
            Por curso
          </Typography>
          {courses.map(course => {
            const total = ContentService.getTotalLessons(course.id);
            const prog = getCourseProgress(course.id, total);
            const completed = getCompletedCount(course.id);
            const done = prog.progress_percent === 100;
            return (
              <View
                key={course.id}
                style={[styles.courseRow, { backgroundColor: theme.card }, Shadows.sm]}
              >
                <View style={[styles.courseAccent, { backgroundColor: course.banner_color }]} />
                <View style={styles.courseInfo}>
                  <View style={styles.courseTitleRow}>
                    <Typography variant="label" style={{ color: theme.text, flex: 1 }} numberOfLines={1}>
                      {course.titulo}
                    </Typography>
                    {done && (
                      <View style={[styles.doneBadge, { backgroundColor: `${Colors.success}18` }]}>
                        <Ionicons name="checkmark-circle" size={12} color={Colors.success} />
                        <Typography variant="caption" color={Colors.success} style={{ fontWeight: '700' }}>
                          Completado
                        </Typography>
                      </View>
                    )}
                  </View>
                  <ProgressBar progress={prog.progress_percent} color={done ? Colors.success : course.banner_color} height={5} />
                  <View style={styles.courseStats}>
                    <Typography variant="caption" secondary>
                      {completed}/{total} lecciones
                    </Typography>
                    <Typography variant="label" color={done ? Colors.success : course.banner_color}>
                      {prog.progress_percent}%
                    </Typography>
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        {/* Info de app */}
        <View style={[styles.appInfo, { backgroundColor: theme.card }]}>
          <View style={styles.appInfoRow}>
            <Ionicons name="information-circle-outline" size={18} color={theme.textMuted} />
            <Typography variant="caption" muted>LearnHub v1.0 · Instituto Bíblico</Typography>
          </View>
          <View style={styles.appInfoRow}>
            <Ionicons name="shield-checkmark-outline" size={18} color={theme.textMuted} />
            <Typography variant="caption" muted>Datos almacenados localmente · 100% privado</Typography>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: { paddingBottom: 40 },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    gap: 6,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarCamera: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
    marginTop: 8,
    paddingHorizontal: 16,
  },
  infoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  editForm: {
    width: '100%',
    paddingHorizontal: Spacing.lg,
    paddingTop: 16,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
    borderRadius: BorderRadius.lg,
    marginTop: 4,
  },
  progressBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    marginTop: 6,
  },
  section: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  sectionTitle: { marginBottom: 12 },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statsFull: {
    marginTop: 10,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    gap: 4,
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  globalCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    gap: 12,
  },
  globalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  courseRow: {
    flexDirection: 'row',
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  courseAccent: { width: 6 },
  courseInfo: { flex: 1, padding: Spacing.md, gap: 8 },
  courseTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  doneBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  courseStats: { flexDirection: 'row', justifyContent: 'space-between' },

  // Mi actividad
  activityBanner: {
    flexDirection: 'row',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    justifyContent: 'space-around',
  },
  activitySummaryItem: {
    alignItems: 'center',
    gap: 2,
    flex: 1,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    gap: 12,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  activityContent: {
    flex: 1,
    gap: 2,
  },
  activityCount: {
    minWidth: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },

  appInfo: {
    marginHorizontal: Spacing.lg,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: 10,
  },
  appInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  // Resumen espiritual
  spiritualCard: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    overflow: 'hidden',
  },
  spiritualRow: {
    flexDirection: 'row',
    paddingVertical: 18,
    paddingHorizontal: 8,
  },
  spiritualDivider: {
    width: 1,
    alignSelf: 'stretch',
    marginVertical: 6,
  },
  spiritualSep: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 16,
  },
  spiritualFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
});
