import React, { useEffect, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Spacing, BorderRadius, FontWeights, FontSizes, Shadows } from '@/constants/theme';
import { Typography } from '@/components/ui/Typography';
import { useAuthStore } from '@/store/auth.store';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const IS_SMALL = SCREEN_HEIGHT < 700;

export default function LandingScreen() {
  const router = useRouter();
  const scheme = useColorScheme() ?? 'dark';
  const theme  = Colors[scheme];
  const sessionError = useAuthStore(s => s.sessionError);
  const setSessionError = useAuthStore(s => s.setSessionError);

  // ── Staggered entrance animations ──────────────────────────────────────────
  const logoOpacity  = useRef(new Animated.Value(0)).current;
  const logoScale    = useRef(new Animated.Value(0.8)).current;
  const titleY       = useRef(new Animated.Value(28)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const subY         = useRef(new Animated.Value(22)).current;
  const subOpacity   = useRef(new Animated.Value(0)).current;
  const pillsOpacity = useRef(new Animated.Value(0)).current;
  const btnsY        = useRef(new Animated.Value(22)).current;
  const btnsOpacity  = useRef(new Animated.Value(0)).current;
  const footerOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(logoOpacity, { toValue: 1, duration: 450, useNativeDriver: true }),
        Animated.spring(logoScale,   { toValue: 1, speed: 14, bounciness: 6, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(titleY,       { toValue: 0, duration: 380, useNativeDriver: true }),
        Animated.timing(titleOpacity, { toValue: 1, duration: 380, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(subY,       { toValue: 0, duration: 330, useNativeDriver: true }),
        Animated.timing(subOpacity, { toValue: 1, duration: 330, useNativeDriver: true }),
        Animated.timing(pillsOpacity, { toValue: 1, duration: 330, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(btnsY,       { toValue: 0, duration: 320, useNativeDriver: true }),
        Animated.timing(btnsOpacity, { toValue: 1, duration: 320, useNativeDriver: true }),
      ]),
      Animated.timing(footerOpacity, { toValue: 1, duration: 280, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <SafeAreaView style={[s.root, { backgroundColor: theme.background }]} edges={['top', 'bottom']}>
      {/* Session error banner — shown when redirected from corrupted session */}
      {sessionError && (
        <View style={[s.errorBanner, { backgroundColor: `${Colors.warning}14`, borderBottomColor: `${Colors.warning}30` }]}>
          <Ionicons name="warning-outline" size={14} color={Colors.warning} />
          <Typography variant="caption" color={Colors.warning} style={{ flex: 1, lineHeight: 17 }}>
            Tu sesión anterior no pudo restaurarse. Inicia sesión de nuevo.
          </Typography>
          <TouchableOpacity onPress={() => setSessionError(null)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="close-outline" size={16} color={Colors.warning} />
          </TouchableOpacity>
        </View>
      )}

      {/* Decorative background blobs */}
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <View style={[s.blob1, { backgroundColor: `${Colors.primary}0A` }]} />
        <View style={[s.blob2, { backgroundColor: `${Colors.secondary}07` }]} />
        <View style={[s.blob3, { backgroundColor: `${Colors.accent}06` }]} />
      </View>

      <View style={s.body}>
        {/* ── Logo ────────────────────────────────────────────────────────────── */}
        <Animated.View
          style={[s.logoWrap, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}
        >
          <View style={[s.logoCircle, {
            backgroundColor: `${Colors.primary}14`,
            borderColor: `${Colors.primary}28`,
          }]}>
            <Ionicons name="people" size={IS_SMALL ? 42 : 52} color={Colors.primary} />
          </View>
          <View style={[s.badge, { backgroundColor: `${Colors.primary}18`, borderColor: `${Colors.primary}30` }]}>
            <View style={[s.badgeDot, { backgroundColor: Colors.primary }]} />
            <Typography style={[s.badgeText, { color: Colors.primary }]}>MPO</Typography>
          </View>
        </Animated.View>

        {/* ── Title ───────────────────────────────────────────────────────────── */}
        <Animated.View
          style={[s.titleBlock, { opacity: titleOpacity, transform: [{ translateY: titleY }] }]}
        >
          <Typography style={[s.greeting, { color: theme.textSecondary }]}>
            Bienvenido a
          </Typography>
          <Typography style={[s.appName, { color: theme.text }]}>
            MPO{' '}
            <Typography style={[s.appName, { color: Colors.primary }]}>Comunidad</Typography>
          </Typography>
        </Animated.View>

        {/* ── Subtitle ────────────────────────────────────────────────────────── */}
        <Animated.View
          style={[s.subtitleBlock, { opacity: subOpacity, transform: [{ translateY: subY }] }]}
        >
          <Typography style={[s.subtitle, { color: theme.textSecondary }]}>
            Crece espiritualmente, aprende y conecta{'\n'}con tu comunidad cristiana.
          </Typography>
        </Animated.View>

        {/* ── Feature pills ───────────────────────────────────────────────────── */}
        <Animated.View style={[s.pillsRow, { opacity: pillsOpacity }]}>
          {FEATURES.map(({ icon, label }) => (
            <View
              key={label}
              style={[s.pill, { backgroundColor: `${Colors.primary}10`, borderColor: `${Colors.primary}22` }]}
            >
              <Ionicons name={icon as React.ComponentProps<typeof Ionicons>['name']} size={13} color={Colors.primary} />
              <Typography style={[s.pillLabel, { color: Colors.primary }]}>{label}</Typography>
            </View>
          ))}
        </Animated.View>

        {/* ── Divider ─────────────────────────────────────────────────────────── */}
        <Animated.View
          style={[s.divider, { backgroundColor: theme.border, opacity: btnsOpacity }]}
        />

        {/* ── Buttons ─────────────────────────────────────────────────────────── */}
        <Animated.View
          style={[s.btnsBlock, { opacity: btnsOpacity, transform: [{ translateY: btnsY }] }]}
        >
          <TouchableOpacity
            style={[s.primaryBtn, { backgroundColor: Colors.primary }, Shadows.primary]}
            onPress={() => router.push('/auth/register' as never)}
            activeOpacity={0.85}
          >
            <Ionicons name="person-add-outline" size={20} color="#fff" />
            <Typography style={s.primaryBtnLabel}>Crear cuenta</Typography>
          </TouchableOpacity>

          <TouchableOpacity
            style={[s.secondaryBtn, {
              borderColor: `${Colors.primary}60`,
              backgroundColor: `${Colors.primary}08`,
            }]}
            onPress={() => router.push('/auth/login' as never)}
            activeOpacity={0.8}
          >
            <Ionicons name="log-in-outline" size={20} color={Colors.primary} />
            <Typography style={[s.secondaryBtnLabel, { color: Colors.primary }]}>
              Iniciar sesión
            </Typography>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <Animated.View style={[s.footer, { opacity: footerOpacity }]}>
        <Ionicons name="shield-checkmark-outline" size={14} color={theme.textMuted} />
        <Typography variant="caption" muted style={s.footerText}>
          Regístrate para acceder a cursos, comunidad, progreso y solicitudes.
        </Typography>
      </Animated.View>
    </SafeAreaView>
  );
}

const FEATURES = [
  { icon: 'book-outline',       label: 'Cursos' },
  { icon: 'people-outline',     label: 'Comunidad' },
  { icon: 'bar-chart-outline',  label: 'Progreso' },
  { icon: 'notifications-outline', label: 'Avisos' },
];

const s = StyleSheet.create({
  root: { flex: 1 },

  errorBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: Spacing.lg, paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },

  // Background decorative blobs
  blob1: {
    position: 'absolute', width: 320, height: 320, borderRadius: 160,
    top: -80, right: -80,
  },
  blob2: {
    position: 'absolute', width: 240, height: 240, borderRadius: 120,
    bottom: 80, left: -60,
  },
  blob3: {
    position: 'absolute', width: 160, height: 160, borderRadius: 80,
    top: '45%', right: -40,
  },

  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    gap: IS_SMALL ? 14 : 20,
  },

  // Logo
  logoWrap: { alignItems: 'center', gap: 12 },
  logoCircle: {
    width: IS_SMALL ? 96 : 112,
    height: IS_SMALL ? 96 : 112,
    borderRadius: IS_SMALL ? 32 : 36,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: BorderRadius.full, borderWidth: 1,
  },
  badgeDot: { width: 6, height: 6, borderRadius: 3 },
  badgeText: { fontSize: FontSizes.xs, fontWeight: FontWeights.extrabold, letterSpacing: 1.5 },

  // Title
  titleBlock: { alignItems: 'center', gap: 2 },
  greeting: { fontSize: FontSizes.md, fontWeight: FontWeights.medium },
  appName: {
    fontSize: IS_SMALL ? FontSizes['3xl'] : 34,
    fontWeight: FontWeights.extrabold,
    letterSpacing: -0.5,
    textAlign: 'center',
  },

  // Subtitle
  subtitleBlock: { alignItems: 'center' },
  subtitle: {
    fontSize: FontSizes.md,
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: FontWeights.regular,
  },

  // Pills
  pillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  pill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: BorderRadius.full, borderWidth: 1,
  },
  pillLabel: { fontSize: FontSizes.xs, fontWeight: FontWeights.semibold },

  // Divider
  divider: { width: '100%', height: StyleSheet.hairlineWidth },

  // Buttons
  btnsBlock: { width: '100%', gap: 12 },
  primaryBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, paddingVertical: IS_SMALL ? 14 : 16,
    borderRadius: BorderRadius.xl,
  },
  primaryBtnLabel: {
    color: '#fff', fontSize: FontSizes.base, fontWeight: FontWeights.bold,
    letterSpacing: 0.2,
  },
  secondaryBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, paddingVertical: IS_SMALL ? 14 : 16,
    borderRadius: BorderRadius.xl, borderWidth: 1.5,
  },
  secondaryBtnLabel: { fontSize: FontSizes.base, fontWeight: FontWeights.semibold },

  // Footer
  footer: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: Spacing.xl, paddingBottom: Spacing.md,
    justifyContent: 'center',
  },
  footerText: { textAlign: 'center', flex: 1, lineHeight: 17 },
});
