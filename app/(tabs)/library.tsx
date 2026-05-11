import React from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { Typography } from '@/components/ui/Typography';

function LibrarySection({
  icon,
  title,
  subtitle,
  color,
  onPress,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
  subtitle: string;
  color: string;
  onPress?: () => void;
}) {
  const scheme = useColorScheme() ?? 'dark';
  const theme = Colors[scheme];
  return (
    <TouchableOpacity
      style={[styles.section, { backgroundColor: theme.card }, Shadows.sm]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[styles.sectionIcon, { backgroundColor: `${color}20` }]}>
        <Ionicons name={icon} size={26} color={color} />
      </View>
      <View style={styles.sectionText}>
        <Typography variant="h4" style={{ color: theme.text }}>{title}</Typography>
        <Typography variant="body" secondary>{subtitle}</Typography>
      </View>
      <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
    </TouchableOpacity>
  );
}

function ComingSoonFeature({ icon, title }: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
}) {
  const scheme = useColorScheme() ?? 'dark';
  const theme = Colors[scheme];
  return (
    <View style={[styles.feature, { backgroundColor: theme.card }]}>
      <View style={[styles.featureIcon, { backgroundColor: theme.border }]}>
        <Ionicons name={icon} size={20} color={theme.textMuted} />
      </View>
      <View style={{ flex: 1 }}>
        <Typography variant="label" muted>{title}</Typography>
        <Typography variant="caption" muted>Próximamente</Typography>
      </View>
      <View style={[styles.soon, { backgroundColor: `${Colors.accent}20` }]}>
        <Typography variant="caption" color={Colors.accent} style={{ fontWeight: '700' }}>
          Pronto
        </Typography>
      </View>
    </View>
  );
}

export default function LibraryScreen() {
  const scheme = useColorScheme() ?? 'dark';
  const theme = Colors[scheme];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <Typography variant="overline" secondary>Tu espacio</Typography>
          <Typography variant="h1" style={{ color: theme.text }}>Biblioteca</Typography>
        </View>

        {/* Banner info */}
        <View style={[styles.banner, { backgroundColor: `${Colors.primary}15`, borderColor: `${Colors.primary}30` }]}>
          <Ionicons name="information-circle-outline" size={20} color={Colors.primary} />
          <Typography variant="body" color={Colors.primary} style={{ flex: 1 }}>
            Tu contenido personal se almacena localmente en tu dispositivo.
          </Typography>
        </View>

        {/* Secciones */}
        <View style={styles.sectionsContainer}>
          <Typography variant="h3" style={{ color: theme.text, marginBottom: 12 }}>
            Tu contenido
          </Typography>

          <LibrarySection
            icon="heart-outline"
            title="Favoritos"
            subtitle="Lecciones y citas guardadas"
            color={Colors.error}
          />
          <LibrarySection
            icon="document-text-outline"
            title="Mis Notas"
            subtitle="Notas personales de estudio"
            color={Colors.primary}
          />
          <LibrarySection
            icon="checkmark-done-circle-outline"
            title="Completados"
            subtitle="Lecciones y cursos terminados"
            color={Colors.success}
          />
        </View>

        {/* Próximamente */}
        <View style={styles.sectionsContainer}>
          <Typography variant="h3" style={{ color: theme.text, marginBottom: 12 }}>
            Próximamente
          </Typography>

          <ComingSoonFeature icon="download-outline" title="Contenido descargado" />
          <ComingSoonFeature icon="reader-outline" title="PDFs y recursos" />
          <ComingSoonFeature icon="ribbon-outline" title="Certificados" />
          <ComingSoonFeature icon="globe-outline" title="Recursos externos" />
        </View>

        {/* Info de almacenamiento */}
        <View style={[styles.storageInfo, { backgroundColor: theme.card }]}>
          <View style={styles.storageHeader}>
            <Ionicons name="phone-portrait-outline" size={20} color={theme.textSecondary} />
            <Typography variant="label" secondary>Almacenamiento local</Typography>
          </View>
          <Typography variant="caption" muted>
            Todos tus datos —progreso, notas y favoritos— se guardan localmente. La app funciona 100% sin internet.
          </Typography>
          <View style={styles.storageFeatures}>
            {['Offline First', 'Sin cuenta', 'Datos privados'].map(f => (
              <View key={f} style={[styles.featureTag, { backgroundColor: `${Colors.success}20` }]}>
                <Ionicons name="checkmark" size={12} color={Colors.success} />
                <Typography variant="caption" color={Colors.success}>{f}</Typography>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingBottom: 40 },
  header: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: Spacing.lg },
  banner: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  sectionsContainer: { paddingHorizontal: Spacing.lg, marginBottom: Spacing.xl },
  section: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
    gap: 14,
  },
  sectionIcon: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionText: { flex: 1 },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: 6,
    gap: 12,
    opacity: 0.7,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  soon: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  storageInfo: {
    marginHorizontal: Spacing.lg,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: 10,
  },
  storageHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  storageFeatures: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  featureTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
  },
});
