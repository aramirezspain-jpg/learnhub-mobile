import React, { useState, useMemo } from 'react';
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
import { useLeadershipMessages } from '@/hooks/useLeadershipMessages';
import { useCommunityStore } from '@/store/community.store';
import type { MessagePriority } from '@/types/community';

type Tab = 'form' | 'historial';

const PRIORITY_CONFIG: Record<MessagePriority, { label: string; color: string; icon: string; desc: string }> = {
  normal:  { label: 'Normal',  color: Colors.info,  icon: 'chatbubble-outline',   desc: 'Respuesta en 1–3 días' },
  urgente: { label: 'Urgente', color: Colors.error, icon: 'alert-circle-outline',  desc: 'Requiere atención pronto' },
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
}

function getInitials(name: string): string {
  return name.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('');
}

export default function ContactLeadershipScreen() {
  const router = useRouter();
  const scheme = useColorScheme() ?? 'dark';
  const theme = Colors[scheme];
  const { messages, submitting, submit, remove } = useLeadershipMessages();
  const contacts = useCommunityStore(s => s.contacts);

  const ministries = useMemo(
    () => contacts.filter(c => c.tipo === 'lider' || c.tipo === 'ministerio'),
    [contacts]
  );

  const [tab, setTab] = useState<Tab>('form');
  const [selectedMinistry, setSelectedMinistry] = useState<string>('');
  const [mensaje, setMensaje] = useState('');
  const [prioridad, setPrioridad] = useState<MessagePriority>('normal');
  const [submitted, setSubmitted] = useState(false);

  const canSubmit = selectedMinistry.length > 0 && mensaje.trim().length >= 10;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    await submit({ ministerio: selectedMinistry, mensaje: mensaje.trim(), prioridad });
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    setSubmitted(true);
    setMensaje('');
    setSelectedMinistry('');
    setPrioridad('normal');
    setTimeout(() => { setSubmitted(false); setTab('historial'); }, 1200);
  };

  const handleDelete = (id: string) => {
    Alert.alert('Eliminar mensaje', '¿Deseas eliminar este mensaje del historial?', [
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
          <Typography variant="h2" style={{ color: theme.text }}>Contactar Liderazgo</Typography>
        </View>
        {messages.length > 0 && (
          <View style={[styles.countBadge, { backgroundColor: `${Colors.info}18` }]}>
            <Ionicons name="chatbubble" size={10} color={Colors.info} />
            <Typography style={{ color: Colors.info, fontSize: 10, fontWeight: '700' }}>
              {messages.length}
            </Typography>
          </View>
        )}
      </View>

      {/* Tabs */}
      <View style={[styles.tabs, { borderBottomColor: theme.border }]}>
        {(['form', 'historial'] as Tab[]).map(t => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, tab === t && { borderBottomColor: Colors.info, borderBottomWidth: 2 }]}
            onPress={() => setTab(t)}
            activeOpacity={0.8}
          >
            <Ionicons
              name={t === 'form' ? 'create-outline' : 'time-outline'}
              size={15}
              color={tab === t ? Colors.info : theme.textMuted}
            />
            <Typography style={{
              color: tab === t ? Colors.info : theme.textMuted,
              fontSize: FontSizes.sm, fontWeight: tab === t ? '700' : '500',
            }}>
              {t === 'form' ? 'Nuevo mensaje' : `Enviados${messages.length > 0 ? ` (${messages.length})` : ''}`}
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
                ¡Mensaje guardado! El liderazgo lo recibirá pronto.
              </Typography>
            </View>
          )}

          {/* Seleccionar ministerio */}
          <View style={styles.fieldGroup}>
            <Typography variant="caption" secondary style={styles.fieldLabel}>
              Destinatario <Typography style={{ color: Colors.error }}>*</Typography>
            </Typography>
            {ministries.length === 0 ? (
              <View style={[styles.emptyMinistry, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <Typography variant="caption" muted>No hay contactos disponibles.</Typography>
              </View>
            ) : (
              ministries.map(contact => {
                const selected = selectedMinistry === contact.nombre;
                return (
                  <TouchableOpacity
                    key={contact.id}
                    style={[
                      styles.ministryRow,
                      { backgroundColor: selected ? `${contact.color}18` : theme.card,
                        borderColor: selected ? contact.color : 'transparent',
                        borderWidth: selected ? 1.5 : 1 },
                      Shadows.sm,
                    ]}
                    onPress={() => setSelectedMinistry(contact.nombre)}
                    activeOpacity={0.85}
                  >
                    <View style={[styles.ministryAvatar, { backgroundColor: contact.color }]}>
                      <Typography style={{ color: '#FFF', fontSize: 13, fontWeight: '700' }}>
                        {getInitials(contact.nombre)}
                      </Typography>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Typography variant="label" style={{ color: theme.text }} numberOfLines={1}>
                        {contact.nombre}
                      </Typography>
                      {contact.cargo ? (
                        <Typography variant="caption" style={{ color: contact.color, fontWeight: '600', fontSize: 11 }}>
                          {contact.cargo}
                        </Typography>
                      ) : null}
                    </View>
                    {selected ? (
                      <Ionicons name="checkmark-circle" size={20} color={contact.color} />
                    ) : (
                      <Ionicons name="radio-button-off" size={20} color={theme.textMuted} />
                    )}
                  </TouchableOpacity>
                );
              })
            )}
          </View>

          {/* Mensaje */}
          <View style={styles.fieldGroup}>
            <Typography variant="caption" secondary style={styles.fieldLabel}>
              Mensaje <Typography style={{ color: Colors.error }}>*</Typography>
            </Typography>
            <TextInput
              style={[
                styles.input, styles.textArea,
                { backgroundColor: theme.card, color: theme.text, borderColor: mensaje.length > 0 ? `${Colors.info}50` : theme.border },
              ]}
              placeholder="Escribe tu mensaje al liderazgo..."
              placeholderTextColor={theme.textMuted}
              value={mensaje}
              onChangeText={setMensaje}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
              maxLength={800}
            />
            <Typography variant="caption" muted style={{ alignSelf: 'flex-end', marginTop: 3 }}>
              {mensaje.length}/800 {mensaje.length < 10 && mensaje.length > 0 ? '· Mínimo 10 caracteres' : ''}
            </Typography>
          </View>

          {/* Prioridad */}
          <View style={styles.fieldGroup}>
            <Typography variant="caption" secondary style={styles.fieldLabel}>Prioridad</Typography>
            <View style={styles.priorityRow}>
              {(Object.entries(PRIORITY_CONFIG) as [MessagePriority, typeof PRIORITY_CONFIG[MessagePriority]][]).map(([key, cfg]) => {
                const active = prioridad === key;
                return (
                  <TouchableOpacity
                    key={key}
                    style={[
                      styles.priorityChip,
                      { flex: 1, backgroundColor: active ? cfg.color : `${cfg.color}12`, borderColor: active ? cfg.color : 'transparent' },
                    ]}
                    onPress={() => setPrioridad(key)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name={cfg.icon as any} size={16} color={active ? '#FFF' : cfg.color} />
                    <View>
                      <Typography style={{ color: active ? '#FFF' : cfg.color, fontSize: FontSizes.sm, fontWeight: '700' }}>
                        {cfg.label}
                      </Typography>
                      <Typography style={{ color: active ? 'rgba(255,255,255,0.75)' : theme.textMuted, fontSize: 9 }}>
                        {cfg.desc}
                      </Typography>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <Button
            label={submitting ? 'Enviando...' : 'Enviar mensaje'}
            onPress={handleSubmit}
            disabled={!canSubmit || submitting}
            loading={submitting}
            fullWidth
            iconLeft={<Ionicons name="send-outline" size={16} color="#FFF" />}
            style={{ marginTop: 4, backgroundColor: Colors.info }}
          />

          <View style={[styles.infoRow, { backgroundColor: theme.card }]}>
            <Ionicons name="shield-checkmark-outline" size={14} color={theme.textMuted} />
            <Typography variant="caption" muted style={{ flex: 1 }}>
              Tus mensajes se guardan localmente. El liderazgo los recibirá en la próxima integración.
            </Typography>
          </View>
        </ScrollView>
      ) : (
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          {messages.length === 0 ? (
            <EmptyState
              icon="chatbubble-ellipses-outline"
              title="Sin mensajes enviados"
              subtitle="Tus mensajes al liderazgo aparecerán aquí."
              color={Colors.info}
            />
          ) : (
            messages.map(msg => {
              const pCfg = PRIORITY_CONFIG[msg.prioridad];
              return (
                <View key={msg.id} style={[styles.histCard, { backgroundColor: theme.card }, Shadows.sm]}>
                  <View style={[styles.histAccent, { backgroundColor: pCfg.color }]} />
                  <View style={{ flex: 1, padding: Spacing.md, gap: 6 }}>
                    <View style={styles.histHeader}>
                      <View style={[styles.priorityBadge, { backgroundColor: `${pCfg.color}15` }]}>
                        <Ionicons name={pCfg.icon as any} size={10} color={pCfg.color} />
                        <Typography style={{ color: pCfg.color, fontSize: 9, fontWeight: '700' }}>{pCfg.label}</Typography>
                      </View>
                      <View style={[styles.sentBadge, { backgroundColor: `${Colors.success}12` }]}>
                        <Ionicons name="checkmark-done" size={10} color={Colors.success} />
                        <Typography style={{ color: Colors.success, fontSize: 9, fontWeight: '600' }}>Guardado</Typography>
                      </View>
                    </View>
                    <View style={styles.toRow}>
                      <Typography variant="caption" muted>Para:</Typography>
                      <Typography variant="caption" style={{ color: Colors.info, fontWeight: '600' }}>
                        {msg.ministerio}
                      </Typography>
                    </View>
                    <Typography variant="caption" secondary numberOfLines={3} style={{ lineHeight: 18 }}>
                      {msg.mensaje}
                    </Typography>
                    <View style={styles.histFooter}>
                      <Typography variant="caption" muted>{formatDate(msg.created_at)}</Typography>
                      <TouchableOpacity
                        style={[styles.deleteBtn, { backgroundColor: `${Colors.error}15` }]}
                        onPress={() => handleDelete(msg.id)}
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
  emptyMinistry: { padding: Spacing.md, borderRadius: BorderRadius.md, borderWidth: 1, alignItems: 'center' },
  ministryRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    borderRadius: BorderRadius.lg, padding: Spacing.md, marginBottom: 8,
  },
  ministryAvatar: {
    width: 42, height: 42, borderRadius: 21,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  input: {
    borderRadius: BorderRadius.md, borderWidth: 1,
    paddingHorizontal: Spacing.md, paddingVertical: 13,
    fontSize: FontSizes.md,
  },
  textArea: { height: 130, paddingTop: 13 },
  priorityRow: { flexDirection: 'row', gap: 10 },
  priorityChip: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: Spacing.md, borderRadius: BorderRadius.lg, borderWidth: 1,
  },
  infoRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    padding: Spacing.md, borderRadius: BorderRadius.lg,
  },
  histCard: { flexDirection: 'row', borderRadius: BorderRadius.lg, overflow: 'hidden' },
  histAccent: { width: 4 },
  histHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  priorityBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 7, paddingVertical: 3, borderRadius: BorderRadius.full,
  },
  sentBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 7, paddingVertical: 3, borderRadius: BorderRadius.full,
  },
  toRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  histFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 },
  deleteBtn: { padding: 7, borderRadius: BorderRadius.full },
});
