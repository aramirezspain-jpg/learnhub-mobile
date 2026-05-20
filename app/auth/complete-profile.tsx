import React, { useState } from 'react';
import {
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSQLiteContext } from 'expo-sqlite';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Spacing, BorderRadius, FontWeights, FontSizes } from '@/constants/theme';
import { Typography } from '@/components/ui/Typography';
import { useAuthStore } from '@/store/auth.store';
import { useUserProfileStore } from '@/store/userProfile.store';
import {
  AuthLocalUsersRepository,
  authUserToProfile,
} from '@/database/repositories/authLocalUsers';

export default function CompleteProfileScreen() {
  const router = useRouter();
  const scheme = useColorScheme() ?? 'dark';
  const theme = Colors[scheme];
  const db = useSQLiteContext();
  const profile = useUserProfileStore(s => s.profile);
  const setProfile = useUserProfileStore(s => s.setProfile);
  const sessionUserId = useAuthStore(s => s.sessionUserId);

  const [iglesia, setIglesia] = useState(profile?.iglesia ?? '');
  const [ministerio, setMinisterio] = useState(profile?.ministerio ?? '');
  const [loading, setLoading] = useState(false);

  async function handleStart() {
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setLoading(true);

    if (sessionUserId && (iglesia.trim() || ministerio.trim())) {
      try {
        const repo = new AuthLocalUsersRepository(db);
        await repo.updateProfile(sessionUserId, {
          iglesia: iglesia.trim() || undefined,
          ministerio: ministerio.trim() || undefined,
        });
        const updated = await repo.findById(sessionUserId);
        if (updated) setProfile(authUserToProfile(updated));
      } catch {
        // non-critical — user can update from profile screen later
      }
    }

    setLoading(false);
    router.replace('/(tabs)');
  }

  function handleSkip() {
    router.replace('/(tabs)');
  }

  return (
    <SafeAreaView style={[s.container, { backgroundColor: theme.background }]} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Success header */}
          <View style={s.successSection}>
            <View
              style={[
                s.checkWrap,
                {
                  backgroundColor: `${Colors.success}14`,
                  borderColor: `${Colors.success}28`,
                },
              ]}
            >
              <Ionicons name="checkmark-circle" size={54} color={Colors.success} />
            </View>

            <Typography style={[s.title, { color: theme.text }]}>
              ¡Cuenta creada!
            </Typography>
            <Typography style={[s.welcomeName, { color: Colors.primary }]}>
              {profile?.display_name ?? 'Bienvenido'}
            </Typography>
            <Typography variant="body" secondary style={s.welcomeSub}>
              Tu cuenta está lista. Completa tu perfil para una mejor experiencia.
            </Typography>
          </View>

          {/* Optional profile card */}
          <View style={[s.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={s.cardHeader}>
              <Ionicons name="person-outline" size={18} color={Colors.primary} />
              <Typography style={[s.cardTitle, { color: theme.text }]}>
                Información de iglesia
              </Typography>
              <View style={[s.optionalBadge, { backgroundColor: `${Colors.primary}12` }]}>
                <Typography style={[s.optionalText, { color: Colors.primary }]}>Opcional</Typography>
              </View>
            </View>

            <Typography variant="caption" muted style={{ marginBottom: 18 }}>
              Puedes completar esto ahora o más tarde desde tu perfil.
            </Typography>

            <Field
              label="Iglesia"
              icon="home-outline"
              placeholder="Nombre de tu iglesia"
              value={iglesia}
              onChangeText={setIglesia}
              theme={theme}
            />
            <Field
              label="Ministerio"
              icon="people-outline"
              placeholder="Área de ministerio"
              value={ministerio}
              onChangeText={setMinisterio}
              theme={theme}
            />
          </View>

          {/* Start button */}
          <TouchableOpacity
            style={[
              s.startBtn,
              { backgroundColor: loading ? `${Colors.primary}80` : Colors.primary },
            ]}
            onPress={handleStart}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <Ionicons name="hourglass-outline" size={20} color="#fff" />
            ) : (
              <Ionicons name="rocket-outline" size={20} color="#fff" />
            )}
            <Typography style={s.startBtnText}>
              {loading ? 'Guardando…' : 'Comenzar'}
            </Typography>
          </TouchableOpacity>

          <TouchableOpacity style={s.skipLink} onPress={handleSkip} activeOpacity={0.7}>
            <Ionicons name="arrow-forward-outline" size={13} color={theme.textMuted} />
            <Typography variant="caption" muted>Completar más tarde</Typography>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({
  label,
  icon,
  placeholder,
  value,
  onChangeText,
  theme,
}: {
  label: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  placeholder: string;
  value: string;
  onChangeText: (t: string) => void;
  theme: (typeof Colors)['dark'];
}) {
  return (
    <View style={f.wrap}>
      <Typography variant="label" style={{ color: theme.textSecondary, marginBottom: 6 }}>
        {label}
      </Typography>
      <View style={[f.field, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
        <Ionicons name={icon} size={18} color={theme.textMuted} />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.textMuted}
          autoCapitalize="words"
          style={[f.input, { color: theme.text }]}
          autoCorrect={false}
        />
      </View>
    </View>
  );
}

const f = StyleSheet.create({
  wrap: { marginBottom: 14 },
  field: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: BorderRadius.md, borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14, paddingVertical: 13, gap: 10,
  },
  input: { flex: 1, fontSize: 15, fontWeight: FontWeights.regular },
});

const s = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: Spacing.lg, paddingBottom: 40, paddingTop: Spacing.lg },

  successSection: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    gap: 8,
  },
  checkWrap: {
    width: 100, height: 100, borderRadius: 34,
    borderWidth: 1.5, alignItems: 'center', justifyContent: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: FontSizes['2xl'],
    fontWeight: FontWeights.extrabold,
    letterSpacing: -0.3,
  },
  welcomeName: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
  },
  welcomeSub: {
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: Spacing.md,
  },

  card: {
    borderRadius: BorderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
    flex: 1,
  },
  optionalBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  optionalText: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.semibold,
  },

  startBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 14, borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
  startBtnText: {
    color: '#fff', fontWeight: FontWeights.semibold, fontSize: FontSizes.md,
  },

  skipLink: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 4, paddingVertical: Spacing.sm,
  },
});
