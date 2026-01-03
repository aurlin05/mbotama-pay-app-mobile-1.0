import { useColorScheme } from 'react-native';
import { Colors } from '../constants/colors';

export function useColors() {
  const colorScheme = useColorScheme() ?? 'light';
  return Colors[colorScheme];
}
