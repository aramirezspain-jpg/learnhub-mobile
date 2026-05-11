// Sistema de diseño LearnHub — Premium Education App

export const Colors = {
  // ── Marca ──────────────────────────────────────────────────
  primary: '#6366F1',       // Indigo principal
  primaryLight: '#818CF8',
  primaryDark: '#4F46E5',
  secondary: '#8B5CF6',     // Violeta secundario
  accent: '#F59E0B',        // Ámbar — logros y progreso
  accentLight: '#FCD34D',

  // ── Colores semánticos ─────────────────────────────────────
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',

  // ── Colores por nivel ──────────────────────────────────────
  nivel1: '#6366F1',        // Fundamentos — indigo
  nivel2: '#8B5CF6',        // Formación — violeta
  nivel3: '#F59E0B',        // Profundización — ámbar

  // ── Tema oscuro ────────────────────────────────────────────
  dark: {
    text: '#EEEEF5',
    textSecondary: '#8080A0',
    textMuted: '#50507A',
    background: '#0D0D18',
    surface: '#161624',
    card: '#1F1F32',
    cardHover: '#252540',
    border: '#2A2A42',
    borderLight: '#35355A',
    tint: '#818CF8',
    icon: '#8080A0',
    tabIconDefault: '#50507A',
    tabIconSelected: '#818CF8',
    tabBar: '#0D0D18',
    tabBarBorder: '#1A1A2E',
    inputBg: '#1F1F32',
    overlay: 'rgba(0,0,0,0.7)',
    // Backward compat
    background_key: '#0D0D18',
  },

  // ── Tema claro ─────────────────────────────────────────────
  light: {
    text: '#1E1E2E',
    textSecondary: '#5A5A7A',
    textMuted: '#9090B0',
    background: '#F4F4F8',
    surface: '#FFFFFF',
    card: '#FFFFFF',
    cardHover: '#F8F8FC',
    border: '#E4E4EF',
    borderLight: '#EDEDF5',
    tint: '#6366F1',
    icon: '#6060A0',
    tabIconDefault: '#9090B0',
    tabIconSelected: '#6366F1',
    tabBar: '#FFFFFF',
    tabBarBorder: '#E4E4EF',
    inputBg: '#F4F4F8',
    overlay: 'rgba(0,0,0,0.5)',
    background_key: '#F4F4F8',
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
} as const;

export const BorderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  full: 9999,
} as const;

export const FontSizes = {
  xs: 11,
  sm: 13,
  md: 15,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 28,
  '4xl': 32,
  display: 40,
} as const;

export const FontWeights = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
  black: '900' as const,
};

export const Shadows = {
  sm: {
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 12,
  },
  primary: {
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
} as const;

// Alias de compatibilidad para use-theme-color.ts
export type ColorScheme = 'dark' | 'light';
