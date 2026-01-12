import { Stack } from 'expo-router';
import { useTheme } from '../../src/hooks/useTheme';

export default function ProfileLayout() {
  const { theme } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: theme.background },
        headerTintColor: theme.foreground,
        headerTitleStyle: { fontWeight: '600' },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: theme.background },
      }}
    >
      <Stack.Screen
        name="kyc"
        options={{ title: 'Vérification KYC', headerBackTitle: 'Retour' }}
      />
      <Stack.Screen
        name="security"
        options={{ title: 'Sécurité', headerBackTitle: 'Retour' }}
      />
      <Stack.Screen
        name="help"
        options={{ title: "Centre d'aide", headerBackTitle: 'Retour' }}
      />
      <Stack.Screen
        name="terms"
        options={{ title: "Conditions d'utilisation", headerBackTitle: 'Retour' }}
      />
      <Stack.Screen
        name="privacy"
        options={{ title: 'Confidentialité', headerBackTitle: 'Retour' }}
      />
    </Stack>
  );
}
