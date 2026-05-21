import React, { useRef, useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Spacing, BorderRadius, FontWeights, FontSizes } from '@/constants/theme';
import { Typography } from '@/components/ui/Typography';
import { resetPasswordSupabase } from '@/services/auth/supabase';

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const scheme = useColorScheme() ?? 'dark';
  const theme  = Colors[scheme];

  const [email, setEmail]     = useState('');
  const [sent, setSent]       = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [apiError, setApiError]     = useState<string | null>(null);

  const shake = useRef(new Animated.Value(0)).current;

  function triggerShake() {
    Animated.sequence([
      Animated.timing(shake, { toValue: 8,  duration: 60, useNativeDriver: true }),
      Animated.timing(shake, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 6,  duration: 60, useNativeDriver: true }),
      Animated.timing(shake, { toValue: -6, duration: 60, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 0,  duration: 60, useNativeDriver: true }),
    ]).start();
  }

  async function handleSubmit() {
    setEmailError(null);
    setApiError(null);
    if (!email.trim()) {
      setEmailError('Ingresa tu correo electrónico');
      triggerShake();
      return;
    }
    if (!isValidEmail(email)) {
      setEmailError('Formato inválido (ej: tu@correo.com)');
      triggerShake();
      return;
    }
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLoading(true);
    const result = await resetPasswordSupabase(email.trim());
    setLoading(false);
    if (result.success) {
      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setSent(true);
    } else {
      setApiError(result.error ?? 'Error al enviar. Intenta de nuevo.');
      triggerShake();
    }
  }

  return (
    <SafeAreaView style={[s.container, { backgroundColor: theme.background }]} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={[s.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity style={s.closeBtn} onPress={() => router.replace('/auth/login' as never)}>
          <Ionicons name="arrow-back" size={22} color={theme.text} />
        </TouchableOpacity>
        <Typography variant="h4" style={{ color: theme.text }}>Recuperar acceso</Typography>
        <View style={{ width: 36 }} />
      </View>

      <View style={s.body}>
        {!sent ? (
          <>
            {/* Icon */}
            <View style={s.iconSection}>
              <View style={[s.iconWrap, { backgroundColor: `${Colors.warning}12`, borderColor: `${Colors.warning}28` }]}>
                <Ionicons name="key-outline" size={44} color={Colors.warning} />
              </View>
              <Typography variant="h3" style={{ color: theme.text, marginTop: 16, textAlign: 'center' }}>
                ¿Olvidaste tu contraseña?
              </Typography>
              <Typography variant="body" secondary style={{ textAlign: 'center', marginTop: 6, lineHeight: 22 }}>
                Ingresa tu correo y te enviaremos{'\n'}un enlace para restablecer tu contraseña.
              </Typography>
            </View>

            {/* Email field */}
            <Animated.View style={{ transform: [{ translateX: shake }] }}>
              <Typography variant="label" style={{ color: theme.textSecondary, marginBottom: 6 }}>
                Correo electrónico
              </Typography>
              <View style={[
                s.fieldWrap,
                { backgroundColor: theme.card, borderColor: emailError ? Colors.error : theme.border },
              ]}>
                <Ionicons name="mail-outline" size={18} color={emailError ? Colors.error : theme.textMuted} />
                <TextInput
                  value={email}
                  onChangeText={(t) => { setEmail(t); setEmailError(null); }}
                  placeholder="tu@correo.com"
                  placeholderTextColor={theme.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={[s.input, { color: theme.text }]}
                />
                {email.length > 0 && isValidEmail(email) && (
                  <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
                )}
              </View>
              {emailError && (
                <View style={s.fieldError}>
                  <Ionicons name="alert-circle-outline" size={13} color={Colors.error} />
                  <Typography style={{ color: Colors.error, fontSize: FontSizes.xs }}>{emailError}</Typography>
                </View>
              )}
            </Animated.View>

            {apiError && (
              <View style={[s.apiErrorBox, { backgroundColor: `${Colors.error}0E`, borderColor: `${Colors.error}28` }]}>
                <Ionicons name="alert-circle-outline" size={16} color={Colors.error} />
                <Typography variant="caption" color={Colors.error} style={{ flex: 1, lineHeight: 18 }}>
                  {apiError}
                </Typography>
              </View>
            )}

            <TouchableOpacity
              style={[
                s.primaryBtn,
                { backgroundColor: loading ? `${Colors.primary}80` : Colors.primary },
                { marginTop: 20 },
              ]}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <Ionicons name="hourglass-outline" size={16} color="#fff" />
              ) : (
                <Ionicons name="send-outline" size={16} color="#fff" />
              )}
              <Typography style={s.primaryBtnText}>
                {loading ? 'Enviando…' : 'Enviar enlace'}
              </Typography>
            </TouchableOpacity>
          </>
        ) : (
          /* Sent state */
          <View style={s.sentSection}>
            <View style={[s.sentIcon, { backgroundColor: `${Colors.success}12`, borderColor: `${Colors.success}28` }]}>
              <Ionicons name="checkmark-circle" size={56} color={Colors.success} />
            </View>
            <Typography variant="h3" style={{ color: theme.text, marginTop: 20, textAlign: 'center' }}>
              Revisa tu correo
            </Typography>
            <Typography variant="body" secondary style={{ textAlign: 'center', marginTop: 8, lineHeight: 22 }}>
              Te enviamos un enlace de recuperación a{'\n'}
              <Typography variant="body" color={Colors.primary} style={{ fontWeight: FontWeights.semibold }}>
                {email}
              </Typography>
            </Typography>

            <View style={[s.infoCard, { backgroundColor: `${Colors.success}0E`, borderColor: `${Colors.success}28`, marginTop: 24 }]}>
              <Ionicons name="information-circle-outline" size={16} color={Colors.success} />
              <Typography variant="caption" muted style={{ flex: 1, lineHeight: 18 }}>
                Abre el enlace desde tu móvil para restablecer tu contraseña. Revisa también la carpeta de spam.
              </Typography>
            </View>

            <TouchableOpacity
              style={[s.secondaryBtn, { borderColor: theme.border, marginTop: 24, width: '100%' }]}
              onPress={() => router.replace('/auth/login' as never)}
              activeOpacity={0.8}
            >
              <Ionicons name="arrow-back-outline" size={16} color={theme.textMuted} />
              <Typography style={{ color: theme.textMuted, fontWeight: FontWeights.semibold, fontSize: FontSizes.sm }}>
                Volver al inicio de sesión
              </Typography>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg, paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  closeBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  body: { flex: 1, paddingHorizontal: Spacing.lg, paddingTop: Spacing.xl },

  iconSection: { alignItems: 'center', marginBottom: Spacing.xl },
  iconWrap: {
    width: 100, height: 100, borderRadius: 34,
    borderWidth: 1.5, alignItems: 'center', justifyContent: 'center',
  },

  infoCard: {
    flexDirection: 'row', gap: 10, alignItems: 'flex-start',
    padding: 14, borderRadius: BorderRadius.lg, borderWidth: 1,
    marginBottom: 20,
  },

  fieldWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderRadius: BorderRadius.md, borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14, paddingVertical: 13,
  },
  input: { flex: 1, fontSize: 15, fontWeight: FontWeights.regular },
  fieldError: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },

  primaryBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 14, borderRadius: BorderRadius.lg,
  },
  primaryBtnText: { color: '#fff', fontWeight: FontWeights.semibold, fontSize: FontSizes.md },

  apiErrorBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    padding: 12, borderRadius: BorderRadius.md, borderWidth: 1, marginTop: 12,
  },

  secondaryBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 13, borderRadius: BorderRadius.lg, borderWidth: 1.5, marginTop: 12,
  },

  sentSection: { flex: 1, alignItems: 'center' },
  sentIcon: {
    width: 100, height: 100, borderRadius: 34, borderWidth: 1.5,
    alignItems: 'center', justifyContent: 'center',
  },
});
