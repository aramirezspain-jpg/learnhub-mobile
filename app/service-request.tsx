import React from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Spacing, BorderRadius, Shadows, FontSizes } from '@/constants/theme';
import { Typography } from '@/components/ui/Typography';

const REQUEST_TYPES = [
  { id: '1', titulo: 'Bautismo', descripcion: 'Solicita tu bautismo por inmersión', icon: 'water-outline', color: Colors.info },
  { id: '2', titulo: 'Membresía', descripcion: 'Únete formalmente a la iglesia', icon: 'card-outline', color: Colors.primary },
  { id: '3', titulo: 'Matrimonio', descripcion: 'Solicita orientación prematrimonial', icon: 'heart-outline', color: Colors.error },
  { id: '4', titulo: 'Visita Pastoral', descripcion: 'Recibe una visita en tu hogar', icon: 'home-outline', color: Colors.success },
  { id: '5', titulo: 'Dedicación de Niños', descripcion: 'Presenta a tu bebé ante Dios', icon: 'people-outline', color: Colors.accent },
  { id: '6', titulo: 'Consejería', descripcion: 'Sesiones con un consejero pastoral', icon: 'chatbubbles-outline', color: Colors.secondary },
];

export default function ServiceRequestScreen() {
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
          <Typography variant="h2" style={{ color: theme.text }}>Solicitudes</Typography>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Hero */}
        <View style={[styles.hero, { backgroundColor: `${Colors.accent}15`, borderColor: `${Colors.accent}30`, borderWidth: 1 }]}>
          <View style={[styles.heroIcon, { backgroundColor: `${Colors.accent}20` }]}>
            <Ionicons name="document-text" size={32} color={Colors.accent} />
          </View>
          <Typography variant="h3" style={{ color: Colors.accent, textAlign: 'center' }}>
            Servicios pastorales
          </Typography>
          <Typography variant="body" secondary style={{ textAlign: 'center', lineHeight: 22 }}>
            Solicita servicios y ordinanzas de la iglesia. El equipo pastoral coordinará contigo.
          </Typography>
          <View style={[styles.comingSoonBadge, { backgroundColor: `${Colors.accent}20`, borderColor: `${Colors.accent}40`, borderWidth: 1 }]}>
            <Ionicons name="time-outline" size={12} color={Colors.accent} />
            <Typography style={{ color: Colors.accent, fontSize: FontSizes.xs, fontWeight: '700' }}>
              PRÓXIMAMENTE · FASE 4
            </Typography>
          </View>
        </View>

        {/* Tipos de solicitud */}
        <Typography variant="label" secondary style={{ marginBottom: Spacing.sm }}>
          Tipo de solicitud
        </Typography>

        <View style={styles.grid}>
          {REQUEST_TYPES.map(req => (
            <View
              key={req.id}
              style={[styles.gridCard, { backgroundColor: theme.card, opacity: 0.55 }, Shadows.sm]}
            >
              <View style={[styles.gridIcon, { backgroundColor: `${req.color}18` }]}>
                <Ionicons name={req.icon as any} size={24} color={req.color} />
              </View>
              <Typography variant="label" style={{ color: theme.text, textAlign: 'center', fontSize: FontSizes.sm }}>
                {req.titulo}
              </Typography>
              <Typography variant="caption" muted style={{ textAlign: 'center', lineHeight: 16, fontSize: 10 }} numberOfLines={2}>
                {req.descripcion}
              </Typography>
            </View>
          ))}
        </View>

        {/* Proceso */}
        <View style={[styles.processCard, { backgroundColor: theme.card }, Shadows.sm]}>
          <Typography variant="label" style={{ color: theme.text, marginBottom: Spacing.md }}>
            Cómo funciona
          </Typography>
          {[
            { step: '1', text: 'Selecciona el tipo de solicitud', icon: 'hand-right-outline' },
            { step: '2', text: 'Completa el formulario', icon: 'create-outline' },
            { step: '3', text: 'La pastoral recibe tu solicitud', icon: 'notifications-outline' },
            { step: '4', text: 'Te contactamos para coordinar', icon: 'call-outline' },
          ].map(item => (
            <View key={item.step} style={styles.processStep}>
              <View style={[styles.stepNum, { backgroundColor: `${Colors.primary}20` }]}>
                <Typography style={{ color: Colors.primary, fontSize: 11, fontWeight: '800' }}>
                  {item.step}
                </Typography>
              </View>
              <Ionicons name={item.icon as any} size={14} color={theme.textMuted} />
              <Typography variant="caption" secondary style={{ flex: 1 }}>
                {item.text}
              </Typography>
            </View>
          ))}
        </View>

        {/* Info */}
        <View style={[styles.infoCard, { backgroundColor: theme.card }]}>
          <Ionicons name="information-circle-outline" size={14} color={theme.textMuted} />
          <Typography variant="caption" muted style={{ flex: 1 }}>
            Solicitudes gestionadas por el equipo pastoral. Función disponible en la próxima actualización.
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 4,
  },
  gridCard: {
    width: '47%',
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    alignItems: 'center',
    gap: 8,
  },
  gridIcon: {
    width: 52, height: 52, borderRadius: 26,
    alignItems: 'center', justifyContent: 'center',
  },
  processCard: {
    borderRadius: BorderRadius.xl, padding: Spacing.lg, marginTop: 4,
  },
  processStep: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginBottom: 12,
  },
  stepNum: {
    width: 22, height: 22, borderRadius: 11,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  infoCard: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    padding: Spacing.md, borderRadius: BorderRadius.lg, marginTop: 4,
  },
});
