import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import * as Haptics from 'expo-haptics';
import { supabase } from '@/services/supabase/client';
import { useAuthStore } from '@/store/auth.store';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Spacing, BorderRadius, FontWeights, FontSizes } from '@/constants/theme';
import { Typography } from '@/components/ui/Typography';

type Stage = 'loading' | 'form' | 'done' | 'error';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const scheme = useColorScheme() ?? 'dark';
  const theme  = Colors[scheme];
  const setAuthenticated = useAuthStore(s => s.setAuthenticated);

  const [stage, setStage]       = useState<Stage>('loading');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [showCf, setShowCf]     = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [apiError, setApiError]     = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const shake = useRef(new Animated.Value(0)).current;

  function triggerShake() {
    Animated.sequence([
      Animated.timing(shake, { toValue: 8,  duration: 55, useNativeDriver: true }),
      Animated.timing(shake, { toValue: -8, duration: 55, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 6,  duration: 55, useNativeDriver: true }),
      Animated.timing(shake, { toValue: -6, duration: 55, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 0,  duration: 55, useNativeDriver: true }),
    ]).start();
  }

  async function applyTokensFromUrl(url: string) {
    const fragment = url.split('#')[1];
    if (!fragment) return false;
    const params = Object.fromEntries(new URLSearchParams(fragment));
    if (!params.access_token || !params.refresh_token) return false;
    if (params.type !== 'recovery') return false;
    const { error } = await supabase.auth.setSession({
      access_token:  params.access_token,
      refresh_token: params.refresh_token,
    });
    return !error;
  }

  useEffect(() => {
    async function initFromDeepLink() {
      // 1. App was launched by the deep link
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) {
        const ok = await applyTokensFromUrl(initialUrl);
        setStage(ok ? 'form' : 'error');
        return;
      }

      // 2. App was already open — wait for incoming URL event
      const sub = Linking.addEventListener('url', async ({ url }) => {
        const ok = await applyTokensFromUrl(url);
        setStage(ok ? 'form' : 'error');
        sub.remove();
      });

      // Timeout: if no URL arrives within 10 s, show error
      const timeout = setTimeout(() => {
        sub.remove();
        setStage('error');
      }, 10_000);

      return () => {
        sub.remove();
        clearTimeout(timeout);
      };
    }

    initFromDeepLink();
  }, []);

  async function handleSubmit() {
    setFieldError(null);
    setApiError(null);

    if (password.length < 8) {
      setFieldError('La contraseña debe tener al menos 8 caracteres');
      triggerShake();
      return;
    }
    if (password !== confirm) {
      setFieldError('Las contraseñas no coinciden');
      triggerShake();
      return;
    }

    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSubmitting(false);

    if (error) {
      setApiError(error.message);
      triggerShake();
      return;
    }

    // Update local auth state
    const { data: { user } } = await supabase.auth.getUser();
    if (user) setAuthenticated(user.id);

    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setStage('done');
    setTimeout(() => router.replace('/(tabs)' as never), 2200);
  }

  // ── Loading state ───────────────────────────────────────────────────────────
  if (stage === 'loading') {
    return (
      <SafeAreaView style={[s.container, { backgroundColor: theme.background }]} edges={['top', 'bottom']}>
        <View style={s.center}>
          <ActivityIndicator color={Colors.primary} size="large" />
          <Typography variant="body" secondary style={{ marginTop: 16, textAlign: 'center' }}>
            Verificando enlace de recuperación…
          </Typography>
        </View>
      </SafeAreaView>
    );
  }

  // ── Error state ─────────────────────────────────────────────────────────────
  if (stage === 'error') {
    return (
      <SafeAreaView style={[s.container, { backgroundColor: theme.background }]} edges={['top', 'bottom']}>
        <View style={s.center}>
          <View style={[s.iconWrap, { backgroundColor: `${Colors.error}12`, borderColor: `${Colors.error}28` }]}>
            <Ionicons name="warning-outline" size={44} color={Colors.error} />
          </View>
          <Typography variant="h3" style={{ color: theme.text, marginTop: 20, textAlign: 'center' }}>
            Enlace inválido o expirado
          </Typography>
          <Typography variant="body" secondary style={{ textAlign: 'center', marginTop: 8, lineHeight: 22 }}>
            El enlace de recuperación ya no es válido.{'\n'}Solicita uno nuevo desde la pantalla de inicio.
          </Typography>
          <TouchableOpacity
            style={[s.primaryBtn, { backgroundColor: Colors.primary, marginTop: 32 }]}
            onPress={() => router.replace('/auth/forgot-password' as never)}
            activeOpacity={0.85}
          >
            <Ionicons name="refresh-outline" size={18} color="#fff" />
            <Typography style={s.primaryBtnText}>Solicitar nuevo enlace</Typography>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.linkBtn]}
            onPress={() => router.replace('/auth/login' as never)}
            activeOpacity={0.7}
          >
            <Typography variant="caption" color={Colors.primary}>Volver al inicio de sesión</Typography>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── Done state ──────────────────────────────────────────────────────────────
  if (stage === 'done') {
    return (
      <SafeAreaView style={[s.container, { backgroundColor: theme.background }]} edges={['top', 'bottom']}>
        <View style={s.center}>
          <View style={[s.iconWrap, { backgroundColor: `${Colors.success}12`, borderColor: `${Colors.success}28` }]}>
            <Ionicons name="checkmark-circle" size={56} color={Colors.success} />
          </View>
          <Typography variant="h3" style={{ color: theme.text, marginTop: 20, textAlign: 'center' }}>
            ¡Contraseña actualizada!
          </Typography>
          <Typography variant="body" secondary style={{ textAlign: 'center', marginTop: 8, lineHeight: 22 }}>
            Tu contraseña se cambió correctamente.{'\n'}Accediendo a la app…
          </Typography>
          <ActivityIndicator color={`${Colors.primary}70`} size="small" style={{ marginTop: 32 }} />
        </View>
      </SafeAreaView>
    );
  }

  // ── Form state ──────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={[s.container, { backgroundColor: theme.background }]} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={[s.header, { borderBottomColor: theme.border }]}>
        <View style={{ width: 36 }} />
        <Typography variant="h4" style={{ color: theme.text }}>Nueva contraseña</Typography>
        <View style={{ width: 36 }} />
      </View>

      <View style={s.body}>
        {/* Icon */}
        <View style={s.iconSection}>
          <View style={[s.iconWrap, { backgroundColor: `${Colors.primary}12`, borderColor: `${Colors.primary}28` }]}>
            <Ionicons name="lock-closed-outline" size={44} color={Colors.primary} />
          </View>
          <Typography variant="h3" style={{ color: theme.text, marginTop: 16, textAlign: 'center' }}>
            Elige una contraseña segura
          </Typography>
          <Typography variant="body" secondary style={{ textAlign: 'center', marginTop: 6, lineHeight: 22 }}>
            Usa mínimo 8 caracteres.{'\n'}Combina letras, números y símbolos.
          </Typography>
        </View>

        <Animated.View style={[s.fieldsBlock, { transform: [{ translateX: shake }] }]}>
          {/* Password field */}
          <View style={s.fieldGroup}>
            <Typography variant="label" style={{ color: theme.textSecondary, marginBottom: 6 }}>
              Nueva contraseña
            </Typography>
            <View style={[
              s.fieldWrap,
              { backgroundColor: theme.card, borderColor: fieldError ? Colors.error : theme.border },
            ]}>
              <Ionicons name="lock-closed-outline" size={18} color={fieldError ? Colors.error : theme.textMuted} />
              <TextInput
                value={password}
                onChangeText={(t) => { setPassword(t); setFieldError(null); }}
                placeholder="Mínimo 8 caracteres"
                placeholderTextColor={theme.textMuted}
                secureTextEntry={!showPw}
                autoCapitalize="none"
                autoCorrect={false}
                style={[s.input, { color: theme.text }]}
              />
              <TouchableOpacity onPress={() => setShowPw(v => !v)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name={showPw ? 'eye-off-outline' : 'eye-outline'} size={18} color={theme.textMuted} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirm field */}
          <View style={s.fieldGroup}>
            <Typography variant="label" style={{ color: theme.textSecondary, marginBottom: 6 }}>
              Confirmar contraseña
            </Typography>
            <View style={[
              s.fieldWrap,
              { backgroundColor: theme.card, borderColor: fieldError ? Colors.error : theme.border },
            ]}>
              <Ionicons name="lock-closed-outline" size={18} color={fieldError ? Colors.error : theme.textMuted} />
              <TextInput
                value={confirm}
                onChangeText={(t) => { setConfirm(t); setFieldError(null); }}
                placeholder="Repite la contraseña"
                placeholderTextColor={theme.textMuted}
                secureTextEntry={!showCf}
                autoCapitalize="none"
                autoCorrect={false}
                style={[s.input, { color: theme.text }]}
              />
              <TouchableOpacity onPress={() => setShowCf(v => !v)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name={showCf ? 'eye-off-outline' : 'eye-outline'} size={18} color={theme.textMuted} />
              </TouchableOpacity>
            </View>
          </View>

          {fieldError && (
            <View style={s.fieldError}>
              <Ionicons name="alert-circle-outline" size={13} color={Colors.error} />
              <Typography style={{ color: Colors.error, fontSize: FontSizes.xs }}>{fieldError}</Typography>
            </View>
          )}

          {apiError && (
            <View style={[s.apiErrorBox, { backgroundColor: `${Colors.error}0E`, borderColor: `${Colors.error}28` }]}>
              <Ionicons name="alert-circle-outline" size={16} color={Colors.error} />
              <Typography variant="caption" color={Colors.error} style={{ flex: 1, lineHeight: 18 }}>
                {apiError}
              </Typography>
            </View>
          )}
        </Animated.View>

        <TouchableOpacity
          style={[s.primaryBtn, { backgroundColor: submitting ? `${Colors.primary}80` : Colors.primary, marginTop: 8 }]}
          onPress={handleSubmit}
          disabled={submitting}
          activeOpacity={0.85}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
          )}
          <Typography style={s.primaryBtnText}>
            {submitting ? 'Guardando…' : 'Guardar contraseña'}
          </Typography>
        </TouchableOpacity>
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
  body: { flex: 1, paddingHorizontal: Spacing.lg, paddingTop: Spacing.xl },

  center: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },

  iconSection: { alignItems: 'center', marginBottom: Spacing.xl },
  iconWrap: {
    width: 100, height: 100, borderRadius: 34,
    borderWidth: 1.5, alignItems: 'center', justifyContent: 'center',
  },

  fieldsBlock: { gap: 16 },
  fieldGroup:  { gap: 0 },

  fieldWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderRadius: BorderRadius.md, borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14, paddingVertical: 13,
  },
  input: { flex: 1, fontSize: 15, fontWeight: FontWeights.regular },

  fieldError: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },

  apiErrorBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    padding: 12, borderRadius: BorderRadius.md, borderWidth: 1, marginTop: 4,
  },

  primaryBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 14, borderRadius: BorderRadius.lg,
  },
  primaryBtnText: { color: '#fff', fontWeight: FontWeights.semibold, fontSize: FontSizes.md },

  linkBtn: { marginTop: 20, padding: 8 },
});
