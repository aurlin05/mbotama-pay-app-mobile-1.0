import { useEffect, useState } from 'react';
import { Stack, router } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as ExpoSplashScreen from 'expo-splash-screen';
import { useAuthStore } from '../src/store/authStore';
import { useOnboardingStore } from '../src/store/onboardingStore';
import { SplashScreen } from '../src/components/ui/SplashScreen';
import { Onboarding } from '../src/components/onboarding';

ExpoSplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [appReady, setAppReady] = useState(false);
  const [showCustomSplash, setShowCustomSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  const hasSeenOnboarding = useOnboardingStore((state) => state.hasSeenOnboarding);
  const checkOnboardingStatus = useOnboardingStore((state) => state.checkOnboardingStatus);
  const completeOnboarding = useOnboardingStore((state) => state.completeOnboarding);

  useEffect(() => {
    const prepare = async () => {
      try {
        const [_, hasCompleted] = await Promise.all([
          checkAuth(),
          checkOnboardingStatus(),
        ]);
        setShowOnboarding(!hasCompleted);
      } catch (e) {
        console.warn('Initialization failed:', e);
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

  const handleOnboardingComplete = async () => {
    await completeOnboarding();
    setShowOnboarding(false);
  };

  if (!appReady) {
    return null;
  }

  if (showCustomSplash) {
    return <SplashScreen onComplete={handleSplashComplete} minDuration={2500} />;
  }

  if (showOnboarding) {
    return (
      <SafeAreaProvider>
        <Onboarding onComplete={handleOnboardingComplete} />
      </SafeAreaProvider>
    );
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
