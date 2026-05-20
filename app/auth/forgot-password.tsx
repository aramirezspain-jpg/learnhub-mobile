import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Spacing, BorderRadius, FontWeights, FontSizes } from '@/constants/theme';
import { Typography } from '@/components/ui/Typography';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const scheme = useColorScheme() ?? 'dark';
  const theme  = Colors[scheme];
  const [email, setEmail] = useState('');
  const [sent, setSent]   = useState(false);

  function handleSubmit() {
    if (!email.trim()) return;
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
            {/* Local-mode notice */}
            <View style={[s.infoCard, { backgroundColor: `${Colors.info}10`, borderColor: `${Colors.info}30` }]}>
              <Ionicons name="information-circle-outline" size={20} color={Colors.info} />
              <View style={{ flex: 1, gap: 4 }}>
                <Typography variant="label" color={Colors.info}>Modo local activo</Typography>
                <Typography variant="caption" muted>
                  En esta versión los datos se almacenan solo en tu dispositivo.
                  El restablecimiento por email estará disponible en Fase 5 con backend conectado.
                </Typography>
              </View>
            </View>

            <Typography variant="h3" style={{ color: theme.text, marginTop: 28 }}>
              ¿Qué deseas hacer?
            </Typography>

            {/* Option 1: remember password */}
            <View style={[s.optionCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={[s.optionIcon, { backgroundColor: `${Colors.primary}12` }]}>
                <Ionicons name="key-outline" size={22} color={Colors.primary} />
              </View>
              <View style={{ flex: 1, gap: 4 }}>
                <Typography variant="label" style={{ color: theme.text }}>Ingresar correo</Typography>
                <Typography variant="caption" muted>
                  Si lo recuerdas más tarde, intenta iniciar sesión normalmente
                </Typography>
              </View>
            </View>

            <View style={[s.fieldWrap, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Ionicons name="mail-outline" size={18} color={theme.textMuted} />
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="tu@correo.com"
                placeholderTextColor={theme.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                style={[s.input, { color: theme.text }]}
              />
            </View>

            <TouchableOpacity
              style={[s.primaryBtn, { backgroundColor: email.trim() ? Colors.primary : `${Colors.primary}50` }]}
              onPress={handleSubmit}
              disabled={!email.trim()}
              activeOpacity={0.85}
            >
              <Ionicons name="send-outline" size={16} color="#fff" />
              <Typography style={s.primaryBtnText}>Continuar</Typography>
            </TouchableOpacity>

            {/* Option 2: create new account */}
            <View style={[s.separatorRow]}>
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
            <View style={[s.sentIcon, { backgroundColor: `${Colors.success}15`, borderColor: `${Colors.success}30` }]}>
              <Ionicons name="checkmark-circle-outline" size={52} color={Colors.success} />
            </View>
            <Typography variant="h3" style={{ color: theme.text, marginTop: 20, textAlign: 'center' }}>
              Anotado
            </Typography>
            <Typography variant="body" secondary style={{ textAlign: 'center', marginTop: 8 }}>
              Cuando conectemos el backend en Fase 5, recibirás instrucciones en{'\n'}
              <Typography variant="body" color={Colors.primary}>{email}</Typography>
            </Typography>
            <View style={[s.infoCard, { backgroundColor: `${Colors.info}10`, borderColor: `${Colors.info}30`, marginTop: 24 }]}>
              <Ionicons name="bulb-outline" size={18} color={Colors.info} />
              <Typography variant="caption" muted style={{ flex: 1 }}>
                Por ahora, crea una cuenta nueva con el mismo correo para continuar usando la app.
              </Typography>
            </View>
            <TouchableOpacity
              style={[s.primaryBtn, { backgroundColor: Colors.primary, marginTop: 24 }]}
              onPress={() => router.replace('/auth/register' as never)}
              activeOpacity={0.85}
            >
              <Ionicons name="person-add-outline" size={16} color="#fff" />
              <Typography style={s.primaryBtnText}>Crear cuenta nueva</Typography>
            </TouchableOpacity>
            <TouchableOpacity style={s.guestLink} onPress={() => router.back()}>
              <Typography variant="caption" muted>Volver</Typography>
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
  infoCard: {
    flexDirection: 'row', gap: 12,
    padding: 14, borderRadius: BorderRadius.lg, borderWidth: 1,
  },
  optionCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    padding: 14, borderRadius: BorderRadius.lg, borderWidth: StyleSheet.hairlineWidth,
    marginTop: 14,
  },
  optionIcon: { width: 44, height: 44, borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center' },
  fieldWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderRadius: BorderRadius.md, borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14, paddingVertical: 13,
    marginTop: 12,
  },
  input: { flex: 1, fontSize: 15, fontWeight: FontWeights.regular },
  primaryBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 14, borderRadius: BorderRadius.lg, marginTop: 16,
  },
  primaryBtnText: { color: '#fff', fontWeight: FontWeights.semibold, fontSize: FontSizes.md },
  separatorRow: { flexDirection: 'row', alignItems: 'center', marginTop: 20 },
  separatorLine: { flex: 1, height: StyleSheet.hairlineWidth },
  secondaryBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 13, borderRadius: BorderRadius.lg, borderWidth: 1.5, marginTop: 12,
  },
  sentSection: { flex: 1, alignItems: 'center' },
  sentIcon: {
    width: 96, height: 96, borderRadius: 48, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  guestLink: { marginTop: 16, alignSelf: 'center' },
});
