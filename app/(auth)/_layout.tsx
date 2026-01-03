import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" options={{ headerShown: true, title: 'Inscription' }} />
      <Stack.Screen name="verify-otp" options={{ headerShown: true, title: 'Vérification' }} />
    </Stack>
  );
}
