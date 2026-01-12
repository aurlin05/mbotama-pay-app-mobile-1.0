import { Stack } from 'expo-router';
import { useTheme } from '../../src/hooks/useTheme';

export default function TransferLayout() {
  const { theme } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: theme.background },
        headerTintColor: theme.foreground,
        headerTitleStyle: { fontWeight: '600' },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="recipient"
        options={{ title: 'Destinataire', headerBackTitle: 'Retour' }}
      />
      <Stack.Screen
        name="amount"
        options={{ title: 'Montant', headerBackTitle: 'Retour' }}
      />
      <Stack.Screen
        name="preview"
        options={{ title: 'Confirmation', headerBackTitle: 'Retour' }}
      />
      <Stack.Screen
        name="success"
        options={{ title: 'Succès', headerShown: false }}
      />
    </Stack>
  );
}
