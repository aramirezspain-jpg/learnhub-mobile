import React, { useState, useRef } from 'react';
import {
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Spacing, BorderRadius, FontWeights, FontSizes } from '@/constants/theme';
import { Typography } from '@/components/ui/Typography';
import { useSession } from '@/hooks/auth/useSession';
import type { AuthError } from '@/types/user';

const ERROR_MESSAGES: Record<AuthError, string> = {
  invalid_credentials: 'Correo o contraseña incorrectos',
  email_taken:         'Este correo ya está registrado',
  weak_password:       'La contraseña debe tener al menos 6 caracteres',
  network_error:       'Error de conexión. Inténtalo de nuevo',
  unknown:             'Ha ocurrido un error. Inténtalo de nuevo',
};

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export default function LoginScreen() {
  const router = useRouter();
  const scheme = useColorScheme() ?? 'dark';
  const theme  = Colors[scheme];
  const { login } = useSession();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd]   = useState(false);
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState(false);
  const [error, setError]       = useState<string | null>(null);

  const shake = useRef(new Animated.Value(0)).current;

  function triggerShake() {
    Animated.sequence([
      Animated.timing(shake, { toValue: 8,  duration: 60,  useNativeDriver: true }),
      Animated.timing(shake, { toValue: -8, duration: 60,  useNativeDriver: true }),
      Animated.timing(shake, { toValue: 6,  duration: 60,  useNativeDriver: true }),
      Animated.timing(shake, { toValue: -6, duration: 60,  useNativeDriver: true }),
      Animated.timing(shake, { toValue: 0,  duration: 60,  useNativeDriver: true }),
    ]).start();
  }

  async function handleLogin() {
    setError(null);
    if (!email.trim()) {
      setError('Ingresa tu correo electrónico');
      triggerShake();
      return;
    }
    if (!isValidEmail(email)) {
      setError('Formato de correo inválido (ej: tu@correo.com)');
      triggerShake();
      return;
    }
    if (!password) {
      setError('Ingresa tu contraseña');
      triggerShake();
      return;
    }
    setLoading(true);
    const result = await login({ email: email.trim(), password });
    setLoading(false);
    if (result.success) {
      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setSuccess(true);
      // Brief success visual before navigating
      await new Promise<void>(r => setTimeout(r, 500));
      router.replace('/(tabs)');
    } else {
      setError(ERROR_MESSAGES[result.error ?? 'unknown']);
      triggerShake();
      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }

  return (
    <SafeAreaView style={[s.container, { backgroundColor: theme.background }]} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        {/* Header */}
        <View style={[s.header, { borderBottomColor: theme.border }]}>
          <TouchableOpacity style={s.closeBtn} onPress={() => router.replace('/landing' as never)}>
            <Ionicons name="arrow-back" size={22} color={theme.text} />
          </TouchableOpacity>
          <Typography variant="h4" style={{ color: theme.text }}>Iniciar sesión</Typography>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo */}
          <View style={s.logoSection}>
            <View style={[s.logoWrap, { backgroundColor: `${Colors.primary}12`, borderColor: `${Colors.primary}28` }]}>
              <Ionicons name="book-outline" size={40} color={Colors.primary} />
            </View>
            <Typography variant="h2" style={{ color: theme.text, marginTop: 16 }}>
              Bienvenido de vuelta
            </Typography>
            <Typography variant="body" secondary style={{ textAlign: 'center', marginTop: 4 }}>
              Inicia sesión para sincronizar tu progreso
            </Typography>
          </View>

          {/* Error banner */}
          {error && (
            <Animated.View
              style={[s.errorBanner, { backgroundColor: `${Colors.error}15`, borderColor: `${Colors.error}40` },
                { transform: [{ translateX: shake }] }]}
            >
              <Ionicons name="alert-circle-outline" size={16} color={Colors.error} />
              <Typography variant="caption" color={Colors.error} style={{ flex: 1 }}>
                {error}
              </Typography>
            </Animated.View>
          )}

          {/* Form */}
          <View style={s.form}>
            <Field
              label="Correo electrónico"
              icon="mail-outline"
              placeholder="tu@correo.com"
              value={email}
              onChangeText={(t) => { setEmail(t); setError(null); }}
              keyboardType="email-address"
              autoCapitalize="none"
              theme={theme}
            />
            <Field
              label="Contraseña"
              icon="lock-closed-outline"
              placeholder="••••••••"
              value={password}
              onChangeText={(t) => { setPassword(t); setError(null); }}
              secureTextEntry={!showPwd}
              rightIcon={showPwd ? 'eye-off-outline' : 'eye-outline'}
              onRightIcon={() => setShowPwd(v => !v)}
              theme={theme}
            />

            <TouchableOpacity
              style={s.forgotLink}
              onPress={() => router.push('/auth/forgot-password' as never)}
            >
              <Typography variant="caption" color={Colors.primary}>
                ¿Olvidaste tu contraseña?
              </Typography>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                s.primaryBtn,
                {
                  backgroundColor: success
                    ? Colors.success
                    : loading
                    ? `${Colors.primary}80`
                    : Colors.primary,
                },
              ]}
              onPress={handleLogin}
              disabled={loading || success}
              activeOpacity={0.85}
            >
              {success ? (
                <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
              ) : loading ? (
                <Ionicons name="hourglass-outline" size={18} color="#fff" />
              ) : (
                <Ionicons name="log-in-outline" size={18} color="#fff" />
              )}
              <Typography style={s.primaryBtnText}>
                {success ? '¡Bienvenido!' : loading ? 'Iniciando sesión…' : 'Iniciar sesión'}
              </Typography>
            </TouchableOpacity>
          </View>

          {/* Footer links */}
          <View style={s.footer}>
            <View style={s.divider}>
              <View style={[s.dividerLine, { backgroundColor: theme.border }]} />
              <Typography variant="caption" muted style={{ paddingHorizontal: 12 }}>o</Typography>
              <View style={[s.dividerLine, { backgroundColor: theme.border }]} />
            </View>

            <TouchableOpacity
              style={[s.secondaryBtn, { borderColor: Colors.primary }]}
              onPress={() => router.replace('/auth/register' as never)}
              activeOpacity={0.8}
            >
              <Typography style={{ color: Colors.primary, fontWeight: FontWeights.semibold, fontSize: FontSizes.sm }}>
                Crear cuenta nueva
              </Typography>
            </TouchableOpacity>

            <TouchableOpacity style={s.guestLink} onPress={() => router.replace('/landing' as never)}>
              <Ionicons name="arrow-back-outline" size={13} color={theme.textMuted} />
              <Typography variant="caption" muted>Volver al inicio</Typography>
            </TouchableOpacity>
          </View>
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
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  secureTextEntry = false,
  rightIcon,
  onRightIcon,
  theme,
}: {
  label: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  placeholder: string;
  value: string;
  onChangeText: (t: string) => void;
  keyboardType?: 'default' | 'email-address';
  autoCapitalize?: 'none' | 'words' | 'sentences';
  secureTextEntry?: boolean;
  rightIcon?: React.ComponentProps<typeof Ionicons>['name'];
  onRightIcon?: () => void;
  theme: (typeof Colors)['dark'];
}) {
  return (
    <View style={f.wrap}>
      <Typography variant="label" style={{ color: theme.textSecondary, marginBottom: 6 }}>
        {label}
      </Typography>
      <View style={[f.field, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Ionicons name={icon} size={18} color={theme.textMuted} />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.textMuted}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          secureTextEntry={secureTextEntry}
          style={[f.input, { color: theme.text }]}
          autoCorrect={false}
        />
        {rightIcon && onRightIcon && (
          <TouchableOpacity onPress={onRightIcon} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name={rightIcon} size={18} color={theme.textMuted} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const f = StyleSheet.create({
  wrap:  { marginBottom: 16 },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.md,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
    paddingVertical: 13,
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: FontWeights.regular,
  },
});

const s = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  closeBtn: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
  },
  scroll: { paddingHorizontal: Spacing.lg, paddingBottom: 40 },
  logoSection: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  logoWrap: {
    width: 88, height: 88, borderRadius: 26,
    borderWidth: 1, alignItems: 'center', justifyContent: 'center',
  },
  errorBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    padding: 12, borderRadius: BorderRadius.md, borderWidth: 1,
    marginBottom: 16,
  },
  form: { gap: 0 },
  forgotLink: { alignSelf: 'flex-end', marginTop: -8, marginBottom: 24 },
  primaryBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 14, borderRadius: BorderRadius.lg,
  },
  primaryBtnText: {
    color: '#fff', fontWeight: FontWeights.semibold, fontSize: FontSizes.md,
  },
  footer: { marginTop: Spacing.xl, gap: 16 },
  divider: { flexDirection: 'row', alignItems: 'center' },
  dividerLine: { flex: 1, height: StyleSheet.hairlineWidth },
  secondaryBtn: {
    alignItems: 'center', paddingVertical: 13,
    borderRadius: BorderRadius.lg, borderWidth: 1.5,
  },
  guestLink: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4,
  },
});
