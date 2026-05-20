import React, { useState, useMemo } from 'react';
import {
  View, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, Alert, Switch, Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Spacing, BorderRadius, Shadows, FontSizes } from '@/constants/theme';
import { Typography } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { usePrayerRequests } from '@/hooks/usePrayerRequests';
import type { PrayerCategory, PrayerRequestStatus } from '@/types/community';

type Tab = 'form' | 'historial';

const CATEGORIES: { key: PrayerCategory; label: string; icon: string; color: string }[] = [
  { key: 'sanidad',    label: 'Sanidad',    icon: 'medkit-outline',        color: Colors.error },
  { key: 'familia',    label: 'Familia',    icon: 'home-outline',          color: Colors.success },
  { key: 'trabajo',    label: 'Trabajo',    icon: 'briefcase-outline',     color: Colors.info },
  { key: 'finanzas',   label: 'Finanzas',   icon: 'cash-outline',          color: Colors.accent },
  { key: 'espiritual', label: 'Espiritual', icon: 'sparkles-outline',      color: Colors.secondary },
  { key: 'otro',       label: 'Otro',       icon: 'ellipsis-horizontal-outline', color: Colors.primary },
];

const STATUS_CONFIG: Record<PrayerRequestStatus, { label: string; color: string; icon: string }> = {
  pendiente:  { label: 'Pendiente',  color: Colors.warning,  icon: 'time-outline' },
  respondida: { label: 'Respondida', color: Colors.success,  icon: 'checkmark-circle-outline' },
  archivada:  { label: 'Archivada',  color: Colors.primary,  icon: 'archive-outline' },
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function PrayerRequestsScreen() {
  const router = useRouter();
  const scheme = useColorScheme() ?? 'dark';
  const theme = Colors[scheme];
  const { prayerRequests, submitting, submit, updateStatus, remove } = usePrayerRequests();

  const [tab, setTab] = useState<Tab>('form');
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [categoria, setCategoria] = useState<PrayerCategory>('espiritual');
  const [privado, setPrivado] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const canSubmit = titulo.trim().length >= 3;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    await submit({ titulo: titulo.trim(), descripcion: descripcion.trim() || undefined, categoria, privado });
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    setSubmitted(true);
    setTitulo('');
    setDescripcion('');
    setCategoria('espiritual');
    setPrivado(false);
    setTimeout(() => { setSubmitted(false); setTab('historial'); }, 1200);
  };

  const handleDelete = (id: string) => {
    Alert.alert('Eliminar petición', '¿Deseas eliminar esta petición?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => remove(id) },
    ]);
  };

  const counts = useMemo(() => ({
    pendiente: prayerRequests.filter(p => p.estado === 'pendiente').length,
    respondida: prayerRequests.filter(p => p.estado === 'respondida').length,
  }), [prayerRequests]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color={theme.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Typography variant="overline" secondary>Comunidad</Typography>
          <Typography variant="h2" style={{ color: theme.text }}>Peticiones de Oración</Typography>
        </View>
        {prayerRequests.length > 0 && (
          <View style={[styles.countBadge, { backgroundColor: `${Colors.secondary}18` }]}>
            <Ionicons name="hand-left" size={10} color={Colors.secondary} />
            <Typography style={{ color: Colors.secondary, fontSize: 10, fontWeight: '700' }}>
              {prayerRequests.length}
            </Typography>
          </View>
        )}
      </View>

      {/* Tabs */}
      <View style={[styles.tabs, { borderBottomColor: theme.border }]}>
        {(['form', 'historial'] as Tab[]).map(t => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, tab === t && { borderBottomColor: Colors.secondary, borderBottomWidth: 2 }]}
            onPress={() => setTab(t)}
            activeOpacity={0.8}
          >
            <Ionicons
              name={t === 'form' ? 'add-circle-outline' : 'list-outline'}
              size={15}
              color={tab === t ? Colors.secondary : theme.textMuted}
            />
            <Typography style={{
              color: tab === t ? Colors.secondary : theme.textMuted,
              fontSize: FontSizes.sm, fontWeight: tab === t ? '700' : '500',
            }}>
              {t === 'form' ? 'Nueva' : `Historial${prayerRequests.length > 0 ? ` (${prayerRequests.length})` : ''}`}
            </Typography>
          </TouchableOpacity>
        ))}
      </View>

      {tab === 'form' ? (
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {/* Success feedback */}
          {submitted && (
            <View style={[styles.successBanner, { backgroundColor: `${Colors.success}18`, borderColor: `${Colors.success}30` }]}>
              <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
              <Typography style={{ color: Colors.success, fontWeight: '600', fontSize: FontSizes.sm }}>
                ¡Petición guardada! Dios escucha tu oración.
              </Typography>
            </View>
          )}

          {/* Título */}
          <View style={styles.fieldGroup}>
            <Typography variant="caption" secondary style={styles.fieldLabel}>
              Título <Typography style={{ color: Colors.error }}>*</Typography>
            </Typography>
            <TextInput
              style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: titulo.length > 0 ? `${Colors.secondary}50` : theme.border }]}
              placeholder="¿Por qué quieres orar?"
              placeholderTextColor={theme.textMuted}
              value={titulo}
              onChangeText={setTitulo}
              maxLength={100}
            />
            <Typography variant="caption" muted style={{ alignSelf: 'flex-end', marginTop: 3 }}>
              {titulo.length}/100
            </Typography>
          </View>

          {/* Descripción */}
          <View style={styles.fieldGroup}>
            <Typography variant="caption" secondary style={styles.fieldLabel}>
              Descripción <Typography muted>(opcional)</Typography>
            </Typography>
            <TextInput
              style={[styles.input, styles.textArea, { backgroundColor: theme.card, color: theme.text, borderColor: descripcion.length > 0 ? `${Colors.secondary}50` : theme.border }]}
              placeholder="Comparte más detalles sobre tu petición..."
              placeholderTextColor={theme.textMuted}
              value={descripcion}
              onChangeText={setDescripcion}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              maxLength={500}
            />
            <Typography variant="caption" muted style={{ alignSelf: 'flex-end', marginTop: 3 }}>
              {descripcion.length}/500
            </Typography>
          </View>

          {/* Categoría */}
          <View style={styles.fieldGroup}>
            <Typography variant="caption" secondary style={styles.fieldLabel}>Categoría</Typography>
            <View style={styles.categoryGrid}>
              {CATEGORIES.map(cat => {
                const active = categoria === cat.key;
                return (
                  <TouchableOpacity
                    key={cat.key}
                    style={[
                      styles.categoryChip,
                      { backgroundColor: active ? cat.color : `${cat.color}12`, borderColor: active ? cat.color : 'transparent' },
                    ]}
                    onPress={() => setCategoria(cat.key)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name={cat.icon as any} size={13} color={active ? '#FFF' : cat.color} />
                    <Typography style={{ color: active ? '#FFF' : cat.color, fontSize: FontSizes.xs, fontWeight: '600' }}>
                      {cat.label}
                    </Typography>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Privado */}
          <View style={[styles.toggleRow, { backgroundColor: theme.card }]}>
            <View style={[styles.toggleIcon, { backgroundColor: `${Colors.primary}15` }]}>
              <Ionicons name={privado ? 'lock-closed' : 'globe-outline'} size={16} color={Colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Typography variant="label" style={{ color: theme.text }}>
                {privado ? 'Petición privada' : 'Petición pública'}
              </Typography>
              <Typography variant="caption" muted>
                {privado ? 'Solo visible para ti' : 'Visible para la comunidad'}
              </Typography>
            </View>
            <Switch
              value={privado}
              onValueChange={setPrivado}
              trackColor={{ false: theme.border, true: `${Colors.primary}70` }}
              thumbColor={privado ? Colors.primary : theme.textMuted}
            />
          </View>

          {/* Submit */}
          <Button
            label={submitting ? 'Guardando...' : 'Enviar petición'}
            onPress={handleSubmit}
            disabled={!canSubmit || submitting}
            loading={submitting}
            fullWidth
            iconLeft={<Ionicons name="send-outline" size={16} color="#FFF" />}
            style={{ marginTop: 4, backgroundColor: Colors.secondary }}
          />

          <View style={[styles.infoRow, { backgroundColor: theme.card }]}>
            <Ionicons name="information-circle-outline" size={14} color={theme.textMuted} />
            <Typography variant="caption" muted style={{ flex: 1 }}>
              Las peticiones se guardan localmente en tu dispositivo.
            </Typography>
          </View>
        </ScrollView>
      ) : (
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          {/* Resumen */}
          {prayerRequests.length > 0 && (
            <View style={styles.summaryRow}>
              {[
                { label: 'Pendientes', count: counts.pendiente, color: Colors.warning },
                { label: 'Respondidas', count: counts.respondida, color: Colors.success },
              ].map(s => (
                <View key={s.label} style={[styles.summaryChip, { backgroundColor: `${s.color}15` }]}>
                  <Typography style={{ color: s.color, fontSize: 18, fontWeight: '800' }}>{s.count}</Typography>
                  <Typography style={{ color: s.color, fontSize: 10, fontWeight: '600' }}>{s.label}</Typography>
                </View>
              ))}
            </View>
          )}

          {prayerRequests.length === 0 ? (
            <EmptyState
              icon="hand-left-outline"
              title="Sin peticiones"
              subtitle="Tus peticiones aparecerán aquí. ¡Anímate a compartir con Dios!"
              color={Colors.secondary}
            />
          ) : (
            prayerRequests.map(pr => {
              const cat = CATEGORIES.find(c => c.key === pr.categoria)!;
              const status = STATUS_CONFIG[pr.estado];
              return (
                <View key={pr.id} style={[styles.histCard, { backgroundColor: theme.card }, Shadows.sm]}>
                  {/* Accent */}
                  <View style={[styles.histAccent, { backgroundColor: cat.color }]} />
                  <View style={{ flex: 1, padding: Spacing.md, gap: 6 }}>
                    {/* Header */}
                    <View style={styles.histHeader}>
                      <View style={[styles.catMini, { backgroundColor: `${cat.color}15` }]}>
                        <Ionicons name={cat.icon as any} size={10} color={cat.color} />
                        <Typography style={{ color: cat.color, fontSize: 9, fontWeight: '700' }}>{cat.label}</Typography>
                      </View>
                      <View style={styles.histHeaderRight}>
                        <View style={[styles.statusBadge, { backgroundColor: `${status.color}15` }]}>
                          <Ionicons name={status.icon as any} size={10} color={status.color} />
                          <Typography style={{ color: status.color, fontSize: 9, fontWeight: '700' }}>{status.label}</Typography>
                        </View>
                        {pr.privado && (
                          <View style={[styles.privateBadge, { backgroundColor: `${Colors.primary}12` }]}>
                            <Ionicons name="lock-closed" size={9} color={Colors.primary} />
                          </View>
                        )}
                      </View>
                    </View>

                    <Typography variant="label" style={{ color: theme.text }} numberOfLines={2}>
                      {pr.titulo}
                    </Typography>
                    {pr.descripcion ? (
                      <Typography variant="caption" secondary numberOfLines={2}>{pr.descripcion}</Typography>
                    ) : null}

                    {/* Footer */}
                    <View style={styles.histFooter}>
                      <Typography variant="caption" muted>{formatDate(pr.created_at)}</Typography>
                      <View style={styles.histActions}>
                        {pr.estado === 'pendiente' && (
                          <TouchableOpacity
                            style={[styles.actionBtn, { backgroundColor: `${Colors.success}15` }]}
                            onPress={() => updateStatus(pr.id, 'respondida')}
                            activeOpacity={0.8}
                          >
                            <Ionicons name="checkmark" size={13} color={Colors.success} />
                            <Typography style={{ color: Colors.success, fontSize: 10, fontWeight: '600' }}>Respondida</Typography>
                          </TouchableOpacity>
                        )}
                        <TouchableOpacity
                          style={[styles.actionBtn, { backgroundColor: `${Colors.error}15` }]}
                          onPress={() => handleDelete(pr.id)}
                          activeOpacity={0.8}
                        >
                          <Ionicons name="trash-outline" size={13} color={Colors.error} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
      )}
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
  countBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 9, paddingVertical: 5, borderRadius: BorderRadius.full,
  },
  tabs: {
    flexDirection: 'row', borderBottomWidth: 1,
    paddingHorizontal: Spacing.lg,
  },
  tab: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 12, marginRight: Spacing.lg, borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  content: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: 40, gap: 14 },
  successBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: Spacing.md, borderRadius: BorderRadius.lg, borderWidth: 1,
  },
  fieldGroup: { gap: 6 },
  fieldLabel: { marginBottom: 2 },
  input: {
    borderRadius: BorderRadius.md, borderWidth: 1,
    paddingHorizontal: Spacing.md, paddingVertical: 13,
    fontSize: FontSizes.md,
  },
  textArea: { height: 110, paddingTop: 13 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  categoryChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: BorderRadius.full, borderWidth: 1,
  },
  toggleRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    padding: Spacing.md, borderRadius: BorderRadius.lg,
  },
  toggleIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  infoRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    padding: Spacing.md, borderRadius: BorderRadius.lg,
  },
  summaryRow: { flexDirection: 'row', gap: 10 },
  summaryChip: {
    flex: 1, alignItems: 'center', paddingVertical: 14,
    borderRadius: BorderRadius.lg, gap: 2,
  },
  histCard: { flexDirection: 'row', borderRadius: BorderRadius.lg, overflow: 'hidden' },
  histAccent: { width: 4 },
  histHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  histHeaderRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  catMini: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 7, paddingVertical: 3, borderRadius: BorderRadius.full,
  },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 7, paddingVertical: 3, borderRadius: BorderRadius.full,
  },
  privateBadge: { padding: 4, borderRadius: BorderRadius.full },
  histFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 },
  histActions: { flexDirection: 'row', gap: 6 },
  actionBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 9, paddingVertical: 5, borderRadius: BorderRadius.full,
  },
});
