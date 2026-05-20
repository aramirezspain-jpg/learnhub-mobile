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

type FeatureItem = { icon: string; label: string };
type Step = {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
  subtitle: string;
  color: string;
  features?: FeatureItem[];
  isCta?: boolean;
};

const STEPS: Step[] = [
  {
    icon: 'book',
    title: 'Bienvenido a LearnHub',
    subtitle: 'Tu plataforma de aprendizaje bíblico. Estudia a tu ritmo, sin necesidad de internet.',
    color: Colors.primary,
  },
  {
    icon: 'grid',
    title: 'Todo lo que necesitas',
    subtitle: 'Cursos, comunidad, peticiones de oración y seguimiento de tu crecimiento espiritual.',
    color: Colors.secondary,
    features: [
      { icon: 'book-outline',          label: 'Cursos bíblicos' },
      { icon: 'people-outline',        label: 'Comunidad' },
      { icon: 'heart-outline',         label: 'Peticiones' },
      { icon: 'trending-up-outline',   label: 'Crecimiento' },
    ],
  },
  {
    icon: 'rocket',
    title: '¡Empecemos!',
    subtitle: 'Crea tu cuenta para guardar tu progreso y conectar con tu iglesia.',
    color: Colors.accent,
    isCta: true,
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const scheme = useColorScheme() ?? 'dark';
  const theme = Colors[scheme];
  const db = useSQLiteContext();
  const setOnboardingCompleted = useUIStore(s => s.setOnboardingCompleted);

  const [step, setStep] = useState(0);
  const slideX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  const current = STEPS[step];

  async function persistOnboarding() {
    await db.runAsync(
      `INSERT OR REPLACE INTO app_settings (key, value, updated_at)
       VALUES ('onboardingCompleted', 'true', datetime('now'))`
    );
    setOnboardingCompleted(true);
  }

  function animateTo(nextStep: number) {
    const dir = nextStep > step ? -1 : 1;
    Animated.parallel([
      Animated.timing(opacity, { toValue: 0, duration: 140, useNativeDriver: true }),
      Animated.timing(slideX, { toValue: dir * 36, duration: 140, useNativeDriver: true }),
    ]).start(() => {
      slideX.setValue(-dir * 36);
      setStep(nextStep);
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(slideX, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    });
  }

  function handleNext() {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step < STEPS.length - 1) animateTo(step + 1);
  }

  function handleSkip() {
    animateTo(STEPS.length - 1);
  }

  async function handleLogin() {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await persistOnboarding();
    router.replace('/auth/login' as never);
  }

  async function handleRegister() {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await persistOnboarding();
    router.replace('/auth/register' as never);
  }

  return (
    <SafeAreaView style={[s.root, { backgroundColor: theme.background }]} edges={['top', 'bottom']}>
      {/* Decorative blobs */}
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <View style={[s.blob1, { backgroundColor: `${current.color}08` }]} />
        <View style={[s.blob2, { backgroundColor: `${Colors.primary}06` }]} />
      </View>

      {/* Skip button */}
      {step < STEPS.length - 1 && (
        <TouchableOpacity style={s.skipBtn} onPress={handleSkip} activeOpacity={0.7}>
          <Typography variant="caption" muted>Saltar</Typography>
        </TouchableOpacity>
      )}

      {/* Animated content */}
      <Animated.View
        style={[s.content, { opacity, transform: [{ translateX: slideX }] }]}
      >
        {/* Icon */}
        <View
          style={[
            s.iconWrap,
            {
              backgroundColor: `${current.color}14`,
              borderColor: `${current.color}28`,
            },
          ]}
        >
          <Ionicons name={current.icon} size={IS_SMALL ? 44 : 54} color={current.color} />
        </View>

        {/* Text */}
        <View style={s.textBlock}>
          <Typography style={[s.title, { color: theme.text }]}>
            {current.title}
          </Typography>
          <Typography style={[s.subtitle, { color: theme.textSecondary }]}>
            {current.subtitle}
          </Typography>
        </View>

        {/* Feature pills — step 2 */}
        {current.features && (
          <View style={s.features}>
            {current.features.map(f => (
              <View
                key={f.label}
                style={[s.featurePill, {
                  backgroundColor: `${Colors.primary}10`,
                  borderColor: `${Colors.primary}22`,
                }]}
              >
                <Ionicons
                  name={f.icon as React.ComponentProps<typeof Ionicons>['name']}
                  size={16}
                  color={Colors.primary}
                />
                <Typography style={[s.featureLabel, { color: Colors.primary }]}>
                  {f.label}
                </Typography>
              </View>
            ))}
          </View>
        )}

        {/* CTA buttons — step 3 */}
        {current.isCta && (
          <View style={s.ctaBlock}>
            <TouchableOpacity
              style={[s.primaryBtn, { backgroundColor: Colors.primary }, Shadows.primary]}
              onPress={handleRegister}
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
              onPress={handleLogin}
              activeOpacity={0.8}
            >
              <Ionicons name="log-in-outline" size={20} color={Colors.primary} />
              <Typography style={[s.secondaryBtnLabel, { color: Colors.primary }]}>
                Iniciar sesión
              </Typography>
            </TouchableOpacity>
          </View>
        )}
      </Animated.View>

      {/* Bottom bar: dots + next */}
      <View style={s.bottom}>
        {/* Pagination dots */}
        <View style={s.dots}>
          {STEPS.map((_, i) => (
            <View
              key={i}
              style={[
                s.dot,
                i === step
                  ? { width: 24, height: 8, backgroundColor: Colors.primary }
                  : { width: 8, height: 8, backgroundColor: theme.border },
              ]}
            />
          ))}
        </View>

        {/* Next button (hidden on last step) */}
        {step < STEPS.length - 1 ? (
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
    position: 'absolute', width: 300, height: 300, borderRadius: 150,
    top: -60, right: -60,
  },
  blob2: {
    position: 'absolute', width: 220, height: 220, borderRadius: 110,
    bottom: 100, left: -50,
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
    gap: IS_SMALL ? 20 : 28,
  },

  iconWrap: {
    width: IS_SMALL ? 100 : 120,
    height: IS_SMALL ? 100 : 120,
    borderRadius: IS_SMALL ? 32 : 38,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },

  textBlock: { alignItems: 'center', gap: 10 },
  title: {
    fontSize: IS_SMALL ? FontSizes['2xl'] : 28,
    fontWeight: FontWeights.extrabold,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: FontSizes.md,
    textAlign: 'center',
    lineHeight: 23,
    fontWeight: FontWeights.regular,
    paddingHorizontal: 8,
  },

  features: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
  },
  featurePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  featureLabel: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold,
  },

  ctaBlock: { width: '100%', gap: 12 },
  primaryBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, paddingVertical: IS_SMALL ? 14 : 16, borderRadius: BorderRadius.xl,
  },
  primaryBtnLabel: {
    color: '#fff', fontSize: FontSizes.base, fontWeight: FontWeights.bold,
  },
  secondaryBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, paddingVertical: IS_SMALL ? 14 : 16,
    borderRadius: BorderRadius.xl, borderWidth: 1.5,
  },
  secondaryBtnLabel: {
    fontSize: FontSizes.base, fontWeight: FontWeights.semibold,
  },

  bottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingBottom: IS_SMALL ? Spacing.md : Spacing.lg,
    paddingTop: Spacing.md,
  },
  dots: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  dot: { borderRadius: 4 },
  nextBtn: {
    width: 52, height: 52, borderRadius: 26,
    alignItems: 'center', justifyContent: 'center',
  },
});
