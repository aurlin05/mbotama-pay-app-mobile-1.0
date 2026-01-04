/**
 * Design Tokens - MBOTAMAPAY Mobile
 * Système centralisé de tokens adapté du frontend web
 * Version 2.0 - Enhanced Design System
 */

export const designTokens = {
  colors: {
    // Primary Colors - Vibrant Blue
    primary: {
      main: '#3366FF',
      light: '#5C85FF',
      lighter: '#EEF2FF',
      dark: '#1E40AF',
      darker: '#1E3A8A',
      foreground: '#FFFFFF',
    },
    // Secondary Colors
    secondary: {
      main: '#EEF2FF',
      foreground: '#3366FF',
    },
    // Accent Colors (vibrant)
    accentColors: {
      orange: '#F59E0B',
      purple: '#8B5CF6',
      pink: '#EC4899',
      teal: '#14B8A6',
    },
    // Status Colors
    success: {
      main: '#22C55E',
      light: '#DCFCE7',
      dark: '#16A34A',
      foreground: '#FFFFFF',
    },
    warning: {
      main: '#F59E0B',
      light: '#FEF3C7',
      dark: '#D97706',
      foreground: '#78350F',
    },
    destructive: {
      main: '#EF4444',
      light: '#FEE2E2',
      dark: '#DC2626',
      foreground: '#FFFFFF',
    },
    info: {
      main: '#3B82F6',
      light: '#DBEAFE',
      foreground: '#FFFFFF',
    },
    // Neutral Colors
    background: {
      light: '#F8FAFC',
      dark: '#0F172A',
    },
    surface: {
      light: '#FFFFFF',
      dark: '#1E293B',
    },
    foreground: {
      light: '#1E293B',
      dark: '#F8FAFC',
    },
    muted: {
      light: '#F1F5F9',
      dark: '#334155',
      foreground: {
        light: '#64748B',
        dark: '#94A3B8',
      },
    },
    accent: {
      light: '#E0E7FF',
      dark: '#312E81',
    },
    border: {
      light: '#E2E8F0',
      dark: '#334155',
    },
    // Gradient presets
    gradients: {
      primary: ['#3366FF', '#1E40AF', '#2563EB'],
      success: ['#22C55E', '#16A34A'],
      sunset: ['#F59E0B', '#EC4899'],
      ocean: ['#3B82F6', '#14B8A6'],
      purple: ['#8B5CF6', '#EC4899'],
    },
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    '2xl': 48,
    '3xl': 64,
    '4xl': 96,
  },

  borderRadius: {
    none: 0,
    xs: 6,
    sm: 10,
    md: 12,
    lg: 14,
    xl: 18,
    '2xl': 24,
    '3xl': 32,
    full: 9999,
  },

  typography: {
    fontSize: {
      xs: 11,
      sm: 13,
      base: 15,
      md: 16,
      lg: 18,
      xl: 20,
      '2xl': 24,
      '3xl': 30,
      '4xl': 36,
      '5xl': 48,
    },
    fontWeight: {
      regular: '400' as const,
      medium: '500' as const,
      semibold: '600' as const,
      bold: '700' as const,
      extrabold: '800' as const,
    },
    lineHeight: {
      tight: 1.2,
      snug: 1.35,
      normal: 1.5,
      relaxed: 1.65,
      loose: 2,
    },
    letterSpacing: {
      tight: -0.5,
      normal: 0,
      wide: 0.5,
      wider: 1,
    },
  },

  shadows: {
    none: {
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
    xs: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.03,
      shadowRadius: 2,
      elevation: 1,
    },
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 16,
      elevation: 8,
    },
    xl: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.15,
      shadowRadius: 24,
      elevation: 12,
    },
    '2xl': {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 16 },
      shadowOpacity: 0.2,
      shadowRadius: 32,
      elevation: 16,
    },
    primary: {
      shadowColor: '#3366FF',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.35,
      shadowRadius: 12,
      elevation: 8,
    },
    success: {
      shadowColor: '#22C55E',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
    },
    glow: {
      shadowColor: '#3366FF',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.4,
      shadowRadius: 20,
      elevation: 10,
    },
  },

  animation: {
    duration: {
      instant: 100,
      fast: 150,
      normal: 250,
      slow: 400,
      slower: 600,
      slowest: 1000,
    },
    easing: {
      linear: 'linear',
      easeIn: 'ease-in',
      easeOut: 'ease-out',
      easeInOut: 'ease-in-out',
      spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      bounce: 'cubic-bezier(0.68, -0.6, 0.32, 1.6)',
    },
    scale: {
      pressed: 0.97,
      hover: 1.02,
      active: 0.95,
    },
  },

  // Component-specific tokens
  components: {
    button: {
      height: {
        sm: 40,
        md: 48,
        lg: 56,
      },
      iconSize: {
        sm: 16,
        md: 20,
        lg: 24,
      },
    },
    input: {
      height: {
        sm: 40,
        md: 48,
        lg: 56,
      },
    },
    card: {
      padding: {
        sm: 12,
        md: 16,
        lg: 20,
        xl: 24,
      },
    },
    avatar: {
      size: {
        xs: 24,
        sm: 32,
        md: 40,
        lg: 56,
        xl: 80,
        '2xl': 120,
      },
    },
    badge: {
      height: {
        sm: 20,
        md: 24,
        lg: 28,
      },
    },
    bottomNav: {
      height: 68,
      borderRadius: 35,
    },
  },
} as const;

