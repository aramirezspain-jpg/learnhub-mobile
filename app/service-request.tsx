import React, { useState } from 'react';
import {
  View, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, Alert, Platform,
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
import { useServiceRequests } from '@/hooks/useServiceRequests';
import type { ServiceRequestType, ServiceRequestStatus } from '@/types/community';

type Tab = 'form' | 'historial';

const REQUEST_TYPES: {
  key: ServiceRequestType; label: string; desc: string; icon: string; color: string;
}[] = [
  { key: 'consejeria',      label: 'Consejería',         desc: 'Sesión con pastor o consejero', icon: 'chatbubbles-outline',    color: Colors.secondary },
  { key: 'visita_pastoral', label: 'Visita Pastoral',    desc: 'Visita de un líder a tu hogar', icon: 'home-outline',           color: Colors.success },
  { key: 'ayuda',           label: 'Ayuda',              desc: 'Apoyo de la comunidad',         icon: 'hand-left-outline',      color: Colors.accent },
  { key: 'bautismo',        label: 'Bautismo',           desc: 'Solicitar bautismo por inmersión', icon: 'water-outline',      color: Colors.info },
  { key: 'matrimonio',      label: 'Matrimonio',         desc: 'Orientación prematrimonial',    icon: 'heart-outline',          color: Colors.error },
  { key: 'otro',            label: 'Otro',               desc: 'Otro tipo de solicitud',        icon: 'document-text-outline',  color: Colors.primary },
];

const STATUS_CONFIG: Record<ServiceRequestStatus, { label: string; color: string; icon: string }> = {
  pendiente:   { label: 'Pendiente',    color: Colors.warning,  icon: 'time-outline' },
  en_proceso:  { label: 'En proceso',   color: Colors.info,     icon: 'sync-outline' },
  completada:  { label: 'Completada',   color: Colors.success,  icon: 'checkmark-circle-outline' },
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function ServiceRequestScreen() {
  const router = useRouter();
  const scheme = useColorScheme() ?? 'dark';
  const theme = Colors[scheme];
  const { serviceRequests, submitting, submit, remove } = useServiceRequests();

  const [tab, setTab] = useState<Tab>('form');
  const [selectedType, setSelectedType] = useState<ServiceRequestType | null>(null);
  const [descripcion, setDescripcion] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const canSubmit = selectedType !== null;
  const selectedCfg = REQUEST_TYPES.find(t => t.key === selectedType);

  const handleSubmit = async () => {
    if (!canSubmit || !selectedType) return;
    await submit({ tipo: selectedType, descripcion: descripcion.trim() || undefined });
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    setSubmitted(true);
    setSelectedType(null);
    setDescripcion('');
    setTimeout(() => { setSubmitted(false); setTab('historial'); }, 1200);
  };

  const handleDelete = (id: string) => {
    Alert.alert('Eliminar solicitud', '¿Deseas eliminar esta solicitud?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => remove(id) },
    ]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color={theme.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Typography variant="overline" secondary>Comunidad</Typography>
          <Typography variant="h2" style={{ color: theme.text }}>Solicitudes</Typography>
        </View>
        {serviceRequests.length > 0 && (
          <View style={[styles.countBadge, { backgroundColor: `${Colors.accent}18` }]}>
            <Ionicons name="document-text" size={10} color={Colors.accent} />
            <Typography style={{ color: Colors.accent, fontSize: 10, fontWeight: '700' }}>
              {serviceRequests.length}
            </Typography>
          </View>
        )}
      </View>

      {/* Tabs */}
      <View style={[styles.tabs, { borderBottomColor: theme.border }]}>
        {(['form', 'historial'] as Tab[]).map(t => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, tab === t && { borderBottomColor: Colors.accent, borderBottomWidth: 2 }]}
            onPress={() => setTab(t)}
            activeOpacity={0.8}
          >
            <Ionicons
              name={t === 'form' ? 'add-circle-outline' : 'list-outline'}
              size={15}
              color={tab === t ? Colors.accent : theme.textMuted}
            />
            <Typography style={{
              color: tab === t ? Colors.accent : theme.textMuted,
              fontSize: FontSizes.sm, fontWeight: tab === t ? '700' : '500',
            }}>
              {t === 'form' ? 'Nueva solicitud' : `Historial${serviceRequests.length > 0 ? ` (${serviceRequests.length})` : ''}`}
            </Typography>
          </TouchableOpacity>
        ))}
      </View>

      {tab === 'form' ? (
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {submitted && (
            <View style={[styles.successBanner, { backgroundColor: `${Colors.success}18`, borderColor: `${Colors.success}30` }]}>
              <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
              <Typography style={{ color: Colors.success, fontWeight: '600', fontSize: FontSizes.sm }}>
                ¡Solicitud enviada! El equipo pastoral te contactará.
              </Typography>
            </View>
          )}

          {/* Tipo de solicitud */}
          <View style={styles.fieldGroup}>
            <Typography variant="caption" secondary style={styles.fieldLabel}>
              Tipo de solicitud <Typography style={{ color: Colors.error }}>*</Typography>
            </Typography>
            <View style={styles.typeGrid}>
              {REQUEST_TYPES.map(rt => {
                const active = selectedType === rt.key;
                return (
                  <TouchableOpacity
                    key={rt.key}
                    style={[
                      styles.typeCard,
                      { backgroundColor: active ? `${rt.color}18` : theme.card,
                        borderColor: active ? rt.color : theme.border,
                        borderWidth: active ? 1.5 : 1 },
                      Shadows.sm,
                    ]}
                    onPress={() => setSelectedType(rt.key)}
                    activeOpacity={0.85}
                  >
                    <View style={[styles.typeIcon, { backgroundColor: `${rt.color}${active ? '25' : '15'}` }]}>
                      <Ionicons name={rt.icon as any} size={22} color={rt.color} />
                    </View>
                    <Typography variant="label" style={{ color: active ? rt.color : theme.text, textAlign: 'center', fontSize: FontSizes.sm }}>
                      {rt.label}
                    </Typography>
                    <Typography style={{ color: theme.textMuted, fontSize: 9, textAlign: 'center', lineHeight: 13 }} numberOfLines={2}>
                      {rt.desc}
                    </Typography>
                    {active && (
                      <View style={[styles.checkOverlay, { backgroundColor: rt.color }]}>
                        <Ionicons name="checkmark" size={10} color="#FFF" />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Info del tipo seleccionado */}
          {selectedCfg && (
            <View style={[styles.selectedInfo, { backgroundColor: `${selectedCfg.color}12`, borderColor: `${selectedCfg.color}30` }]}>
              <Ionicons name={selectedCfg.icon as any} size={18} color={selectedCfg.color} />
              <View style={{ flex: 1 }}>
                <Typography variant="label" style={{ color: selectedCfg.color }}>{selectedCfg.label}</Typography>
                <Typography variant="caption" muted>{selectedCfg.desc}</Typography>
              </View>
            </View>
          )}

          {/* Descripción */}
          <View style={styles.fieldGroup}>
            <Typography variant="caption" secondary style={styles.fieldLabel}>
              Detalles adicionales <Typography muted>(opcional)</Typography>
            </Typography>
            <TextInput
              style={[
                styles.input, styles.textArea,
                { backgroundColor: theme.card, color: theme.text, borderColor: descripcion.length > 0 ? `${Colors.accent}50` : theme.border },
              ]}
              placeholder="Comparte cualquier detalle importante sobre tu solicitud..."
              placeholderTextColor={theme.textMuted}
              value={descripcion}
              onChangeText={setDescripcion}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              maxLength={400}
            />
            <Typography variant="caption" muted style={{ alignSelf: 'flex-end', marginTop: 3 }}>
              {descripcion.length}/400
            </Typography>
          </View>

          <Button
            label={submitting ? 'Enviando...' : 'Enviar solicitud'}
            onPress={handleSubmit}
            disabled={!canSubmit || submitting}
            loading={submitting}
            fullWidth
            iconLeft={<Ionicons name="send-outline" size={16} color="#FFF" />}
            style={{ marginTop: 4, backgroundColor: Colors.accent }}
          />

          {/* Proceso */}
          <View style={[styles.processCard, { backgroundColor: theme.card }]}>
            <Typography variant="label" style={{ color: theme.text, marginBottom: Spacing.md }}>
              ¿Cómo funciona?
            </Typography>
            {[
              { step: '1', text: 'Selecciona el tipo de solicitud',    icon: 'hand-right-outline' },
              { step: '2', text: 'Describe los detalles (opcional)',    icon: 'create-outline' },
              { step: '3', text: 'La pastoral recibe tu solicitud',     icon: 'notifications-outline' },
              { step: '4', text: 'Te contactamos para coordinar',       icon: 'call-outline' },
            ].map(item => (
              <View key={item.step} style={styles.processStep}>
                <View style={[styles.stepNum, { backgroundColor: `${Colors.accent}20` }]}>
                  <Typography style={{ color: Colors.accent, fontSize: 10, fontWeight: '800' }}>{item.step}</Typography>
                </View>
                <Ionicons name={item.icon as any} size={14} color={theme.textMuted} />
                <Typography variant="caption" secondary style={{ flex: 1 }}>{item.text}</Typography>
              </View>
            ))}
          </View>
        </ScrollView>
      ) : (
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          {serviceRequests.length === 0 ? (
            <EmptyState
              icon="document-text-outline"
              title="Sin solicitudes"
              subtitle="Tus solicitudes pastorales aparecerán aquí."
              color={Colors.accent}
            />
          ) : (
            serviceRequests.map(sr => {
              const typeCfg = REQUEST_TYPES.find(t => t.key === sr.tipo)!;
              const statusCfg = STATUS_CONFIG[sr.estado];
              return (
                <View key={sr.id} style={[styles.histCard, { backgroundColor: theme.card }, Shadows.sm]}>
                  <View style={[styles.histAccent, { backgroundColor: typeCfg.color }]} />
                  <View style={{ flex: 1, padding: Spacing.md, gap: 6 }}>
                    <View style={styles.histHeader}>
                      <View style={[styles.typeBadge, { backgroundColor: `${typeCfg.color}15` }]}>
                        <Ionicons name={typeCfg.icon as any} size={10} color={typeCfg.color} />
                        <Typography style={{ color: typeCfg.color, fontSize: 9, fontWeight: '700' }}>{typeCfg.label}</Typography>
                      </View>
                      <View style={[styles.statusBadge, { backgroundColor: `${statusCfg.color}15` }]}>
                        <Ionicons name={statusCfg.icon as any} size={10} color={statusCfg.color} />
                        <Typography style={{ color: statusCfg.color, fontSize: 9, fontWeight: '700' }}>{statusCfg.label}</Typography>
                      </View>
                    </View>

                    <Typography variant="label" style={{ color: theme.text }}>
                      {typeCfg.label}
                    </Typography>
                    {sr.descripcion ? (
                      <Typography variant="caption" secondary numberOfLines={2}>{sr.descripcion}</Typography>
                    ) : (
                      <Typography variant="caption" muted>Sin detalles adicionales</Typography>
                    )}

                    <View style={styles.histFooter}>
                      <Typography variant="caption" muted>{formatDate(sr.created_at)}</Typography>
                      <TouchableOpacity
                        style={[styles.deleteBtn, { backgroundColor: `${Colors.error}15` }]}
                        onPress={() => handleDelete(sr.id)}
                        activeOpacity={0.8}
                      >
                        <Ionicons name="trash-outline" size={13} color={Colors.error} />
                      </TouchableOpacity>
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
  tabs: { flexDirection: 'row', borderBottomWidth: 1, paddingHorizontal: Spacing.lg },
  tab: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 12, marginRight: Spacing.lg,
    borderBottomWidth: 2, borderBottomColor: 'transparent',
  },
  content: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: 40, gap: 14 },
  successBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: Spacing.md, borderRadius: BorderRadius.lg, borderWidth: 1,
  },
  fieldGroup: { gap: 6 },
  fieldLabel: { marginBottom: 2 },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  typeCard: {
    width: '47%', borderRadius: BorderRadius.xl,
    padding: Spacing.md, alignItems: 'center', gap: 7,
    position: 'relative',
  },
  typeIcon: {
    width: 50, height: 50, borderRadius: 25,
    alignItems: 'center', justifyContent: 'center',
  },
  checkOverlay: {
    position: 'absolute', top: 8, right: 8,
    width: 18, height: 18, borderRadius: 9,
    alignItems: 'center', justifyContent: 'center',
  },
  selectedInfo: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: Spacing.md, borderRadius: BorderRadius.lg, borderWidth: 1,
  },
  input: {
    borderRadius: BorderRadius.md, borderWidth: 1,
    paddingHorizontal: Spacing.md, paddingVertical: 13,
    fontSize: FontSizes.md,
  },
  textArea: { height: 110, paddingTop: 13 },
  processCard: { borderRadius: BorderRadius.xl, padding: Spacing.lg },
  processStep: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  stepNum: {
    width: 22, height: 22, borderRadius: 11,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  histCard: { flexDirection: 'row', borderRadius: BorderRadius.lg, overflow: 'hidden' },
  histAccent: { width: 4 },
  histHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  typeBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 7, paddingVertical: 3, borderRadius: BorderRadius.full,
  },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 7, paddingVertical: 3, borderRadius: BorderRadius.full,
  },
  histFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 },
  deleteBtn: { padding: 7, borderRadius: BorderRadius.full },
});
