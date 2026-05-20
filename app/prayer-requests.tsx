import React from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Spacing, BorderRadius, Shadows, FontSizes } from '@/constants/theme';
import { Typography } from '@/components/ui/Typography';

const MOCK_REQUESTS = [
  { id: '1', titulo: 'Sanidad para mi familia', autor: 'Hermano A.', fecha: 'Hace 2 días', oraciones: 12 },
  { id: '2', titulo: 'Dirección en decisión laboral', autor: 'Hermana M.', fecha: 'Hace 3 días', oraciones: 8 },
  { id: '3', titulo: 'Restauración matrimonial', autor: 'Anónimo', fecha: 'Hace 5 días', oraciones: 24 },
  { id: '4', titulo: 'Provisión económica', autor: 'Hermano R.', fecha: 'Hace 1 semana', oraciones: 6 },
];

export default function PrayerRequestsScreen() {
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
          <Typography variant="h2" style={{ color: theme.text }}>Peticiones de Oración</Typography>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Hero */}
        <View style={[styles.hero, { backgroundColor: `${Colors.secondary}15`, borderColor: `${Colors.secondary}30`, borderWidth: 1 }]}>
          <View style={[styles.heroIcon, { backgroundColor: `${Colors.secondary}20` }]}>
            <Ionicons name="hand-left" size={32} color={Colors.secondary} />
          </View>
          <Typography variant="h3" style={{ color: Colors.secondary, textAlign: 'center' }}>
            Intercedamos juntos
          </Typography>
          <Typography variant="body" secondary style={{ textAlign: 'center', lineHeight: 22 }}>
            Comparte tus peticiones con la comunidad y ora por los demás. Juntos somos más fuertes.
          </Typography>
          <View style={[styles.comingSoonBadge, { backgroundColor: `${Colors.accent}20`, borderColor: `${Colors.accent}40`, borderWidth: 1 }]}>
            <Ionicons name="time-outline" size={12} color={Colors.accent} />
            <Typography style={{ color: Colors.accent, fontSize: FontSizes.xs, fontWeight: '700' }}>
              PRÓXIMAMENTE · FASE 4
            </Typography>
          </View>
        </View>

        {/* Vista previa deshabilitada */}
        <View style={styles.sectionHeader}>
          <Typography variant="label" secondary>Vista previa</Typography>
          <View style={[styles.previewBadge, { backgroundColor: `${Colors.info}15` }]}>
            <Ionicons name="eye-outline" size={10} color={Colors.info} />
            <Typography style={{ color: Colors.info, fontSize: FontSizes.xs, fontWeight: '600' }}>Solo lectura</Typography>
          </View>
        </View>

        {MOCK_REQUESTS.map(req => (
          <View key={req.id} style={[styles.requestCard, { backgroundColor: theme.card, opacity: 0.55 }, Shadows.sm]}>
            <View style={[styles.prayIcon, { backgroundColor: `${Colors.secondary}15` }]}>
              <Ionicons name="hand-left-outline" size={18} color={Colors.secondary} />
            </View>
            <View style={{ flex: 1, gap: 4 }}>
              <Typography variant="label" style={{ color: theme.text }} numberOfLines={1}>
                {req.titulo}
              </Typography>
              <View style={styles.metaRow}>
                <Ionicons name="person-outline" size={11} color={theme.textMuted} />
                <Typography variant="caption" muted>{req.autor}</Typography>
                <Typography variant="caption" muted>·</Typography>
                <Typography variant="caption" muted>{req.fecha}</Typography>
              </View>
            </View>
            <View style={[styles.prayCount, { backgroundColor: `${Colors.secondary}12` }]}>
              <Ionicons name="heart" size={10} color={Colors.secondary} />
              <Typography style={{ color: Colors.secondary, fontSize: 10, fontWeight: '700' }}>{req.oraciones}</Typography>
            </View>
          </View>
        ))}

        {/* Formulario deshabilitado */}
        <View style={[styles.formCard, { backgroundColor: theme.card }, Shadows.sm]}>
          <Typography variant="label" style={{ color: theme.text, marginBottom: Spacing.sm }}>
            Nueva petición
          </Typography>
          <View style={[styles.fakeInput, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Typography variant="caption" muted>Título de tu petición...</Typography>
          </View>
          <View style={[styles.fakeInput, { backgroundColor: theme.surface, borderColor: theme.border, height: 80 }]}>
            <Typography variant="caption" muted>Describe tu petición (opcional)...</Typography>
          </View>
          <View style={styles.formFooter}>
            <View style={[styles.fakeCheckbox, { borderColor: theme.border }]}>
              <Typography variant="caption" muted>Publicar como anónimo</Typography>
            </View>
            <TouchableOpacity
              style={[styles.submitBtn, { backgroundColor: `${Colors.secondary}40` }]}
              disabled
              activeOpacity={1}
            >
              <Ionicons name="send-outline" size={14} color={Colors.secondary} />
              <Typography style={{ color: Colors.secondary, fontSize: FontSizes.sm, fontWeight: '600' }}>
                Enviar petición
              </Typography>
            </TouchableOpacity>
          </View>
        </View>

        {/* Info */}
        <View style={[styles.infoCard, { backgroundColor: theme.card }]}>
          <Ionicons name="information-circle-outline" size={14} color={theme.textMuted} />
          <Typography variant="caption" muted style={{ flex: 1 }}>
            Las peticiones serán visibles para la comunidad. Función disponible en la próxima actualización.
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
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginTop: 4, marginBottom: 2,
  },
  previewBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  requestCard: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: BorderRadius.lg, padding: Spacing.md, gap: Spacing.md,
  },
  prayIcon: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  prayCount: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  formCard: {
    borderRadius: BorderRadius.xl, padding: Spacing.lg, gap: 10, marginTop: 4,
  },
  fakeInput: {
    borderRadius: BorderRadius.md, borderWidth: 1,
    paddingHorizontal: Spacing.md, paddingVertical: 12,
  },
  formFooter: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginTop: 4,
  },
  fakeCheckbox: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderWidth: 1, borderRadius: BorderRadius.sm,
    paddingHorizontal: 8, paddingVertical: 4,
  },
  submitBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: BorderRadius.md,
  },
  infoCard: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    padding: Spacing.md, borderRadius: BorderRadius.lg, marginTop: 4,
  },
});
