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
import { AuthService } from '@/services/auth';

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
    // Call stub — Phase 5: will send real reset email via backend
    await AuthService.resetPassword(email.trim());
    setLoading(false);
    setSent(true);
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
                Ingresa tu correo y te enviaremos{'\n'}instrucciones cuando conectemos el servidor.
              </Typography>
            </View>

            {/* Local mode notice */}
            <View style={[s.infoCard, { backgroundColor: `${Colors.info}0E`, borderColor: `${Colors.info}28` }]}>
              <Ionicons name="information-circle-outline" size={18} color={Colors.info} />
              <View style={{ flex: 1, gap: 2 }}>
                <Typography variant="label" color={Colors.info}>Modo local activo</Typography>
                <Typography variant="caption" muted>
                  El restablecimiento por email estará disponible en Fase 5 con backend conectado.
                </Typography>
              </View>
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
                {loading ? 'Procesando…' : 'Continuar'}
              </Typography>
            </TouchableOpacity>

            {/* Divider */}
            <View style={s.separatorRow}>
              <View style={[s.separatorLine, { backgroundColor: theme.border }]} />
              <Typography variant="caption" muted style={{ paddingHorizontal: 12 }}>o</Typography>
              <View style={[s.separatorLine, { backgroundColor: theme.border }]} />
            </View>

            <TouchableOpacity
              style={[s.secondaryBtn, { borderColor: Colors.primary }]}
              onPress={() => router.replace('/auth/register' as never)}
              activeOpacity={0.8}
            >
              <Ionicons name="person-add-outline" size={16} color={Colors.primary} />
              <Typography style={{ color: Colors.primary, fontWeight: FontWeights.semibold, fontSize: FontSizes.sm }}>
                Crear cuenta nueva
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
              ¡Solicitud registrada!
            </Typography>
            <Typography variant="body" secondary style={{ textAlign: 'center', marginTop: 8, lineHeight: 22 }}>
              Cuando conectemos el servidor en Fase 5, recibirás instrucciones en{' '}
              <Typography variant="body" color={Colors.primary} style={{ fontWeight: FontWeights.semibold }}>
                {email}
              </Typography>
            </Typography>

            <View style={[s.infoCard, { backgroundColor: `${Colors.info}0E`, borderColor: `${Colors.info}28`, marginTop: 24 }]}>
              <Ionicons name="bulb-outline" size={16} color={Colors.info} />
              <Typography variant="caption" muted style={{ flex: 1, lineHeight: 18 }}>
                Por ahora, crea una cuenta nueva con el mismo correo para continuar usando la app sin perder tu historial local.
              </Typography>
            </View>

            <TouchableOpacity
              style={[s.primaryBtn, { backgroundColor: Colors.primary, marginTop: 24, width: '100%' }]}
              onPress={() => router.replace('/auth/register' as never)}
              activeOpacity={0.85}
            >
              <Ionicons name="person-add-outline" size={16} color="#fff" />
              <Typography style={s.primaryBtnText}>Crear cuenta nueva</Typography>
            </TouchableOpacity>

            <TouchableOpacity
              style={[s.secondaryBtn, { borderColor: theme.border, marginTop: 10, width: '100%' }]}
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

  separatorRow: { flexDirection: 'row', alignItems: 'center', marginTop: 20, marginBottom: 4 },
  separatorLine: { flex: 1, height: StyleSheet.hairlineWidth },

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