// Light theme colors
export const lightTheme = {
  primary: designTokens.colors.primary.main,
  primaryLight: designTokens.colors.primary.light,
  primaryLighter: designTokens.colors.primary.lighter,
  primaryDark: designTokens.colors.primary.dark,
  primaryForeground: designTokens.colors.primary.foreground,
  secondary: designTokens.colors.secondary.main,
  secondaryForeground: designTokens.colors.secondary.foreground,
  background: designTokens.colors.background.light,
  surface: designTokens.colors.surface.light,
  foreground: designTokens.colors.foreground.light,
  muted: designTokens.colors.muted.light,
  mutedForeground: designTokens.colors.muted.foreground.light,
  accent: designTokens.colors.accent.light,
  border: designTokens.colors.border.light,
  success: designTokens.colors.success.main,
  successLight: designTokens.colors.success.light,
  successDark: designTokens.colors.success.dark,
  warning: designTokens.colors.warning.main,
  warningLight: designTokens.colors.warning.light,
  warningDark: designTokens.colors.warning.dark,
  destructive: designTokens.colors.destructive.main,
  destructiveLight: designTokens.colors.destructive.light,
  destructiveDark: designTokens.colors.destructive.dark,
  info: designTokens.colors.info.main,
  infoLight: designTokens.colors.info.light,
  // Accent colors
  accentOrange: designTokens.colors.accentColors.orange,
  accentPurple: designTokens.colors.accentColors.purple,
  accentPink: designTokens.colors.accentColors.pink,
  accentTeal: designTokens.colors.accentColors.teal,
  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
};

// Dark theme colors
export const darkTheme = {
  primary: '#5C85FF',
  primaryLight: '#7C9FFF',
  primaryLighter: '#1E293B',
  primaryDark: '#3366FF',
  primaryForeground: '#FFFFFF',
  secondary: '#1E293B',
  secondaryForeground: '#F8FAFC',
  background: designTokens.colors.background.dark,
  surface: designTokens.colors.surface.dark,
  foreground: designTokens.colors.foreground.dark,
  muted: designTokens.colors.muted.dark,
  mutedForeground: designTokens.colors.muted.foreground.dark,
  accent: designTokens.colors.accent.dark,
  border: designTokens.colors.border.dark,
  success: '#4ADE80',
  successLight: '#166534',
  successDark: '#22C55E',
  warning: '#FBBF24',
  warningLight: '#78350F',
  warningDark: '#F59E0B',
  destructive: '#F87171',
  destructiveLight: '#7F1D1D',
  destructiveDark: '#EF4444',
  info: '#60A5FA',
  infoLight: '#1E3A8A',
  // Accent colors
  accentOrange: '#FBBF24',
  accentPurple: '#A78BFA',
  accentPink: '#F472B6',
  accentTeal: '#2DD4BF',
  // Overlay
  overlay: 'rgba(0, 0, 0, 0.7)',
  overlayLight: 'rgba(0, 0, 0, 0.5)',
};

export type Theme = typeof lightTheme;
export type DesignTokens = typeof designTokens;
