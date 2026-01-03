export const Colors = {
  light: {
    primary: '#1E40AF',
    primaryLight: '#3B82F6',
    secondary: '#F59E0B',
    background: '#F8FAFC',
    surface: '#FFFFFF',
    text: '#1E293B',
    textSecondary: '#64748B',
    border: '#E2E8F0',
    error: '#EF4444',
    success: '#22C55E',
    warning: '#F59E0B',
  },
  dark: {
    primary: '#3B82F6',
    primaryLight: '#60A5FA',
    secondary: '#FBBF24',
    background: '#0F172A',
    surface: '#1E293B',
    text: '#F8FAFC',
    textSecondary: '#94A3B8',
    border: '#334155',
    error: '#F87171',
    success: '#4ADE80',
    warning: '#FBBF24',
  },
};

export type ColorScheme = keyof typeof Colors;
