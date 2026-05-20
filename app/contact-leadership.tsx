import React from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Spacing, BorderRadius, Shadows, FontSizes } from '@/constants/theme';
import { Typography } from '@/components/ui/Typography';

const TOPICS = [
  { id: '1', label: 'Consejería pastoral', icon: 'heart-outline', color: Colors.secondary },
  { id: '2', label: 'Información de la iglesia', icon: 'information-circle-outline', color: Colors.info },
  { id: '3', label: 'Solicitud de visita', icon: 'home-outline', color: Colors.success },
  { id: '4', label: 'Asunto administrativo', icon: 'document-text-outline', color: Colors.accent },
  { id: '5', label: 'Otro', icon: 'chatbubble-ellipses-outline', color: Colors.primary },
];

export default function ContactLeadershipScreen() {
  const router = useRouter();
  const scheme = useColorScheme() ?? 'dark';
  const theme = Colors[scheme];

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
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Hero */}
        <View style={[styles.hero, { backgroundColor: `${Colors.info}15`, borderColor: `${Colors.info}30`, borderWidth: 1 }]}>
          <View style={[styles.heroIcon, { backgroundColor: `${Colors.info}20` }]}>
            <Ionicons name="chatbubble-ellipses" size={32} color={Colors.info} />
          </View>
          <Typography variant="h3" style={{ color: Colors.info, textAlign: 'center' }}>
            Comunícate con tu líder
          </Typography>
          <Typography variant="body" secondary style={{ textAlign: 'center', lineHeight: 22 }}>
            Envía un mensaje directo a la pastoral. Te responderemos a la brevedad posible.
          </Typography>
          <View style={[styles.comingSoonBadge, { backgroundColor: `${Colors.accent}20`, borderColor: `${Colors.accent}40`, borderWidth: 1 }]}>
            <Ionicons name="time-outline" size={12} color={Colors.accent} />
            <Typography style={{ color: Colors.accent, fontSize: FontSizes.xs, fontWeight: '700' }}>
              PRÓXIMAMENTE · FASE 4
            </Typography>
          </View>
        </View>

        {/* Selección de tema */}
        <View>
          <Typography variant="label" secondary style={{ marginBottom: Spacing.sm }}>
            Tema del mensaje
          </Typography>
          {TOPICS.map(topic => (
            <View
              key={topic.id}
              style={[styles.topicRow, { backgroundColor: theme.card, opacity: 0.55 }, Shadows.sm]}
            >
              <View style={[styles.topicIcon, { backgroundColor: `${topic.color}15` }]}>
                <Ionicons name={topic.icon as any} size={16} color={topic.color} />
              </View>
              <Typography variant="body" style={{ color: theme.text, flex: 1 }}>
                {topic.label}
              </Typography>
              <Ionicons name="chevron-forward" size={14} color={theme.textMuted} />
            </View>
          ))}
        </View>

        {/* Formulario deshabilitado */}
        <View style={[styles.formCard, { backgroundColor: theme.card }, Shadows.sm]}>
          <Typography variant="label" style={{ color: theme.text, marginBottom: Spacing.sm }}>
            Nuevo mensaje
          </Typography>

          <Typography variant="caption" secondary style={{ marginBottom: 4 }}>Para</Typography>
          <View style={[styles.fakeSelect, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Ionicons name="person-outline" size={14} color={theme.textMuted} />
            <Typography variant="caption" muted style={{ flex: 1 }}>Seleccionar destinatario...</Typography>
            <Ionicons name="chevron-down" size={14} color={theme.textMuted} />
          </View>

          <Typography variant="caption" secondary style={{ marginBottom: 4, marginTop: 8 }}>Asunto</Typography>
          <View style={[styles.fakeInput, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Typography variant="caption" muted>Escribe el asunto...</Typography>
          </View>

          <Typography variant="caption" secondary style={{ marginBottom: 4, marginTop: 8 }}>Mensaje</Typography>
          <View style={[styles.fakeInput, { backgroundColor: theme.surface, borderColor: theme.border, height: 100 }]}>
            <Typography variant="caption" muted>Escribe tu mensaje aquí...</Typography>
          </View>

          <TouchableOpacity
            style={[styles.submitBtn, { backgroundColor: `${Colors.info}40` }]}
            disabled
            activeOpacity={1}
          >
            <Ionicons name="send-outline" size={14} color={Colors.info} />
            <Typography style={{ color: Colors.info, fontSize: FontSizes.sm, fontWeight: '600' }}>
              Enviar mensaje
            </Typography>
          </TouchableOpacity>
        </View>

        {/* Info */}
        <View style={[styles.infoCard, { backgroundColor: theme.card }]}>
          <Ionicons name="shield-checkmark-outline" size={14} color={theme.textMuted} />
          <Typography variant="caption" muted style={{ flex: 1 }}>
            Tus mensajes son privados y solo los verá el destinatario seleccionado.
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
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
  },
  content: { paddingHorizontal: Spacing.lg, paddingBottom: 40, gap: 12 },
  hero: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: 4,
  },
  heroIcon: {
    width: 72, height: 72, borderRadius: 36,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 4,
  },
  comingSoonBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: BorderRadius.full,
    marginTop: 4,
  },
  topicRow: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: BorderRadius.lg, padding: Spacing.md, gap: Spacing.md,
    marginBottom: 8,
  },
  topicIcon: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  formCard: {
    borderRadius: BorderRadius.xl, padding: Spacing.lg, marginTop: 4,
  },
  fakeSelect: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    borderRadius: BorderRadius.md, borderWidth: 1,
    paddingHorizontal: Spacing.md, paddingVertical: 12,
  },
  fakeInput: {
    borderRadius: BorderRadius.md, borderWidth: 1,
    paddingHorizontal: Spacing.md, paddingVertical: 12,
  },
  submitBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 12, borderRadius: BorderRadius.md, marginTop: 16,
  },
  infoCard: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    padding: Spacing.md, borderRadius: BorderRadius.lg, marginTop: 4,
  },
});
