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

export default function RegisterScreen() {
  const router = useRouter();
  const scheme = useColorScheme() ?? 'dark';
  const theme  = Colors[scheme];
  const { register } = useSession();

  const [name, setName]           = useState('');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [confirm, setConfirm]     = useState('');
  const [iglesia, setIglesia]     = useState('');
  const [ministerio, setMinisterio] = useState('');
  const [showPwd, setShowPwd]     = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState<string | null>(null);

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

  function validate(): string | null {
    if (!name.trim())    return 'Ingresa tu nombre';
    if (!email.trim())   return 'Ingresa tu correo';
    if (!email.includes('@')) return 'Correo inválido';
    if (!password)       return 'Ingresa una contraseña';
    if (password.length < 6) return ERROR_MESSAGES.weak_password;
    if (password !== confirm) return 'Las contraseñas no coinciden';
    return null;
  }

  async function handleRegister() {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      triggerShake();
      return;
    }
    setError(null);
    setLoading(true);
    const result = await register({
      display_name: name.trim(),
      email: email.trim(),
      password,
      iglesia:    iglesia.trim() || undefined,
      ministerio: ministerio.trim() || undefined,
    });
    setLoading(false);
    if (result.success) {
      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
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
          <Typography variant="h4" style={{ color: theme.text }}>Crear cuenta</Typography>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Top text */}
          <View style={s.topSection}>
            <Typography variant="h2" style={{ color: theme.text }}>Únete a LearnHub</Typography>
            <Typography variant="body" secondary style={{ marginTop: 4, textAlign: 'center' }}>
              Crea tu cuenta para guardar tu progreso
            </Typography>
          </View>

          {/* Error banner */}
          {error && (
            <Animated.View
              style={[s.errorBanner,
                { backgroundColor: `${Colors.error}15`, borderColor: `${Colors.error}40` },
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
            <Field label="Nombre *" icon="person-outline"   placeholder="Tu nombre completo" value={name}       onChangeText={(t) => { setName(t);       setError(null); }} theme={theme} />
            <Field label="Correo *"  icon="mail-outline"    placeholder="tu@correo.com"       value={email}      onChangeText={(t) => { setEmail(t);      setError(null); }} keyboardType="email-address" autoCapitalize="none" theme={theme} />
            <Field
              label="Contraseña *"
              icon="lock-closed-outline"
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChangeText={(t) => { setPassword(t); setError(null); }}
              secureTextEntry={!showPwd}
              rightIcon={showPwd ? 'eye-off-outline' : 'eye-outline'}
              onRightIcon={() => setShowPwd(v => !v)}
              theme={theme}
            />
            <Field
              label="Confirmar contraseña *"
              icon="lock-closed-outline"
              placeholder="Repite la contraseña"
              value={confirm}
              onChangeText={(t) => { setConfirm(t); setError(null); }}
              secureTextEntry={!showPwd}
              theme={theme}
            />

            {/* Optional section */}
            <View style={[s.optionalSection, { borderColor: theme.border }]}>
              <Typography variant="caption" muted style={{ textAlign: 'center', marginBottom: 14 }}>
                Opcional — puedes completar esto después
              </Typography>
              <Field label="Iglesia"    icon="home-outline"   placeholder="Nombre de tu iglesia"    value={iglesia}    onChangeText={setIglesia}    theme={theme} />
              <Field label="Ministerio" icon="people-outline" placeholder="Área de ministerio"      value={ministerio} onChangeText={setMinisterio} theme={theme} />
            </View>

            <TouchableOpacity
              style={[s.primaryBtn, { backgroundColor: loading ? `${Colors.primary}80` : Colors.primary }]}
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <Ionicons name="hourglass-outline" size={18} color="#fff" />
              ) : (
                <Ionicons name="person-add-outline" size={18} color="#fff" />
              )}
              <Typography style={s.primaryBtnText}>
                {loading ? 'Creando cuenta…' : 'Crear cuenta'}
              </Typography>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={s.footer}>
            <View style={s.divider}>
              <View style={[s.dividerLine, { backgroundColor: theme.border }]} />
              <Typography variant="caption" muted style={{ paddingHorizontal: 12 }}>o</Typography>
              <View style={[s.dividerLine, { backgroundColor: theme.border }]} />
            </View>

            <TouchableOpacity
              style={[s.secondaryBtn, { borderColor: Colors.primary }]}
              onPress={() => router.replace('/auth/login' as never)}
              activeOpacity={0.8}
            >
              <Typography style={{ color: Colors.primary, fontWeight: FontWeights.semibold, fontSize: FontSizes.sm }}>
                Ya tengo cuenta
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
  label, icon, placeholder, value, onChangeText,
  keyboardType = 'default', autoCapitalize = 'words',
  secureTextEntry = false, rightIcon, onRightIcon, theme,
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
      <Typography variant="label" style={{ color: theme.textSecondary, marginBottom: 6 }}>{label}</Typography>
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
    flexDirection: 'row', alignItems: 'center',
    borderRadius: BorderRadius.md, borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14, paddingVertical: 13, gap: 10,
  },
  input: { flex: 1, fontSize: 15, fontWeight: FontWeights.regular },
});

const s = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg, paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  closeBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  scroll:   { paddingHorizontal: Spacing.lg, paddingBottom: 40 },
  topSection: { alignItems: 'center', paddingVertical: Spacing.xl },
  errorBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    padding: 12, borderRadius: BorderRadius.md, borderWidth: 1, marginBottom: 16,
  },
  form: { gap: 0 },
  optionalSection: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 20, marginBottom: 16, marginTop: 4,
  },
  primaryBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 14, borderRadius: BorderRadius.lg,
  },
  primaryBtnText: { color: '#fff', fontWeight: FontWeights.semibold, fontSize: FontSizes.md },
  footer: { marginTop: Spacing.xl, gap: 16 },
  divider: { flexDirection: 'row', alignItems: 'center' },
  dividerLine: { flex: 1, height: StyleSheet.hairlineWidth },
  secondaryBtn: {
    alignItems: 'center', paddingVertical: 13,
    borderRadius: BorderRadius.lg, borderWidth: 1.5,
  },
  guestLink: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 },
});
