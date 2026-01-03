import { useColorScheme } from 'react-native';
import { lightTheme, darkTheme, designTokens, type Theme } from '../constants/theme';

export function useTheme() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const theme: Theme = isDark ? darkTheme : lightTheme;
  
  return {
    theme,
    isDark,
    tokens: designTokens,
  };
}

export { designTokens, lightTheme, darkTheme };
