/**
 * Design Tokens - MBOTAMAPAY Mobile
 * Système centralisé de tokens adapté du frontend web
 */

export const designTokens = {
  colors: {
    // Primary Colors - Vibrant Blue
    primary: {
      main: '#3366FF',
      light: '#5C85FF',
      dark: '#1E40AF',
      foreground: '#FFFFFF',
    },
    // Secondary Colors
    secondary: {
      main: '#EEF2FF',
      foreground: '#3366FF',
    },
    // Status Colors
    success: {
      main: '#22C55E',
      light: '#DCFCE7',
      foreground: '#FFFFFF',
    },
    warning: {
      main: '#F59E0B',
      light: '#FEF3C7',
      foreground: '#78350F',
    },
    destructive: {
      main: '#EF4444',
      light: '#FEE2E2',
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
    sm: 10,
    md: 12,
    lg: 14,
    xl: 18,
    '2xl': 24,
    full: 9999,
  },

  typography: {
    fontSize: {
      xs: 12,
      sm: 14,
      base: 16,
      lg: 18,
      xl: 20,
      '2xl': 24,
      '3xl': 30,
      '4xl': 36,
    },
    fontWeight: {
      regular: '400' as const,
      medium: '500' as const,
      semibold: '600' as const,
      bold: '700' as const,
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
  },

  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 3,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.15,
      shadowRadius: 15,
      elevation: 5,
    },
    primary: {
      shadowColor: '#3366FF',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
  },

  animation: {
    duration: {
      fast: 150,
      normal: 300,
      slow: 500,
      slower: 1000,
    },
  },
} as const;

// Light theme colors
export const lightTheme = {
  primary: designTokens.colors.primary.main,
  primaryLight: designTokens.colors.primary.light,
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
  warning: designTokens.colors.warning.main,
  warningLight: designTokens.colors.warning.light,
  destructive: designTokens.colors.destructive.main,
  destructiveLight: designTokens.colors.destructive.light,
};

// Dark theme colors
export const darkTheme = {
  primary: '#5C85FF',
  primaryLight: '#7C9FFF',
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
  warning: '#FBBF24',
  warningLight: '#78350F',
  destructive: '#F87171',
  destructiveLight: '#7F1D1D',
};

export type Theme = typeof lightTheme;
