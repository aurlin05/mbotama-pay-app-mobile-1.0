import { useEffect, useState } from 'react';
import { Stack, router } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as ExpoSplashScreen from 'expo-splash-screen';
import { useAuthStore } from '../src/store/authStore';
import { SplashScreen } from '../src/components/ui/SplashScreen';

ExpoSplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [appReady, setAppReady] = useState(false);
  const [showCustomSplash, setShowCustomSplash] = useState(true);
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    const prepare = async () => {
      try {
        await checkAuth();
      } catch (e) {
        console.warn('Auth check failed:', e);
      } finally {
        setAppReady(true);
        await ExpoSplashScreen.hideAsync();
      }
    };
    prepare();
  }, []);

  const handleSplashComplete = () => {
    setShowCustomSplash(false);
  };

  if (!appReady) {
    return null;
  }

  if (showCustomSplash) {
    return <SplashScreen onComplete={handleSplashComplete} minDuration={2500} />;
  }

  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" options={{ animation: 'fade' }} />
        <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
      </Stack>
    </SafeAreaProvider>
  );
}
