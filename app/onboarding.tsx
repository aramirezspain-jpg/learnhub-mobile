import React, { useState, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSQLiteContext } from 'expo-sqlite';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Spacing, BorderRadius, FontWeights, FontSizes, Shadows } from '@/constants/theme';
import { Typography } from '@/components/ui/Typography';
import { useUIStore } from '@/store/ui.store';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const IS_SMALL = SCREEN_HEIGHT < 700;

const FEATURES = [
  { icon: 'book-outline',        label: 'Cursos bíblicos' },
  { icon: 'people-outline',      label: 'Comunidad' },
  { icon: 'heart-outline',       label: 'Peticiones' },
  { icon: 'trending-up-outline', label: 'Crecimiento' },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const scheme = useColorScheme() ?? 'dark';
  const theme  = Colors[scheme];
  const db     = useSQLiteContext();
  const setOnboardingCompleted = useUIStore(s => s.setOnboardingCompleted);

  const [step, setStep] = useState(0);
  const slideX  = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  // ── Persist + navigate to landing ──────────────────────────────────────────
  async function persistAndContinue() {
    await db.runAsync(
      `INSERT OR REPLACE INTO app_settings (key, value, updated_at)
       VALUES ('onboardingCompleted', 'true', datetime('now'))`
    );
    setOnboardingCompleted(true);
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.replace('/landing' as never);
  }

  // ── Step transition ────────────────────────────────────────────────────────
  function animateTo(next: number) {
    const dir = next > step ? -1 : 1;
    Animated.parallel([
      Animated.timing(opacity, { toValue: 0, duration: 130, useNativeDriver: true }),
      Animated.timing(slideX,  { toValue: dir * 32, duration: 130, useNativeDriver: true }),
    ]).start(() => {
      slideX.setValue(-dir * 32);
      setStep(next);
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(slideX,  { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    });
  }

  function handleNext() {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    animateTo(1);
  }

  // ── Colours per step ───────────────────────────────────────────────────────
  const accent = step === 0 ? Colors.primary : Colors.secondary;

  return (
    <SafeAreaView style={[s.root, { backgroundColor: theme.background }]} edges={['top', 'bottom']}>
      {/* Decorative blobs */}
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <View style={[s.blob1, { backgroundColor: `${accent}09` }]} />
        <View style={[s.blob2, { backgroundColor: `${Colors.primary}06` }]} />
      </View>

      {/* Skip (step 1 only) */}
      {step === 0 && (
        <TouchableOpacity style={s.skipBtn} onPress={() => animateTo(1)} activeOpacity={0.7}>
          <Typography variant="caption" muted>Saltar</Typography>
        </TouchableOpacity>
      )}

      {/* ── Animated content ─────────────────────────────────────────────────── */}
      <Animated.View style={[s.content, { opacity, transform: [{ translateX: slideX }] }]}>

        {step === 0 ? (
          /* ── STEP 1: Welcome ──────────────────────────────────────────────── */
          <>
            {/* Logo badge */}
            <View style={[s.logoCircle, {
              backgroundColor: `${Colors.primary}14`,
              borderColor: `${Colors.primary}28`,
            }]}>
              <Ionicons name="people" size={IS_SMALL ? 44 : 56} color={Colors.primary} />
            </View>

            <View style={[s.badge, {
              backgroundColor: `${Colors.primary}10`,
              borderColor: `${Colors.primary}22`,
            }]}>
              <View style={[s.badgeDot, { backgroundColor: Colors.primary }]} />
              <Typography style={[s.badgeText, { color: Colors.primary }]}>MPO</Typography>
            </View>

            <View style={s.textBlock}>
              <Typography style={[s.title, { color: theme.text }]}>
                Bienvenido a{'\n'}
                <Typography style={[s.title, { color: Colors.primary }]}>
                  MPO Comunidad
                </Typography>
              </Typography>
              <Typography style={[s.subtitle, { color: theme.textSecondary }]}>
                Crece espiritualmente, aprende y conecta{'\n'}con tu comunidad cristiana.
              </Typography>
            </View>
          </>
        ) : (
          /* ── STEP 2: Features + CTA ───────────────────────────────────────── */
          <>
            <View style={[s.iconWrap, {
              backgroundColor: `${Colors.secondary}14`,
              borderColor: `${Colors.secondary}28`,
            }]}>
              <Ionicons name="grid" size={IS_SMALL ? 40 : 50} color={Colors.secondary} />
            </View>

            <View style={s.textBlock}>
              <Typography style={[s.title, { color: theme.text }]}>
                Todo lo que{'\n'}necesitas
              </Typography>
              <Typography style={[s.subtitle, { color: theme.textSecondary }]}>
                Una plataforma completa para tu fe y crecimiento espiritual.
              </Typography>
            </View>

            {/* Feature pills */}
            <View style={s.pillsWrap}>
              {FEATURES.map(f => (
                <View
                  key={f.label}
                  style={[s.pill, {
                    backgroundColor: `${Colors.primary}0E`,
                    borderColor: `${Colors.primary}20`,
                  }]}
                >
                  <Ionicons
                    name={f.icon as React.ComponentProps<typeof Ionicons>['name']}
                    size={17}
                    color={Colors.primary}
                  />
                  <Typography style={[s.pillLabel, { color: Colors.primary }]}>
                    {f.label}
                  </Typography>
                </View>
              ))}
            </View>

            {/* CTA */}
            <TouchableOpacity
              style={[s.comenzarBtn, { backgroundColor: Colors.primary }, Shadows.primary]}
              onPress={persistAndContinue}
              activeOpacity={0.87}
            >
              <Ionicons name="rocket-outline" size={20} color="#fff" />
              <Typography style={s.comenzarLabel}>Comenzar</Typography>
            </TouchableOpacity>
          </>
        )}
      </Animated.View>

      {/* ── Bottom bar ─────────────────────────────────────────────────────── */}
      <View style={s.bottom}>
        {/* Pagination dots */}
        <View style={s.dots}>
          {[0, 1].map(i => (
            <View
              key={i}
              style={[
                s.dot,
                i === step
                  ? { width: 24, height: 8, backgroundColor: Colors.primary }
                  : { width: 8,  height: 8, backgroundColor: theme.border },
              ]}
            />
          ))}
        </View>

        {/* Next arrow (step 1 only) */}
        {step === 0 ? (
          <TouchableOpacity
            style={[s.nextBtn, { backgroundColor: Colors.primary }, Shadows.primary]}
            onPress={handleNext}
            activeOpacity={0.85}
          >
            <Ionicons name="arrow-forward" size={22} color="#fff" />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 52 }} />
        )}
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },

  blob1: {
    position: 'absolute', width: 320, height: 320, borderRadius: 160,
    top: -80, right: -80,
  },
  blob2: {
    position: 'absolute', width: 240, height: 240, borderRadius: 120,
    bottom: 80, left: -60,
  },

  skipBtn: {
    alignSelf: 'flex-end',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
  },

  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    gap: IS_SMALL ? 18 : 26,
  },

  // Step 1 — logo
  logoCircle: {
    width: IS_SMALL ? 100 : 120,
    height: IS_SMALL ? 100 : 120,
    borderRadius: IS_SMALL ? 32 : 38,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: BorderRadius.full, borderWidth: 1,
    marginTop: -10,
  },
  badgeDot:  { width: 6, height: 6, borderRadius: 3 },
  badgeText: { fontSize: FontSizes.xs, fontWeight: FontWeights.extrabold, letterSpacing: 1.5 },

  // Step 2 — icon
  iconWrap: {
    width: IS_SMALL ? 96 : 112,
    height: IS_SMALL ? 96 : 112,
    borderRadius: IS_SMALL ? 30 : 36,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Text
  textBlock: { alignItems: 'center', gap: 10 },
  title: {
    fontSize: IS_SMALL ? FontSizes['2xl'] : 30,
    fontWeight: FontWeights.extrabold,
    textAlign: 'center',
    letterSpacing: -0.4,
    lineHeight: IS_SMALL ? 30 : 36,
  },
  subtitle: {
    fontSize: FontSizes.md,
    textAlign: 'center',
    lineHeight: 23,
    fontWeight: FontWeights.regular,
    paddingHorizontal: 6,
  },

  // Feature pills
  pillsWrap: {
    flexDirection: 'row', flexWrap: 'wrap',
    gap: 10, justifyContent: 'center',
  },
  pill: {
    flexDirection: 'row', alignItems: 'center', gap: 7,
    paddingHorizontal: 14, paddingVertical: 9,
    borderRadius: BorderRadius.full, borderWidth: 1,
  },
  pillLabel: { fontSize: FontSizes.sm, fontWeight: FontWeights.semibold },

  // Comenzar button
  comenzarBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, paddingVertical: IS_SMALL ? 14 : 16,
    borderRadius: BorderRadius.xl, width: '100%',
  },
  comenzarLabel: {
    color: '#fff', fontSize: FontSizes.base, fontWeight: FontWeights.bold, letterSpacing: 0.3,
  },

  // Bottom
  bottom: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingBottom: IS_SMALL ? Spacing.md : Spacing.lg,
    paddingTop: Spacing.md,
  },
  dots: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  dot:  { borderRadius: 4 },
  nextBtn: {
    width: 52, height: 52, borderRadius: 26,
    alignItems: 'center', justifyContent: 'center',
  },
});
